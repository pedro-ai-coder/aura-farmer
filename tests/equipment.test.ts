import { describe, expect, it } from 'vitest';
import { HEROES, PASSIVES, CAPS, type Rarity } from '../src/game/catalog/content';
import { Inventory, itemPower, type Item } from '../src/game/simulation/inventory';
import { Run } from '../src/game/simulation/run';
import { updateWeapons } from '../src/game/simulation/weapons';

function arena(hero: 'sigma' | 'cool-kid' | 'alpha' = 'sigma') {
    const r = new Run(hero, 1);
    r.nextSpawn = Infinity;
    const e = r.spawn('npc', { x: 780, y: 610 })!;
    e.born = 0; e.hp = e.maxHp = 10000; e.nextAttack = Infinity;
    return { r, e };
}
function tick(r: Run, seconds: number) {
    for (let n = 0; n < Math.round(seconds * 60); n++) r.update(1 / 60);
}
function equip(r: Run, id: string, level = 1) {
    const p = PASSIVES.find(p => p.id === id)!;
    r.mode = 'upgrade'; r.pending = 1;
    r.choices = [{ kind: 'passive', action: 'new', item: { id, rarity: p.rarity, level: 1 } }];
    expect(r.choose(0)).toBe(true);
    r.inventory.passives.find(p => p.id === id)!.level = level;
}
function replace(r: Run, id: string) {
    // Fill remaining slots, then exercise the same confirmed replacement as the UI.
    for (const p of PASSIVES.filter(p => p.rarity === 'common' && !p.role && p.id !== 'certified-w')) {
        if (r.inventory.passives.length === 5) break;
        if (!r.inventory.level(p.id)) equip(r, p.id);
    }
    r.mode = 'upgrade'; r.pending = 1;
    r.choices = [{ kind: 'passive', action: 'replace', item: { id: 'certified-w', rarity: 'common', level: 1 } }];
    expect(r.choose(0, id)).toBe(true);
}

