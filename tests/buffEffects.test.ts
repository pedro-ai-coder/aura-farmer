import { describe, expect, it } from 'vitest';
import { Arena, type Enemy, type Shot } from '../src/game/core/arena';
import { BuffEffects, findBounce, firstHitDamage, rizzPulse, rizzSpeed } from '../src/game/core/buffEffects';
import { combatStats } from '../src/game/core/combat';
import { BUFFS, emptyBuffLevels, type BuffId } from '../src/game/data/buffs';
import { ENEMIES, type EnemyType } from '../src/game/data/enemies';

const additions: [BuffId, string, number][] = [
  ['crash-out', 'RARE', 1], ['skibidi-bounce', 'EPIC', 1], ['delulu', 'EPIC', 1],
  ['touch-grass', 'COMMON', 1], ['mogged', 'COMMON', 2], ['rizz-aura', 'RARE', 1],
];
function game() { const a = new Arena(() => .5); a.update(0, { confirm: true }); return a; }
function enemy(a: Arena, id: number, x = 600, y = 330, type: EnemyType = 'npc'): Enemy {
  const e: Enemy = { id, x, y, type, hp: ENEMIES[type].hp, nextHit: Infinity, nextShot: Infinity };
  a.enemies.push(e); return e;
}
function shot(e: Enemy, damage = 10): Shot { return { x: e.x, y: e.y, vx: 0, vy: 0, damage, ttl: 1000, hostile: false }; }
function hit(a: Arena, e: Enemy, damage = 10) {
  // A controlled projectile hit: prevent unrelated auto-shots from firing.
  (a as unknown as {fireReady:number}).fireReady=Infinity;
  a.shots.push(shot(e, damage)); a.update(1);
}

describe('v0.3 catalog and unchanged baseline', () => {
  it('retains the original buff identities plus five weapon choices', () => {
    expect(BUFFS.slice(0, 10).map(b => b.id)).toEqual(['sigma', 'alpha', 'mewing', 'locked-in', 'drip', 'speed', 'six-seven', 'thick-skin', 'mewing-jaw', 'ohio-orbiter']);
    expect(BUFFS).toHaveLength(18); expect(new Set(BUFFS.map(b => b.id)).size).toBe(18);
    expect(combatStats(emptyBuffLevels(), 0, 0, 8000, 1)).toMatchObject({ damage: 1, incomingDamage: 1, fireRate: 1, critChance: 0, speed: 205 });
  });
  it.each(additions)('%s has the specified rarity/limit and is selectable through XP level-up', (id, rarity, maxStacks) => {
    expect(BUFFS.find(b => b.id === id)).toMatchObject({ rarity, maxStacks });
    const a=game();
    // Test existing and newly chosen passive slots in a LEGAL build. The old
    // test deliberately maxed all 16 simultaneously; that is now forbidden.
    a.buffs[id]=maxStacks-1;
    a.mode='upgrades';a.pendingUpgrades=1;
    a.choices=[BUFFS.find(b=>b.id===id)!];
    a.update(0,{choice:0});
    expect(a.buffs[id]).toBe(maxStacks);
    expect(a.mode).toBe('playing');
    a.drops.push({...a.pos,xp:200});a.update(1);
    expect(a.choices.map(b=>b.id)).not.toContain(id);
  });
});

describe('Crash Out', () => {
  it('uses an inclusive 35% threshold based on current maximum HP', () => {
    const b = emptyBuffLevels(); b['crash-out'] = 1; b['thick-skin'] = 3;
    expect(combatStats(b, 0, 0, 0, 56)).toMatchObject({ damage: 1.4, incomingDamage: 1.2 });
    expect(combatStats(b, 0, 0, 0, 56.01)).toMatchObject({ damage: 1, incomingDamage: 1 });
    expect(combatStats(b, 0, 0, 0, 160)).toMatchObject({ damage: 1, incomingDamage: 1 });
  });
  it('affects actual outgoing shots and applies incoming amplification after armor', () => {
    const a = game(); a.hp = 35; a.buffs['crash-out'] = 1; a.buffs.drip = 3;
    enemy(a, 1, 900); a.update(1); expect(a.shots[0].damage).toBeCloseTo(18 * 1.4);
    enemy(a, 2, 480).nextHit = 0; a.update(1);
    expect(a.hp).toBeCloseTo(35 - (8 - 3) * 1.2);
    a.hp = 36; a.enemies[1].nextHit = 0; a.update(1);
    expect(a.hp).toBe(31); // Threshold evaluated before the hit, not after it.
  });
});

