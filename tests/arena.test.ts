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
    expect(a.hp).toBe(95); expect(a.aura.value).toBe(60); expect(a.flex.state).toBe('farming');
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
  it('has a single charged FLEX action, with no separate Focus control',()=>{
    const a=game();
    a.update(0,{flex:true});expect(a.flex.state).toBe('farming');
    a.aura.change(100);a.update(0,{flex:true});
    expect(a.flex.state).toBe('active');expect(a.aura.value).toBe(0);
    expect(a.flex.variant).toBe('sigma');
    expect(a.flexSuccesses).toBe(1);expect(a.auraBursts).toBe(1);
  });
});

describe('FLEX Ultimate gameplay',()=>{
  it('alpha is invulnerable and moves/tramples without killing bosses instantly',()=>{
    const a=new Arena(()=>.5,'alpha');a.start();a.aura.change(100);
    a.update(0,{flex:true});expect(a.flex.variant).toBe('alpha');
    const e=enemy(a,a.pos.x+17,a.pos.y,'npc');e.hp=27;e.nextHit=0;
    a.update(100,{x:1});
    expect(a.hp).toBe(120);expect(a.pos.x).toBeGreaterThan(480);
    expect(a.enemies).not.toContain(e);
    const boss=enemy(a,a.pos.x+10,a.pos.y,'boss');boss.nextHit=0;
    for(let i=0;i<50;i++)a.update(100);
    expect(boss.hp).toBeGreaterThanOrEqual(ENEMIES.boss.hp*.75);
    expect(a.flex.state).toBe('farming');
  });
  it('sigma rapid fire and rizz slow reflect default hero affinity',()=>{
    const sigma=game();sigma.aura.change(100);sigma.update(0,{flex:true});
    enemy(sigma,900).hp=10000; sigma.update(100);
    expect(sigma.shots[0].piercing).toBe(true);
    const rizz=new Arena(()=>.5,'rizzler');rizz.start();
    rizz.aura.change(100);rizz.update(0,{flex:true});
    const target=enemy(rizz,600);target.hp=100;
    rizz.update(100);
    expect(target.rizzSlowUntil).toBeGreaterThan(rizz.clock);
    expect(target.hp).toBeLessThan(100);
  });
  it('essence pickups choose dominant FLEX family without occupying buff slots',()=>{
    const a=game();a.essenceDrops=[{...a.pos,affinity:'alpha'},{...a.pos,affinity:'alpha'}];
    a.update(5);expect(a.affinities.alpha).toBe(2);expect(a.flexVariant).toBe('alpha');
    expect(Object.values(a.buffs).every(v=>v===0)).toBe(true);
    a.aura.change(100);a.update(0,{flex:true});expect(a.flex.variant).toBe('alpha');
  });
});

describe('upgrades', () => {
  it('pauses the complete simulation and queues every level from one pickup', () => {
    const a = game(); a.drops.push({ ...a.pos, xp: 100 }); a.update(10);
    expect(a.mode).toBe('upgrades'); expect(a.pendingUpgrades).toBe(3);
    expect(new Set(a.choices.map(b => b.id)).size).toBe(3);
    const before = JSON.stringify(a); a.update(250, { x: 1, flex: true }); expect(JSON.stringify(a)).toBe(before);
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
    a.aura.change(100, 8000); a.update(0,{flex:true}); enemy(a, 610).hp = 1000;
    a.update(1);
    expect(a.shots[0].damage).toBeGreaterThan(18 * 1.1 * 1.15);
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
    a.mode = 'dead'; a.buffs.speed = 3; a.aura.change(100); a.pendingUpgrades = 2;
    a.update(0, { confirm: true });
    expect(a.buffs.speed).toBe(0);expect(a.aura.value).toBe(0);expect(a.flex.state).toBe('farming');expect(a.pendingUpgrades).toBe(0);
  });
  it('is consistent for equivalent small and large frames and ignores inactive-tab gaps', () => {
    const a = game(), b = game(); advance(a, 200, { x: 1 }); b.update(200, { x: 1 });
    expect(a.pos.x).toBeCloseTo(b.pos.x); expect(a.clock).toBeCloseTo(b.clock);
    b.update(60000); expect(b.clock).toBeCloseTo(450);
  });
});