describe('Phase 1 iteration 1 — equipment contracts', () => {
    for (const hero of HEROES) {
        it(`${hero.id}: starter occupies one slot; every compatible passive respects its cap`, () => {
            const inv = new Inventory(hero.role, hero.starter);
            expect(inv.weapons).toEqual([{ id: hero.starter, rarity: 'common', level: 1 }]);
            for (const p of PASSIVES) {
                const compatible = !p.role || p.role === hero.role;
                for (let level = 1; level <= CAPS[p.rarity]; level++)
                    expect(inv.legal({ id: p.id, rarity: p.rarity, level })).toBe(compatible);
                expect(inv.legal({ id: p.id, rarity: p.rarity, level: CAPS[p.rarity] + 1 })).toBe(false);
            }
        });
    }
    it('preserves legal levels during promotion and rejects mismatched item categories', () => {
        const inv = new Inventory('ranged', 'no-cap');
        inv.weapons[0].level = 4;
        expect(inv.apply({ kind: 'weapon', action: 'promote', item: { id: 'no-cap', rarity: 'rare', level: 3 } })).toBe(true);
        expect(inv.apply({ kind: 'weapon', action: 'promote', item: { id: 'no-cap', rarity: 'epic', level: 2 } })).toBe(true);
        expect(inv.apply({ kind: 'passive', action: 'new', item: { id: 'ratio-blaster', rarity: 'common', level: 1 } })).toBe(false);
        expect(inv.legal({ id: 'no-cap', rarity: 'invalid' as Rarity, level: 1 })).toBe(false);
    });
    for (const rarity of ['common', 'rare', 'epic', 'legendary'] as const) {
        it(`Cope Shield ${rarity}: shields scale with rarity and level`, () => {
            const { r } = arena('alpha');
            const item: Item = { id: 'cope-shield', rarity, level: CAPS[rarity] };
            r.inventory.weapons = [item];
            tick(r, .05);
            expect(r.shields['cope-shield'].amount).toBeCloseTo(r.maxHp * .04 * itemPower(item));
        });
    }
    it('legendary weapon secondary damage retains weapon bonuses without procs or Sigma Flex bonus', () => {
        const { r, e } = arena();
        equip(r, 'main-character'); r.aura = 100; r.activateFlex();
        const hp = e.hp;
        r.hitEnemy(e, 10, 'no-cap', 1, false);
        expect(hp - e.hp).toBeCloseTo(10.6);
        expect(r.aura).toBe(0); expect(r.procHits.size).toBe(0);
    });
    it('Comment Apocalypse emits two delayed projectiles, not instant line damage', () => {
        const { r } = arena();
        r.inventory.weapons = [{ id: 'ratio-blaster', rarity: 'legendary', level: 1 }];
        r.counters['ratio-blaster'] = 3;
        updateWeapons(r, { x: 0, y: 0 });
        expect(r.shots.map(s => s.at)).toEqual([0, .08, .16]);
        expect(r.shots.map(s => s.primary)).toEqual([true, false, false]);
        expect(r.areas).toHaveLength(0);
    });
    it('Chad Hands counts successful activations, not swings that missed', () => {
        const { r } = arena('alpha');
        r.inventory.weapons = [{ id: 'chad-hands', rarity: 'common', level: 1 }];
        r.counters['chad-hands'] = 2; // two prior misses
        tick(r, .05);
        expect(r.counters.chadHits).toBe(1);
        expect(r.areas.find(a => a.label === 'CHAD SECOND')?.shape).toBe('cone');
        r.counters.chadHits = 2; r.timers['chad-hands'] = 0; r.areas = [];
        tick(r, .05);
        expect(r.counters.chadHits).toBe(3);
        expect(r.areas.find(a => a.label === 'CHAD SECOND')?.shape).toBe('circle');
    });
    it('removing We Are So Back stops healing and shield, retaining its cooldown', () => {
        const { r, e } = arena(); equip(r, 'so-back');
        r.hp = 35; r.hurt(10, e); const deadline = r.timers.soBack;
        expect(r.counters.healTicks).toBe(5);
        replace(r, 'so-back');
        expect(r.counters.healTicks).toBeUndefined();
        expect(r.shields['so-back']).toBeUndefined();
        expect(r.timers.soBack).toBe(deadline);
    });
    for (const [id, timer, counter] of [
        ['w-wifi', 'wifiUntil', ''], ['aura-viral', 'viralUntil', ''],
        ['let-him-cook', 'cookUntil', 'cook'], ['w-squad', 'squadUntil', ''],
        ['homie-check', 'homie', 'homie'], ['six-to-seven', 'six', 'six'],
    ]) it(`removing ${id} clears active effects/stacks without resetting cooldowns`, () => {
        const { r } = arena(id === 'let-him-cook' || id === 'homie-check' ? 'cool-kid' : 'sigma');
        equip(r, id); r.timers[timer] = 20; if (counter) r.counters[counter] = 4;
        replace(r, id);
        if (counter) expect(r.counters[counter]).toBeUndefined();
        expect(r.timers[timer]).toBe(timer === 'homie' || timer === 'six' ? 20 : undefined);
    });
    it('Alpha trait requires direct damage and taunt does not affect bosses', () => {
        const { r, e } = arena('alpha');
        r.hurt(1, e, false, true); expect(r.counters.certified).toBeUndefined();
        r.hurt(1, e); expect(r.counters.certified).toBe(1);
        const boss = r.spawn('boss', { x: 800, y: 610 })!; boss.born = 0;
        r.aura = 100; r.activateFlex();
        expect(r.timers['taunt:' + e.id]).toBe(2);
        expect(r.timers['taunt:' + boss.id]).toBeUndefined();
    });
});