describe('Delulu', () => {
  it('prevents exactly one lethal hit, ignores hits for 1.25s and expires at the boundary', () => {
    const f = new BuffEffects();
    expect(f.receiveDamage(10, 3, 0, true)).toEqual({ hp: 7, ignored: false, saved: false });
    expect(f.deluluUsed).toBe(false);
    expect(f.receiveDamage(7, 7, 100, true)).toEqual({ hp: 1, ignored: false, saved: true });
    expect(f.receiveDamage(1, 100, 1349, true).ignored).toBe(true);
    expect(f.receiveDamage(1, 100, 1350, true).hp).toBe(0);
    f.beginWave(); expect(f.receiveDamage(1, 100, 1351, true).saved).toBe(true);
  });
  it('handles simultaneous contact/projectile hits, preserves Aura during invulnerability and resets only on wave entry', () => {
    const a = game(); a.buffs.delulu = 1; a.hp = 1; a.aura.change(50);
    enemy(a, 1, 480).nextHit = 0; enemy(a, 2, 480).nextHit = 0;
    a.shots.push({ ...shot(a.enemies[0], 100), hostile: true });
    a.update(1, { flex: true });
    expect(a.mode).toBe('playing'); expect(a.hp).toBe(1); expect(a.aura.value).toBe(50);
    expect(a.flex.state).toBe('farming'); expect(a.effects.deluluUsed).toBe(true);
    const deadline = a.effects.invulnerableUntil, lastHit = a.lastDamageAt;
    a.enemies[0].nextHit = 0; a.update(1);
    expect(a.aura.value).toBe(50); expect(a.lastDamageAt).toBe(lastHit);
    a.drops.push({ ...a.pos, xp: 20 }); a.update(1); expect(a.mode).toBe('upgrades');
    a.update(250); expect(a.effects.invulnerableUntil).toBe(deadline);
    a.update(0, { choice: 0 }); expect(a.effects.deluluUsed).toBe(true);
    a.enemies = []; a.waveClock = 50000; a.update(1); expect(a.mode).toBe('between');
    expect(a.effects.deluluUsed).toBe(true);
    a.update(0, { confirm: true }); expect(a.effects.deluluUsed).toBe(false);
    expect(a.effects.invulnerableUntil).toBe(0);
  });
});

describe('Touch Grass', () => {
  it('heals at 8 clean seconds then every 5 seconds, clamps HP and restarts its delay after damage', () => {
    const f = new BuffEffects();
    expect(f.heal(50, 120, 0, 0, true)).toBe(50);
    expect(f.heal(50, 120, 7999, 0, true)).toBe(50);
    expect(f.heal(50, 120, 8000, 0, true)).toBe(52);
    expect(f.heal(52, 120, 12999, 0, true)).toBe(52);
    expect(f.heal(119, 120, 13000, 0, true)).toBe(120);
    f.tookDamage(14000);
    expect(f.heal(100, 120, 21999, 14000, true)).toBe(100);
    expect(f.heal(100, 120, 22000, 14000, true)).toBe(102);
  });
  it('does not grant retroactive ticks when acquired and does nothing without the buff', () => {
    const f = new BuffEffects();
    expect(f.heal(50, 100, 60000, 0, false)).toBe(50);
    expect(f.heal(50, 100, 60001, 0, true)).toBe(52);
    expect(f.heal(52, 100, 60002, 0, true)).toBe(52);
  });
  it('freezes healing during upgrades and intermission and resumes on active time', () => {
    const a = game(); a.hp = 50; a.buffs['touch-grass'] = 1; a.update(1);
    a.clock = 7999; a.mode = 'upgrades'; a.update(250); expect(a.hp).toBe(50); expect(a.clock).toBe(7999);
    a.mode = 'between'; a.update(250); expect(a.hp).toBe(50); expect(a.clock).toBe(7999);
    a.mode = 'playing'; a.update(1); expect(a.hp).toBe(52);
    a.clock = 12999; a.update(1); expect(a.hp).toBe(54);
    enemy(a, 1, 480).nextHit = 0; a.update(1); const hurtHp = a.hp;
    a.enemies = []; a.clock += 7999; a.update(0); expect(a.hp).toBe(hurtHp);
    a.update(1); expect(a.hp).toBe(hurtHp + 2);
  });
});

describe('Mogged', () => {
  it.each(['npc', 'boss'] as EnemyType[])('procs once on a full-health %s, even with simultaneous player hits', type => {
    const a = game(); a.buffs.mogged = 2; const e = enemy(a, 1, 600, 330, type);
    a.shots.push(shot(e, 5), shot(e, 5)); a.update(1);
    expect(e.hp).toBeCloseTo(ENEMIES[type].hp - 6.5 - 5);
    expect(e.playerHit).toBe(true);
  });
  it('does not proc on an already damaged/healed target and works on melee as well as shots', () => {
    const a = game(); const e = enemy(a, 1); e.hp--;
    expect(firstHitDamage(e, 27, 10, 2)).toBe(10);
    e.hp = 27; expect(firstHitDamage(e, 27, 10, 2)).toBe(10);
    a.buffs.mogged = 1; a.buffs['mewing-jaw'] = 1;
    const b = enemy(a, 2, 550, 330, 'beta'); a.update(1);
    expect(b.hp).toBeCloseTo(72 - 26 * 1.15);
  });
});

