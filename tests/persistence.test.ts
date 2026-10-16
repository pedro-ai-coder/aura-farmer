import { describe, expect, it } from 'vitest';
import { HEROES } from '../src/game/catalog/content';
import { Run } from '../src/game/simulation/run';
import { LEGACY_KEY, SAVE_KEY, readSave, recordResult, writeSave } from '../src/browser/save';

function memory() {
    const data = new Map<string, string>();
    return { data, getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

describe('phase 1 closeout — persistence', () => {
    for (const mode of ['playing', 'paused', 'upgrade', 'legendary'] as const)
        it(`does not record or unlock content from a ${mode} run`, () => {
            const s = readSave(memory()), r = new Run();
            r.mode = mode; r.wave = 5; r.xpCollected = 1000;
            expect(recordResult(s, r, 'unfinished')).toBe(s);
        });
    for (const hero of HEROES)
        for (const mode of ['won', 'lost'] as const)
            it(`${hero.id} ${mode}: saves once, reloads and starts without carried run power`, () => {
                const storage = memory(); let s = readSave(storage);
                s.selected = hero.id; s.settings = { reducedMotion: true, sound: false };
                s.unlocked.push('fanum');
                const r = new Run(hero.id, 99); r.mode = mode; r.wave = 5; r.level = 25;
                r.time = 1120; r.xpCollected = 8020; r.aura = 90; r.flexCount = 8;
                r.inventory.weapons[0] = { id: hero.starter, rarity: 'legendary', level: 1 };
                r.inventory.passives = [{ id: 'built-different', rarity: 'common', level: 4 }];
                r.inventory.legendarySpent = true;
                s = recordResult(s, r, 'finished');
                expect(recordResult(s, r, 'finished')).toBe(s);
                expect(writeSave(storage, s)).toBe(true);
                const loaded = readSave(storage);
                expect(loaded.runs).toBe(1); expect(loaded.wins).toBe(mode === 'won' ? 1 : 0);
                expect(loaded.results[0]).toMatchObject({ hero: hero.id, xp: 8020, time: 1120, flexes: 8 });
                expect(loaded.settings).toEqual(s.settings); expect(loaded.unlocked).toContain('fanum');
                expect(recordResult(loaded, r, 'finished')).toBe(loaded);
                const next = new Run(loaded.selected, 100);
                expect(next.inventory.weapons).toEqual([{ id: hero.starter, rarity: 'common', level: 1 }]);
                expect(next.inventory.passives).toHaveLength(0); expect(next.inventory.legendarySpent).toBe(false);
                expect(next.hp).toBe(hero.hp); expect(next.aura).toBe(0); expect(next.level).toBe(1);
                expect(next.pending).toBe(0); expect(next.time).toBe(0); expect(next.flexCooldown).toBe(0);
            });
    it('repairs malformed historical statistics without poisoning unlock calculations', () => {
        const storage = memory(); const s = readSave(storage);
        storage.setItem(SAVE_KEY, JSON.stringify({ ...s, results: [
            { id: 'valid', hero: 'alpha', won: false, time: 5, healing: 'bad', protection: 900, level: 100, wave: -3 },
            { id: 'negative', hero: 'sigma', won: false, time: -1 }, null,
        ] }));
        const loaded = readSave(storage);
        expect(loaded.results).toHaveLength(1);
        expect(loaded.results[0]).toMatchObject({ healing: 0, protection: 900, level: 25, wave: 1, xp: 0 });
        const r = new Run('alpha'); r.mode = 'lost'; r.protection = 100;
        expect(recordResult(loaded, r, 'new').unlocked).toContain('beta');
    });
    it('deduplicates history without changing cumulative counters', () => {
        const storage = memory(), r = new Run(); r.mode = 'lost';
        const s = recordResult(readSave(storage), r, 'one');
        storage.setItem(SAVE_KEY, JSON.stringify({ ...s, results: [s.results[0], s.results[0]] }));
        const loaded = readSave(storage);
        expect(loaded.results).toHaveLength(1); expect(loaded.runs).toBe(1);
    });
    it('bounds history to forty while keeping cumulative results and unlocked IDs', () => {
        const storage = memory(); let s = readSave(storage);
        for (let i = 0; i < 45; i++) {
            const r = new Run(); r.mode = 'won'; r.xpCollected = 20;
            s = recordResult(s, r, `run-${i}`);
        }
        writeSave(storage, s); const loaded = readSave(storage);
        expect(loaded.results).toHaveLength(40); expect(loaded.results[0].id).toBe('run-5');
        expect(loaded.runs).toBe(45); expect(loaded.wins).toBe(45); expect(loaded.xp).toBe(900);
        expect(loaded.unlocked).toEqual(expect.arrayContaining(['six-seven', 'fanum']));
    });
    it('recovers legacy progress when v2 is corrupt, without overwriting the v1 snapshot', () => {
        const storage = memory(); const original = JSON.stringify({ schemaVersion: 1, selectedCharacterId: 'alpha', unlockedCharacters: ['beta', 'ohio', 'nerd'], lifetime: { runs: 18, wins: 6, xpCollected: 1234 }, settings: { reduceMotion: true } });
        storage.setItem(LEGACY_KEY, original); storage.setItem(SAVE_KEY, '{broken');
        const s = readSave(storage); writeSave(storage, s);
        expect(storage.getItem(LEGACY_KEY)).toBe(original);
        expect(readSave(storage)).toMatchObject({ selected: 'alpha', runs: 18, wins: 6, xp: 1234 });
        expect(s.unlocked).toEqual(expect.arrayContaining(['beta', 'ohio', 'nerd']));
    });
    it('uses a valid v2 over legacy and tolerates unavailable storage', () => {
        const storage = memory(); const s = readSave(storage); s.runs = 12;
        writeSave(storage, s); storage.setItem(LEGACY_KEY, JSON.stringify({ schemaVersion: 1, lifetime: { runs: 90 } }));
        expect(readSave(storage).runs).toBe(12);
        const blocked = { getItem: () => { throw Error('blocked'); }, setItem: () => { throw Error('blocked'); } };
        expect(readSave(blocked).selected).toBe('sigma'); expect(writeSave(blocked, s)).toBe(false);
    });
});
