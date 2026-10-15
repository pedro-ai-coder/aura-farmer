import { describe, it, expect } from 'vitest';
import { Run } from '../src/game/simulation/run';
import { Inventory } from '../src/game/simulation/inventory';
import { HEROES, WEAPONS, PASSIVES, xpRequired } from '../src/game/catalog/content';
import { walkable, clearLine, move, seededRandom } from '../src/game/simulation/world';
import { readSave, writeSave, recordResult, SAVE_KEY, LEGACY_KEY } from '../src/browser/save';
function advance(r: Run, seconds: number) { for (let i = 0; i < Math.round(seconds * 60); i++)
    r.update(1 / 60); }
function quiet() { const r = new Run('sigma', 42); r.nextSpawn = Infinity; return r; }
describe('GDD inventory', () => {
    it('contains the explicit solo slice', () => { expect(HEROES).toHaveLength(3); expect(WEAPONS).toHaveLength(9); expect(PASSIVES).toHaveLength(23); });
    for (const hero of HEROES)
        it(`${hero.id} only receives compatible gear across all waves`, () => { const inv = new Inventory(hero.role, hero.starter), rng = seededRandom(12); for (let wave = 1; wave <= 5; wave++)
            for (let n = 0; n < 100; n++) {
                const offers = inv.normalChoices(wave, rng);
                expect(offers).toHaveLength(3);
                expect(new Set(offers.map(c => c.item?.id)).size).toBe(3);
                for (const c of offers)
                    expect(inv.legal(c.item!)).toBe(true);
            } });
    it('rejects incompatible weapons and epic level 3', () => { const i = new Inventory('ranged', 'no-cap'); expect(i.apply({ kind: 'weapon', action: 'new', item: { id: 'ban-hammer', rarity: 'common', level: 1 } })).toBe(false); expect(i.apply({ kind: 'weapon', action: 'promote', item: { id: 'no-cap', rarity: 'epic', level: 1 } })).toBe(true); expect(i.apply({ kind: 'weapon', action: 'upgrade', item: { id: 'no-cap', rarity: 'epic', level: 2 } })).toBe(true); expect(i.apply({ kind: 'weapon', action: 'upgrade', item: { id: 'no-cap', rarity: 'epic', level: 3 } })).toBe(false); });
    it('requires explicit replacement at five passives', () => { const i = new Inventory('ranged', 'no-cap'); const pool = PASSIVES.filter(p => p.rarity === 'common' && !p.role); for (const p of pool.slice(0, 5))
        expect(i.apply({ kind: 'passive', action: 'new', item: { id: p.id, rarity: 'common', level: 1 } })).toBe(true); const c = { kind: 'passive' as const, action: 'replace' as const, item: { id: pool[5].id, rarity: 'common' as const, level: 1 } }; expect(i.apply(c)).toBe(false); expect(i.apply(c, i.passives[0].id)).toBe(true); expect(i.passives).toHaveLength(5); });
    it('offers three buffs and three weapons and spends legendary once', () => { const i = new Inventory('tank', 'cope-shield'); const offers = i.legendaryChoices(seededRandom(1)); expect(offers.filter(c => c.kind === 'weapon')).toHaveLength(3); expect(offers.filter(c => c.kind === 'passive')).toHaveLength(3); expect(i.apply(offers[0])).toBe(true); expect(i.apply(offers[3])).toBe(false); });
});
describe('GDD progression and clock', () => {
    it('carries XP and queues choices separately from aura', () => { const r = quiet(); r.aura = 80; r.gainXp(xpRequired(1) + xpRequired(2) + 4); expect(r.level).toBe(3); expect(r.xp).toBe(4); expect(r.pending).toBe(2); expect(r.maxHp).toBe(104); expect(r.aura).toBe(80); r.openPending(); const t = r.time; advance(r, 3); expect(r.time).toBe(t); expect(r.choose(0)).toBe(true); expect(r.pending).toBe(1); expect(r.mode).toBe('upgrade'); });
    it('caps run level at 25', () => { const r = quiet(); r.gainXp(100000); expect(r.level).toBe(25); expect(r.pending).toBe(24); expect(r.maxHp).toBe(148); });
    it('pauses every clock and resumes', () => { const r = quiet(); advance(r, 2); r.pause(); const t = r.time, a = r.aura; advance(r, 2); expect(r.time).toBe(t); expect(r.aura).toBe(a); r.resume(); advance(r, 1); expect(r.time).toBeCloseTo(t + 1); });
    it('advances waves at 180 seconds and credits transition once', () => { const r = quiet(); r.time = 179.99; r.update(.02); expect(r.wave).toBe(2); expect(r.xpCollected).toBe(80); r.mode = 'playing'; r.pending = 0; r.update(.02); expect(r.xpCollected).toBe(80); });
    it('does not offer legendary early; deferral retains the exact six cards', () => { const r = quiet(); r.time = 539; expect(r.openLegendary()).toBe(false); r.time = 540; expect(r.openLegendary()).toBe(true); const offers = JSON.stringify(r.choices); r.deferLegendary(); r.time = 720; expect(r.openLegendary()).toBe(true); expect(JSON.stringify(r.choices)).toBe(offers); r.deferLegendary(); r.time = 895; expect(r.openLegendary()).toBe(false); });
    it('summons event and final boss on schedule', () => { const r = quiet(); r.time = 194.99; r.wave = 2; r.update(.02); expect(r.enemies.some(e => e.kind === 'reply-guy')).toBe(true); r.time = 899.99; r.wave = 5; r.update(.02); expect(r.boss).toBeDefined(); expect(r.enemies).toHaveLength(1); });
    it('berserk regenerates and resists damage without instant death', () => { const r = quiet(); r.time = 1081; r.wave = 5; r.counters.bossSpawned = 1; const e = r.spawn('boss', { x: 724, y: 445 })!; e.born = 0; e.hp = e.maxHp / 2; const hp = e.hp; r.update(.02); expect(e.hp).toBeGreaterThan(hp); expect(r.hp).toBe(100); const before = e.hp; r.hitEnemy(e, 100); expect(before - e.hp).toBeCloseTo(65); r.hitEnemy(e, 1e6); expect(r.mode).toBe('won'); });
});
describe('combat and world', () => {
    it('limits primary aura procs across multiple targets and secondary hits', () => { const r = quiet(); const a = r.spawn('npc', { x: 800, y: 600 })!, b = r.spawn('npc', { x: 820, y: 600 })!; a.born = b.born = 0; r.hitEnemy(a, 1, 'no-cap', 1, true); r.hitEnemy(b, 1, 'no-cap', 1, true); r.hitEnemy(a, 1, 'no-cap', 2, true); r.hitEnemy(a, 1, 'no-cap', 3, true); r.hitEnemy(a, 1, '', 4, false); expect(r.aura).toBe(2); });
    it('Sigma requires a target; Alpha grants shield; Cool Kid respects hazards', () => { const s = quiet(); s.aura = 100; expect(s.activateFlex()).toBe(false); expect(s.aura).toBe(100); const a = new Run('alpha'); a.aura = 100; expect(a.activateFlex()).toBe(true); expect(a.shield).toBe(35); const c = new Run('cool-kid'); c.aura = 100; c.activateFlex(); const e = c.spawn('npc')!; c.hurt(10, e, true); expect(c.hp).toBe(110); c.hurt(10, e, false, true); expect(c.hp).toBeLessThan(110); });
    it('shield is capped and lethal hits do not revive', () => { const r = quiet(); r.addShield('a', 100, 20); r.addShield('b', 100, 20); expect(r.shield).toBe(40); expect(r.shields.a.until).toBe(6); r.hurt(1000, undefined); expect(r.mode).toBe('lost'); expect(r.hp).toBe(0); });
    it('blocks scenery and projectiles at cover', () => { expect(walkable({ x: 724, y: 610 })).toBe(true); expect(walkable({ x: 600, y: 550 })).toBe(false); expect(walkable({ x: 10, y: 10 })).toBe(false); expect(clearLine({ x: 540, y: 550 }, { x: 660, y: 550 })).toBe(false); expect(move({ x: 550, y: 550 }, 40, 0)).toEqual({ x: 550, y: 550 }); });
    for (const w of WEAPONS)
        it(`${w.name} damages an eligible target`, () => { const hero = HEROES.find(h => h.role === w.role)!; const r = new Run(hero.id, 1); r.nextSpawn = Infinity; r.inventory.weapons = [{ id: w.id, rarity: 'common', level: 1 }]; const e = r.spawn('npc', { x: 780, y: 610 })!; e.born = 0; e.hp = e.maxHp = 10000; advance(r, 1); expect(r.damageDealt).toBeGreaterThan(0); });
});
describe('versioned saves', () => {
    const memory = () => { const map = new Map<string, string>(); return { map, getItem: (k: string) => map.get(k) ?? null, setItem: (k: string, v: string) => { map.set(k, v); } }; };
    it('preserves all legacy IDs and snapshot without changing v1', () => { const m = memory(); const old = { schemaVersion: 1, selectedCharacterId: 'fanum', unlockedCharacters: ['fanum', 'rizzler', 'six-seven'], lifetime: { runs: 9, wins: 2, xpCollected: 500 }, settings: { reduceMotion: true } }; m.setItem(LEGACY_KEY, JSON.stringify(old)); const s = readSave(m); expect(s.unlocked).toEqual(expect.arrayContaining(old.unlockedCharacters)); expect(s.runs).toBe(9); expect(s.selected).toBe('sigma'); expect(s.legacy).toEqual(old); writeSave(m, s); expect(JSON.parse(m.getItem(LEGACY_KEY)!)).toEqual(old); expect(readSave(m)).toEqual(s); });
    it('deduplicates results and recovers corrupt storage', () => { const m = memory(); m.setItem(SAVE_KEY, 'broken'); let s = readSave(m); const r = quiet(); r.mode = 'lost'; r.xpCollected = 50; s = recordResult(s, r, 'run-1'); s = recordResult(s, r, 'run-1'); expect(s.runs).toBe(1); expect(s.xp).toBe(50); expect(writeSave({ getItem: () => null, setItem: () => { throw Error(); } }, s)).toBe(false); });
});