describe('available passive effects', () => {
    it('common damage, frequency, health, mitigation, movement, area and support modifiers are effective', () => {
        const { r, e } = arena();
        equip(r, 'main-character', 4); const hp = e.hp; r.hitEnemy(e, 100, 'no-cap');
        expect(hp - e.hp).toBeCloseTo(124);
        equip(r, 'terminally-online', 4); expect(r.frequency).toBeCloseTo(.2);
        equip(r, 'built-different', 4); expect(r.maxHp).toBeCloseTo(132);
        equip(r, 'thick-skin', 4); const before = r.hp; r.hurt(10, e); expect(before - r.hp).toBeCloseTo(8.8);
        equip(r, 'big-meme', 4); expect(r.areaScale).toBeCloseTo(1.24);
        const speed = arena().r; equip(speed, 'caught-4k', 4); const x = speed.pos.x;
        speed.update(.1, { x: 1, y: 0 }); expect(speed.pos.x - x).toBeCloseTo(21.6);
        const support = arena('alpha').r; equip(support, 'certified-w', 4); equip(support, 'cope-harder', 4);
        support.addShield('test', 10, 2); expect(support.shield).toBeCloseTo(10 * 1.24 * 1.32);
        support.hp = 50; support.heal(10); expect(support.hp).toBeCloseTo(62.4);
    });
    it('Across the Timeline extends projectile range and speed equally', () => {
        const { r } = arena(); equip(r, 'timeline', 4); updateWeapons(r, { x: 0, y: 0 });
        expect(r.shots[0].remaining).toBeCloseTo(792); expect(r.shots[0].speed).toBeCloseTo(990);
    });
    it('Hands On Sight applies only inside 150U', () => {
        const { r, e } = arena('cool-kid'); equip(r, 'hands-on-sight', 4);
        r.hitEnemy(e, 100, 'keyboard-warrior'); expect(r.damageDealt).toBeCloseTo(128);
        e.x = r.pos.x + 200; r.hitEnemy(e, 100, 'keyboard-warrior'); expect(r.damageDealt).toBeCloseTo(228);
    });
    it('No Cap Streak scales piercing, not the fixed 10% damage bonus', () => {
        const { r } = arena(); equip(r, 'no-cap-streak', 3); r.counters.directional = 4;
        updateWeapons(r, { x: 0, y: 0 }); expect(r.shots[0].pierce).toBe(7); expect(r.shots[0].damage).toBeCloseTo(55);
    });
    it('Wi-Fi and Aura Goes Viral use the greater frequency bonus', () => {
        const { r } = arena(); equip(r, 'w-wifi', 3); equip(r, 'aura-viral', 2);
        r.time = 12; tick(r, .05); expect(r.frequency).toBeCloseTo(.16);
        r.aura = 100; r.activateFlex(); expect(r.frequency).toBeCloseTo(.18);
        r.time = 18; expect(r.frequency).toBe(0);
    });
    it('Let Him Cook stacks expire; Homie Check heals once per eight primary activations', () => {
        const { r, e } = arena('cool-kid'); equip(r, 'let-him-cook', 3); equip(r, 'homie-check', 3);
        r.hp = 50;
        for (let i = 1; i <= 8; i++) r.hitEnemy(e, 1, 'keyboard-warrior', i, true);
        expect(r.counters.cook).toBe(5); expect(r.hp).toBeCloseTo(55.5);
        const hp = e.hp; r.hitEnemy(e, 100, 'keyboard-warrior'); expect(hp - e.hp).toBeCloseTo(125);
        r.time = 4; const later = e.hp; r.hitEnemy(e, 100, 'keyboard-warrior'); expect(later - e.hp).toBeCloseTo(100);
    });
    it('Big Chad Energy waits ten seconds and grants its level-scaled shield', () => {
        const { r } = arena('alpha'); r.inventory.weapons = []; equip(r, 'big-chad', 3);
        r.time = 9; tick(r, .05); expect(r.shield).toBe(0);
        r.time = 10; tick(r, .05); expect(r.shield).toBeCloseTo(12.6);
    });
    it("It's So Over checks target HP and Six → Seven emits a non-proccing seventh-hit explosion", () => {
        const { r, e } = arena(); equip(r, 'its-over', 2); e.hp = 2000;
        r.hitEnemy(e, 100); expect(e.hp).toBeCloseTo(1875);
        equip(r, 'six-to-seven', 2);
        for (let i = 1; i <= 7; i++) r.hitEnemy(e, 1, 'no-cap', i, true);
        const a = r.areas.find(a => a.label === 'SEVEN!')!;
        expect(a.damage).toBe(50); expect(a.primary).toBe(false); expect(r.counters.six).toBe(0);
    });
    it('Absolute Cinema only amplifies weapons and adds its Flex bonus', () => {
        const { r, e } = arena(); equip(r, 'absolute-cinema');
        r.hitEnemy(e, 100, 'no-cap'); expect(r.damageDealt).toBe(125);
        r.aura = 100; r.activateFlex(); r.hitEnemy(e, 100, 'no-cap'); expect(r.damageDealt).toBe(270);
        r.hitEnemy(e, 100); expect(r.damageDealt).toBe(370);
    });
    it('W Squad improves support and gives a six-second weapon buff after Flex', () => {
        const { r, e } = arena(); equip(r, 'w-squad'); expect(r.support).toBe(1.25);
        r.aura = 100; r.activateFlex(); r.hitEnemy(e, 100, 'no-cap'); expect(r.damageDealt).toBeCloseTo(110);
        r.time = 6.1; r.hitEnemy(e, 100, 'no-cap'); expect(r.damageDealt).toBeCloseTo(210);
    });
    it('Too Sigma shields at the threshold but cannot save a lethal hit', () => {
        const { r, e } = arena(); equip(r, 'too-sigma'); r.hp = 30; r.hurt(10, e);
        expect(r.shield).toBe(25); expect(r.timers.tooSigma).toBe(60);
        r.hurt(1000, e); expect(r.mode).toBe('lost');
    });
    it('No U triggers at fifteen seconds and treats bosses separately without procs', () => {
        const { r, e } = arena(); r.inventory.weapons = []; equip(r, 'no-u');
        const boss = r.spawn('reply-guy', { x: 800, y: 610 })!; boss.born = 0; boss.nextAttack = Infinity;
        r.time = 15; tick(r, .05); expect(e.weaken).toBe(.2); expect(boss.weaken).toBe(.1);
        expect(r.procHits.size).toBe(0); expect(r.damageDealt).toBe(60);
    });
});