describe('Skibidi Bounce', () => {
  it('selects the nearest different living enemy within 145px, including the boundary', () => {
    const a = game(); const origin = enemy(a, 1, 600); const far = enemy(a, 2, 745); const near = enemy(a, 3, 650);
    expect(findBounce(shot(origin), origin, a.enemies)).toBe(near);
    near.hp = 0; expect(findBounce(shot(origin), origin, a.enemies)).toBe(far);
    far.x = 745.01; expect(findBounce(shot(origin), origin, a.enemies)).toBeUndefined();
    expect(findBounce({ ...shot(origin), hostile: true }, origin, [near])).toBeUndefined();
    near.hp = 27; expect(findBounce({ ...shot(origin), bounced: true }, origin, [near])).toBeUndefined();
  });
  it('deals 55% projectile damage exactly once, excluding the original enemy and any third hit', () => {
    const a = game(); a.buffs['skibidi-bounce'] = 1;
    const first = enemy(a, 1, 600), second = enemy(a, 2, 640), third = enemy(a, 3, 700);
    hit(a, first, 10);
    expect(first.hp).toBe(17); expect(a.shots).toHaveLength(1);
    expect(a.shots[0]).toMatchObject({ bounced: true, targetId: 2, damage: 5.5 });
    for (let i = 0; i < 15; i++) a.update(10);
    expect(first.hp).toBe(17); expect(second.hp).toBe(21.5); expect(third.hp).toBe(27);
    expect(a.shots).toHaveLength(0);
  });
  it('works on a killing blow and safely expires if the chosen enemy dies in flight', () => {
    const a = game(); a.buffs['skibidi-bounce'] = 1;
    const first = enemy(a, 1), second = enemy(a, 2, 700);
    hit(a, first, 30); expect(a.enemies).not.toContain(first); expect(a.shots[0].targetId).toBe(second.id);
    a.enemies = [];
    for (let i = 0; i < 8; i++) a.update(250);
    expect(a.shots.some(s => s.bounced)).toBe(false);
  });
});

describe('Rizz Aura', () => {
  it('pulses at 12 kills, affects only enemies in range and expires in 2.5s', () => {
    const a = game(); a.buffs['rizz-aura'] = 1; a.kills = 10;
    const first = enemy(a, 1), second = enemy(a, 2), nearby = enemy(a, 3, 610), outside = enemy(a, 4, 800);
    hit(a, first, 30); expect(nearby.rizzSlowUntil).toBeUndefined();
    hit(a, second, 30);
    expect(nearby.rizzSlowUntil).toBe(a.clock + 2500); expect(outside.rizzSlowUntil).toBeUndefined();
    expect(rizzSpeed(nearby, false, a.clock)).toBe(.75);
    expect(rizzSpeed(nearby, true, a.clock)).toBe(.85);
    expect(rizzSpeed(nearby, false, a.clock + 2500)).toBe(1);
  });
  it('includes the radius boundary, refreshes instead of stacking and preserves the stronger Focus slow', () => {
    const a = game(); const e = enemy(a, 1, 625, 330, 'boss');
    rizzPulse([e], a.pos, 0); expect(e.rizzSlowUntil).toBe(2500);
    rizzPulse([e], a.pos, 1000); expect(e.rizzSlowUntil).toBe(3500);
    a.update(100); expect(625 - e.x).toBeCloseTo(34 * .1 * .85);
    const before = e.x; a.update(100);expect(before-e.x).toBeCloseTo(34*.1*.85);
  });
});

describe('Ultimate 67 and resets', () => {
  it('makes all seven radial projectiles bounce-eligible and announces only the first combined volley', () => {
    const a = game(); a.buffs['six-seven'] = 1; a.buffs['skibidi-bounce'] = 1;
    for (const count of [66, 133]) {
      a.kills = count; a.flex.state = 'farming';
      const e = enemy(a, count, 900); e.hp = 1;
      a.shots = [shot(e, 1)]; a.update(1);
      const radial = a.shots.filter(s => s.vx !== 0 || s.vy !== 0);
      // One ordinary auto-shot may also be present; radial shots start at the player at this step.
      const volley = radial.filter(s => s.x === a.pos.x && s.y === a.pos.y);
      expect(volley).toHaveLength(7);
      const target = { id: 999, x: 910, y: 330, hp: 27 };
      expect(volley.every(s => findBounce(s, e, [target]) === target)).toBe(true);
      expect(a.feedback).toBe(count === 66 ? 'ULTIMATE 67' : 'SIX SEVEN!');
    }
    a.mode = 'between'; a.update(0, { confirm: true }); expect(a.effects.ultimate67Announced).toBe(true);
    a.mode = 'dead'; a.update(0, { confirm: true });
    expect(a.effects.ultimate67Announced).toBe(false); expect(a.effects.deluluUsed).toBe(false);
    expect(a.effects.invulnerableUntil).toBe(0); expect(a.effects.rizzPulseUntil).toBe(0);
    expect(a.buffs['skibidi-bounce']).toBe(0); expect(a.enemies).toHaveLength(0); expect(a.shots).toHaveLength(0);
  });
  it('does not announce the synergy without Bounce and allows announcement after later acquisition', () => {
    const f = new BuffEffects(); expect(f.volleyMessage(false)).toBe('SIX SEVEN!');
    expect(f.volleyMessage(true)).toBe('ULTIMATE 67'); expect(f.volleyMessage(true)).toBe('SIX SEVEN!');
  });
});
