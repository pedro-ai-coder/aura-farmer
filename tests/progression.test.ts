import { describe, expect, it } from 'vitest';
import { Run } from '../src/game/simulation/run';
import { updateEnemies } from '../src/game/simulation/enemies';
import { EVENTS } from '../src/game/catalog/enemies';
import { HEROES, xpRequired } from '../src/game/catalog/content';

function quiet() {
    const r = new Run('sigma', 17);
    r.nextSpawn = Infinity;
    r.inventory.weapons = [];
    return r;
}
function drain(r: Run) {
    r.openPending();
    while (r.mode === 'upgrade') expect(r.choose(0)).toBe(true);
}

describe('iteration 2 — progression boundaries', () => {
    it('adds exactly two current HP on level up, even with maximum-health passives', () => {
        const r = quiet();
        r.inventory.passives = [{ id: 'built-different', rarity: 'common', level: 4 }];
        r.hp = 50;
        r.gainXp(xpRequired(1));
        expect(r.hp).toBe(52);
        expect(r.maxHp).toBeCloseTo(102 * 1.32);
    });
    it('caps level and recovery cadence without granting more choices or aura', () => {
        const r = quiet();
        r.level = 25; r.hp = 50; r.aura = 41;
        r.gainXp(xpRequired(25) * 3 + 5);
        expect(r.hp).toBeCloseTo(57.4);
        expect(r.xp).toBe(5);
        expect(r.pending).toBe(0);
        expect(r.aura).toBe(41);
        r.time = 19.99; r.gainXp(xpRequired(25));
        expect(r.hp).toBeCloseTo(57.4);
        r.time = 20; r.gainXp(xpRequired(25));
        expect(r.hp).toBeCloseTo(64.8);
    });
    for (const [at, wave, xp] of [[180, 2, 80], [360, 3, 120], [540, 4, 160], [720, 5, 200]])
        it(`credits the ${at}s transition exactly once and pauses before combat`, () => {
            const r = quiet(); r.time = at - .02; r.wave = wave - 1;
            const enemy = r.spawn('npc', { ...r.pos })!; enemy.born = 0;
            r.update(.01);
            const damage = r.damageTaken;
            enemy.contactAt = 0; r.lastContact = -1;
            expect(r.wave).toBe(wave - 1);
            r.update(.02);
            expect(r.wave).toBe(wave);
            expect(r.xpCollected).toBe(xp);
            expect(r.damageTaken).toBe(damage);
            expect(r.mode).toBe(wave >= 4 ? 'legendary' : 'upgrade');
            const time = r.time, aura = r.aura;
            r.update(.05);
            expect(r.time).toBe(time); expect(r.aura).toBe(aura);
            r.deferLegendary(); drain(r); r.update(.01);
            expect(r.xpCollected).toBe(xp);
        });
    for (const hero of HEROES)
        it(`${hero.id}: legendary has priority, preserves the queue and never rerolls`, () => {
            const r = new Run(hero.id, 7); r.nextSpawn = Infinity;
            r.time = 539.99; r.wave = 3; r.update(.02);
            expect(r.mode).toBe('legendary');
            const cards = structuredClone(r.choices), pending = r.pending;
            expect(cards).toHaveLength(6);
            r.deferLegendary();
            expect(r.mode).toBe('upgrade'); expect(r.pending).toBe(pending);
            drain(r); r.time = 719.99; r.update(.02);
            expect(r.mode).toBe('legendary'); expect(r.choices).toEqual(cards);
            expect(r.choose(0)).toBe(true);
            expect(r.inventory.legendarySpent).toBe(true);
            drain(r); expect(r.openLegendary()).toBe(false);
        });
    it('expires the deferred legendary exactly at 14:55 without equipping it', () => {
        const r = quiet(); r.time = 894.99;
        expect(r.openLegendary()).toBe(true); r.deferLegendary();
        r.time = 895;
        expect(r.openLegendary()).toBe(false);
        expect(r.inventory.legendarySpent).toBe(false);
    });
    for (const event of EVENTS)
        it(`spawns ${event.kind} once at ${event.at}s`, () => {
            const r = quiet(); r.time = event.at - .02; r.wave = Math.floor(event.at / 180) + 1;
            r.update(.01); expect(r.enemies.some(e => e.kind === event.kind)).toBe(false);
            r.update(.02); r.update(.02);
            expect(r.enemies.filter(e => e.kind === event.kind)).toHaveLength(1);
        });
    it('collects only existing XP at boss entry and retires old threats without loot', () => {
        const r = quiet(); r.time = 899.99; r.wave = 5;
        r.spawn('doomscroll-prime'); r.spawn('npc');
        r.drops.push({ x: 400, y: 400, id: 500, xp: 120 });
        r.addArea({ ...r.pos, radius: 100, damage: 999, hostile: true });
        r.update(.02);
        expect(r.enemies.map(e => e.kind)).toEqual(['boss']);
        expect(r.boss!.maxHp).toBe(30000);
        expect(r.xpCollected).toBe(120); expect(r.kills).toBe(0);
        expect(r.drops).toHaveLength(0); expect(r.areas).toHaveLength(0);
        drain(r); r.update(.02); expect(r.xpCollected).toBe(120);
    });
});

