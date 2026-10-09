import { describe, expect, it } from 'vitest';
import { Arena, type Enemy, type Controls } from '../src/game/core/arena';
import { ENEMIES, type EnemyType } from '../src/game/data/enemies';
import { BUFFS } from '../src/game/data/buffs';

function game() { const a = new Arena(() => .5); a.update(0, { confirm: true }); return a; }
function advance(a: Arena, ms: number, controls: Controls = {}) {
  for (let left = ms; left > 0; left -= 10) a.update(Math.min(10, left), controls);
}
function enemy(a: Arena, x = 580, y = 330, type: EnemyType = 'npc'): Enemy {
  const e = { id: a.enemies.length, x, y, hp: ENEMIES[type].hp, type, nextHit: 0, nextShot: Infinity };
  a.enemies.push(e); return e;
}

// Exercise integrated rules with real simulation updates; no Phaser dependency.
describe('arena combat', () => {
  it('normalizes diagonal movement and clamps the arena bounds', () => {
    const a = game(), b = game(); a.update(100, { x: 1 }); b.update(100, { x: 1, y: 1 });
    expect(Math.hypot(b.pos.x - 480, b.pos.y - 330)).toBeCloseTo(a.pos.x - 480);
    a.pos.x = 934; a.pos.y = 574; a.update(100, { x: 1, y: 1 });
    expect(a.pos).toEqual({ x: 935, y: 575 });
  });
  it('fires at the nearest enemy and creates collectible XP instead of instant XP', () => {
    const a = game(); enemy(a, 800).hp = 1000; const target = enemy(a); target.hp = 18;
    advance(a, 220);
    expect(a.enemies).not.toContain(target); expect(a.kills).toBe(1);
    expect(a.xp.xp).toBe(0); expect(a.drops).toHaveLength(1);
    a.pos = { ...a.drops[0] }; a.update(10);
    expect(a.drops).toHaveLength(0); expect(a.xp.xp).toBe(8);
  });
  it('applies contact damage, armor and exactly one Aura penalty', () => {
    const a = game(); a.aura.change(60); a.buffs.drip = 3; enemy(a, 480).hp = 1000;
    a.update(10, { flex: true });
    expect(a.hp).toBe(95); expect(a.aura.value).toBe(40); expect(a.flex.state).toBe('cooldown');
    advance(a, 100); expect(a.hp).toBe(95);
  });
  it('stops immediately on lethal damage without awarding a coincident level or win', () => {
    const a = game(); a.hp = 1; a.wave = 5; a.waveClock = 50000; a.bossSpawned = true; a.bossDefeated = true;
    a.drops.push({ ...a.pos, xp: 100 }); enemy(a, 480);
    a.update(10); expect(a.mode).toBe('dead'); expect(a.xp.level).toBe(1);
  });
  it('Haters fire dodgeable projectiles that damage the player', () => {
    const a = game(); const e = enemy(a, 680, 330, 'hater'); e.hp = 10000; e.nextShot = 0;
    a.update(10); expect(a.shots.some(s => s.hostile)).toBe(true);
    advance(a, 1150); expect(a.hp).toBeLessThan(100);
  });
  it('Sigma Focus slows enemies for 3 seconds with a 22 second cooldown', () => {
    const a = game(), b = game(); enemy(a, 800).hp = 10000; enemy(b, 800).hp = 10000;
    a.update(100, { focus: true }); b.update(100);
    expect(800 - a.enemies[0].x).toBeCloseTo((800 - b.enemies[0].x) * .62);
    expect(a.focusUntil).toBe(3000); expect(a.focusReady).toBe(22000);
    a.update(100, { focus: true }); expect(a.focusUntil).toBe(3000);
    a.clock = 22000; a.update(0, { focus: true }); expect(a.focusUntil).toBe(25000);
  });
});

