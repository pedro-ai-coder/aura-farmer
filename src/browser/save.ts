import { CHARACTER_IDS, type CharacterId, type DemoHero } from '../game/catalog/content';
import { isDemoHero, type Run } from '../game/simulation/run';
export const SAVE_KEY = 'aura-farmer:profile:v2';
export const LEGACY_KEY = 'aura-farmer:profile:v1';
export interface Result {
    id: string;
    hero: DemoHero;
    won: boolean;
    time: number;
    wave: number;
    level: number;
    kills: number;
    xp: number;
    flexes: number;
    damage: number;
    healing: number;
    protection: number;
}
export interface Save {
    version: 2;
    selected: DemoHero;
    unlocked: CharacterId[];
    results: Result[];
    xp: number;
    wins: number;
    runs: number;
    settings: {
        reducedMotion: boolean;
        sound: boolean;
    };
    legacy?: unknown;
}
export interface StorageLike {
    getItem(key: string): string | null;
    setItem(key: string, value: string): void;
}
const defaults = (): Save => ({ version: 2, selected: 'sigma', unlocked: ['sigma', 'cool-kid', 'alpha'], results: [], xp: 0, wins: 0, runs: 0, settings: { reducedMotion: false, sound: true } });
const finite = (v: unknown) => typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : 0;
export function readSave(storage: StorageLike): Save {
    const next = defaults();
    try {
        const raw = storage.getItem(SAVE_KEY);
        const parsed = raw ? JSON.parse(raw) : null;
        if (parsed?.version === 2) {
            next.selected = isDemoHero(parsed.selected) ? parsed.selected : 'sigma';
            next.unlocked = [...new Set([...next.unlocked, ...(Array.isArray(parsed.unlocked) ? parsed.unlocked.filter((id: CharacterId) => CHARACTER_IDS.includes(id)) : [])])];
            next.results = Array.isArray(parsed.results) ? parsed.results.filter((r: Result) => r && typeof r.id === 'string' && isDemoHero(r.hero) && Number.isFinite(r.time) && typeof r.won === 'boolean').slice(-40) : [];
            next.xp = finite(parsed.xp);
            next.wins = finite(parsed.wins);
            next.runs = finite(parsed.runs);
            next.settings = { reducedMotion: parsed.settings?.reducedMotion === true, sound: parsed.settings?.sound !== false };
            next.legacy = parsed.legacy;
            return next;
        }
    }
    catch { /* Fall back to the untouched v1 snapshot. */ }
    try {
        const raw = storage.getItem(LEGACY_KEY), old = raw ? JSON.parse(raw) : null;
        if (old?.schemaVersion === 1) {
            next.legacy = old;
            if (isDemoHero(old.selectedCharacterId))
                next.selected = old.selectedCharacterId;
            if (Array.isArray(old.unlockedCharacters))
                next.unlocked = [...new Set([...next.unlocked, ...old.unlockedCharacters.filter((id: CharacterId) => CHARACTER_IDS.includes(id))])];
            next.xp = finite(old.lifetime?.xpCollected);
            next.wins = finite(old.lifetime?.wins);
            next.runs = finite(old.lifetime?.runs);
            next.settings.reducedMotion = old.settings?.reduceMotion === true;
        }
    }
    catch { /* Invalid data must never prevent playing. */ }
    return next;
}
export function writeSave(storage: StorageLike, save: Save): boolean { try {
    storage.setItem(SAVE_KEY, JSON.stringify(save));
    return true;
}
catch {
    return false;
} }
export function recordResult(save: Save, run: Run, id: string): Save {
    if (save.results.some(r => r.id === id))
        return save;
    const result: Result = { id, hero: run.characterId, won: run.mode === 'won', time: run.time, wave: run.wave, level: run.level, kills: run.kills, xp: run.xpCollected, flexes: run.flexCount, damage: run.damageDealt, healing: run.healing, protection: run.protection };
    const unlocked = new Set(save.unlocked);
    if (run.wave >= 3)
        unlocked.add('nerd');
    if (run.eventsDefeated.includes('mod-supremo'))
        unlocked.add('rizzler');
    if (run.wave >= 5)
        unlocked.add('ohio');
    if (save.xp + run.xpCollected >= 500)
        unlocked.add('fanum');
    if (result.won)
        unlocked.add('six-seven');
    if (save.results.reduce((n, r) => n + r.healing + r.protection, 0) + result.healing + result.protection >= 1000)
        unlocked.add('beta');
    return { ...save, unlocked: [...unlocked], results: [...save.results, result].slice(-40), xp: save.xp + result.xp, wins: save.wins + Number(result.won), runs: save.runs + 1 };
}