describe('iteration 2 — event and final boss clocks', () => {
    for (const [kind, interval, label] of [
        ['reply-guy', 12, 'adds'], ['mod-supremo', 10, 'SILENCE LINE'], ['doomscroll-prime', 7, 'Doomscroll Prime'],
    ] as const)
        it(`${kind} runs its auxiliary ability independently of primary cadence`, () => {
            const r = quiet(); const e = r.spawn(kind, { x: 900, y: 700 })!;
            e.nextAttack = 1000;
            r.time = interval - .01; updateEnemies(r, 0);
            expect(r.enemies.filter(e => e.kind === 'npc')).toHaveLength(0);
            expect(r.areas).toHaveLength(0);
            r.time = interval; updateEnemies(r, 0);
            if (label === 'adds') expect(r.enemies.filter(e => e.kind === 'npc')).toHaveLength(4);
            else expect(r.areas.filter(a => a.label === label)).toHaveLength(2);
            expect(e.nextAux).toBe(interval * 2);
        });
    it('summons Mod reinforcements at half health without waiting for its next attack', () => {
        const r = quiet(); const e = r.spawn('mod-supremo')!;
        e.born = 0; e.hp = e.maxHp * .49; e.nextAttack = 1000;
        updateEnemies(r, 0); updateEnemies(r, 0);
        expect(r.enemies.filter(e => e.kind === 'hater')).toHaveLength(2);
    });
    it('keeps unlocked boss mechanics after regeneration above both health thresholds', () => {
        const r = quiet(); r.time = 1080; r.wave = 5;
        const e = r.spawn('boss', { x: 900, y: 700 })!; e.born = 0;
        r.hitEnemy(e, e.maxHp); // Berserk reduction leaves precisely 35% HP.
        expect(r.counters.bossRingPhase).toBe(1); expect(r.counters.bossBeamPhase).toBe(1);
        e.hp = e.maxHp; e.phase = 1; e.nextAttack = 0;
        updateEnemies(r, 0);
        expect(r.areas.some(a => a.label === 'RESIDUAL')).toBe(true);
        e.phase = 2; e.nextAttack = 0; updateEnemies(r, 0);
        expect(r.areas.some(a => a.label === 'SECOND RING')).toBe(true);
    });
    it('berserk starts at 180s, caps damage and suppresses regeneration during stagger', () => {
        const r = quiet(); r.time = 1079.99;
        const e = r.spawn('boss')!; e.born = 0; e.nextAttack = Infinity; e.hp = 10000;
        expect(r.berserk).toBe(false);
        r.time = 1080; expect(r.bossDamageMultiplier).toBe(2);
        expect(e.hp).toBe(10000);
        r.time = 1081; e.staggerUntil = 1084; updateEnemies(r, 0);
        expect(e.hp).toBe(10000);
        r.time = 1082; updateEnemies(r, 0);
        r.time = 1083; updateEnemies(r, 0);
        r.time = 1084; updateEnemies(r, 0);
        expect(e.hp).toBe(10030);
        r.time = 1500; expect(r.bossDamageMultiplier).toBe(3);
        expect(r.mode).toBe('playing');
        r.hitEnemy(e, 1e6); expect(r.mode).toBe('won');
    });
    it('boss adds have no XP drops and never exceed eight', () => {
        const r = quiet(); r.time = 950;
        const boss = r.spawn('boss')!; boss.born = 0;
        for (let i = 0; i < 3; i++) { boss.phase = 3; boss.nextAttack = 0; updateEnemies(r, 0); }
        const adds = r.enemies.filter(e => e.kind !== 'boss');
        expect(adds).toHaveLength(8);
        for (const e of adds) r.kill(e);
        expect(r.drops).toHaveLength(0); expect(r.xpCollected).toBe(0);
    });
    it('a fatal contact freezes the result before a pending attack can kill the boss', () => {
        const r = quiet(); r.time = 950; r.wave = 5; r.counters.bossSpawned = 1;
        const e = r.spawn('boss', { ...r.pos })!; e.born = 0; e.hp = 1; e.nextAttack = Infinity;
        r.hp = 1; r.addArea({ ...r.pos, radius: 200, damage: 1e6 });
        r.update(.01);
        expect(r.mode).toBe('lost'); expect(r.bossDefeated).toBe(false);
        expect(e.hp).toBe(1); const xp = r.xpCollected;
        r.gainXp(100); r.hitEnemy(e, 1e6); r.update(.05);
        expect(r.mode).toBe('lost'); expect(r.xpCollected).toBe(xp);
    });
});