describe('integrated FLEX', () => {
  it('locks movement and all new attacks for one second, rewards 3 nearby enemies and pushes them away', () => {
    const a = game();
    for (const y of [250, 330, 410]) { const e = enemy(a, 610, y); e.hp = 10000; e.nextHit = Infinity; }
    a.buffs['mewing-jaw'] = 1; a.buffs['ohio-orbiter'] = 1;
    a.update(0, { flex: true }); advance(a, 999, { x: 1 });
    expect(a.pos.x).toBe(480); expect(a.shots).toHaveLength(0); expect(a.aura.value).toBe(0);
    expect(a.enemies.slice(0, 3).every(e => e.hp === 10000)).toBe(true);
    const before = a.enemies[1].x; a.update(1);
    expect(a.aura.value).toBe(25); expect(a.enemies[1].x).toBeGreaterThan(before + 80);
    expect(a.flex.state).toBe('cooldown'); expect(a.flex.cooldownUntil).toBeCloseTo(16000);
    a.update(0, { flex: true }); expect(a.flex.state).toBe('cooldown');
    a.clock = 16000; a.update(0, { flex: true }); expect(a.flex.state).toBe('charging');
  });
  it('does not award Aura with only two enemies or with an enemy outside 145px', () => {
    for (const count of [2, 3]) {
      const a = game(); a.clock = 1000;
      enemy(a, 550).nextHit = Infinity; enemy(a, 560).nextHit = Infinity;
      if (count === 3) enemy(a, 700).nextHit = Infinity;
      a.flex.tryStart(0); a.update(1);
      expect(a.aura.value).toBe(0); expect(a.feedback).toContain('No audience');
    }
  });
  it('counts an enemy exactly at 145px and interrupts without a later reward', () => {
    const a = game(); enemy(a, 625); expect(a.nearby).toBe(1);
    a.enemies = []; for (let i = 0; i < 3; i++) enemy(a, 480, 330).nextHit = i ? Infinity : 0;
    a.aura.change(50); a.update(10, { flex: true });
    a.enemies = []; advance(a, 1100);
    expect(a.aura.value).toBe(30); expect(a.feedback).toContain('interrupted');
  });
});

describe('upgrades', () => {
  it('pauses the complete simulation and queues every level from one pickup', () => {
    const a = game(); a.drops.push({ ...a.pos, xp: 100 }); a.update(10);
    expect(a.mode).toBe('upgrades'); expect(a.pendingUpgrades).toBe(3);
    expect(new Set(a.choices.map(b => b.id)).size).toBe(3);
    const before = JSON.stringify(a); a.update(250, { x: 1, flex: true, focus: true }); expect(JSON.stringify(a)).toBe(before);
    for (let i = 0; i < 3; i++) a.update(0, { choice: 0 });
    expect(a.mode).toBe('playing'); expect(Object.values(a.buffs).reduce((x, y) => x + y, 0)).toBe(3);
  });
  it('increases maximum HP and heals, excludes capped upgrades, and handles exhausted choices', () => {
    const a = game(); a.hp = 50; a.mode = 'upgrades'; a.pendingUpgrades = 1;
    a.choices = [BUFFS.find(b => b.id === 'thick-skin')!]; a.update(0, { choice: 0 });
    expect(a.hp).toBe(70); expect(a.stats.maxHp).toBe(120);
    for (const b of BUFFS) a.buffs[b.id] = b.maxStacks;
    a.buffs.speed = 2; a.drops.push({ ...a.pos, xp: 100 }); a.update(1);
    expect(a.choices.map(b => b.id)).toEqual(['speed']); a.update(0, { choice: 0 });
    expect(a.mode).toBe('playing'); expect(a.pendingUpgrades).toBe(0); expect(a.buffs.speed).toBe(3);
  });
  it('Mewing Jaw damages nearby enemies and Ohio Orbiter damages on contact', () => {
    const a = game(); a.buffs['mewing-jaw'] = 1; const e = enemy(a, 550); e.hp = 100;
    a.update(1); expect(e.hp).toBe(74); expect(a.jawUntil).toBeGreaterThan(a.clock);
    const b = game(); b.buffs['ohio-orbiter'] = 1; const t = enemy(b, 556); t.hp = 100;
    b.update(1); expect(t.hp).toBe(86);
  });
  it('applies damage upgrades, critical hits and Burst to emitted projectiles', () => {
    const a = game(); a.clock = 8000; a.buffs.sigma = 1; a.buffs.alpha = 1;
    a.aura.change(100, 8000); a.aura.change(10, 8000); enemy(a, 610).hp = 1000;
    a.update(1);
    expect(a.shots[0].damage).toBeCloseTo(18 * 1.1 * 1.2 * 1.15 * 1.015);
    const b = new Arena(() => 0); b.update(0, { confirm: true });
    b.clock = 8000; b.buffs.mewing = 1; enemy(b, 610).hp = 1000; b.update(1);
    expect(b.shots[0].damage).toBe(36);
  });
  it('Locked In increases actual auto-fire cadence and taking damage resets the clean streak', () => {
    const a = game(), b = game(); a.clock = b.clock = 8000; a.buffs['locked-in'] = 2;
    enemy(a, 900).hp = 10000; enemy(b, 900).hp = 10000;
    advance(a, 300); advance(b, 300);
    expect(a.shots).toHaveLength(2); expect(b.shots).toHaveLength(1);
    enemy(a, a.pos.x, a.pos.y); a.update(1);
    expect(a.stats.fireRate).toBe(1); expect(a.lastDamageAt).toBe(a.clock);
  });
  it('Six Seven fires seven radial shots on the 67th kill', () => {
    const a = game(); a.buffs['six-seven'] = 1; a.kills = 66; enemy(a, 530).hp = 1;
    advance(a, 70); expect(a.kills).toBe(67);
    expect(a.shots).toHaveLength(7);
    expect(new Set(a.shots.map(s => s.vx)).size).toBeGreaterThan(3);
  });
});

describe('wave and restart lifecycle', () => {
  it('transitions through five waves, spawns the boss once and requires both the timer and boss kill', () => {
    const a = game();
    for (let wave = 1; wave < 5; wave++) {
      a.waveClock = 50000; a.update(1); expect(a.mode).toBe('between');
      a.update(0, { confirm: true }); expect(a.wave).toBe(wave + 1);
    }
    a.waveClock = 12000; a.update(1); const boss = a.enemies.find(e => e.type === 'boss')!;
    expect(boss).toBeDefined(); a.waveClock = 50000; a.update(1); expect(a.mode).toBe('playing');
    expect(a.enemies.filter(e => e.type === 'boss')).toHaveLength(1);
    boss.x = 530; boss.y = 330; boss.hp = 1; boss.nextShot = Infinity;
    a.shots = []; advance(a, 500);
    expect(a.bossDefeated).toBe(true); expect(a.mode).toBe('win');
    a.update(0, { confirm: true });
    expect(a.mode).toBe('playing'); expect(a.bossSpawned).toBe(false); expect(a.bossDefeated).toBe(false);
    expect(a.wave).toBe(1); expect(a.kills).toBe(0); expect(a.hp).toBe(100); expect(a.clock).toBe(0);
  });
  it('waits for the wave timer if the boss is killed early and resets all run state after death', () => {
    const a = game(); a.wave = 5; a.bossSpawned = true; a.bossDefeated = true; a.update(1); expect(a.mode).toBe('playing');
    a.mode = 'dead'; a.buffs.speed = 3; a.aura.change(100); a.focusReady = 22000; a.pendingUpgrades = 2;
    a.update(0, { confirm: true });
    expect(a.buffs.speed).toBe(0); expect(a.aura.burstUntil).toBe(0); expect(a.focusReady).toBe(0); expect(a.pendingUpgrades).toBe(0);
  });
  it('is consistent for equivalent small and large frames and ignores inactive-tab gaps', () => {
    const a = game(), b = game(); advance(a, 200, { x: 1 }); b.update(200, { x: 1 });
    expect(a.pos.x).toBeCloseTo(b.pos.x); expect(a.clock).toBeCloseTo(b.clock);
    b.update(60000); expect(b.clock).toBeCloseTo(450);
  });
});
