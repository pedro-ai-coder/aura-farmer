import type { Arena } from '../game/core/arena';
import type { CharacterId } from '../game/data/characters';
import { isCharacterId } from '../game/data/characters';

export type RunResult = {
  id: string; characterId: CharacterId; finishedAt: string; won: boolean;
  wave: number; kills: number; level: number; durationMs: number; xpCollected: number;
  flexSuccesses: number; flexInterruptions: number; auraBursts: number;
  maxAura: number; damageTaken: number; cleanWave: boolean; bossDefeated: boolean;
  ultimate67Triggered: boolean; score: number;
};
export type AchievementId =
  'first-run' | 'first-win' | 'sigma-win' | 'flex10' | 'flex3' | 'kill67' |
  'loot500' | 'god-aura' | 'character-arc' | 'clean-wave' | 'ultimate-67' | 'boss-loss';
export const ACHIEVEMENTS: ReadonlyArray<{ id: AchievementId; name: string; description: string }> = [
  { id:'first-run', name:'First Aura', description:'Finish a run.' },
  { id:'first-win', name:'No Aura?', description:'Win Classic once.' },
  { id:'sigma-win', name:'Main Character', description:'Win with The Sigma.' },
  { id:'flex10', name:'Flex On Them', description:'Land 10 successful FLEX moves across runs.' },
  { id:'flex3', name:'FLEX Master', description:'Land 3 successful FLEX moves in a single run.' },
  { id:'kill67', name:'SIX SEVEN', description:'Defeat 67 enemies in a single run.' },
  { id:'loot500', name:'Loot Goblin', description:'Collect 500 XP across runs. Unlock Fanum Lord.' },
  { id:'god-aura', name:'God Aura', description:'Trigger 10 Aura Bursts across runs.' },
  { id:'character-arc', name:'Character Arc', description:'Win with 3 different characters.' },
  { id:'clean-wave', name:'Touch Grass', description:'Clear a wave without damage.' },
  { id:'ultimate-67', name:'Ultimate 67', description:'Trigger Six Seven with Skibidi Bounce.' },
  { id:'boss-loss', name:'Skill Issue', description:'Fall to the Big Hater on wave five.' },
];
export type ProfileV1 = {
  schemaVersion: 1; selectedCharacterId: CharacterId;
  unlockedCharacters: CharacterId[]; achievements: AchievementId[];
  runHistory: RunResult[]; settings: { reduceMotion: boolean };
};
const KEY = 'aura-farmer:profile:v1';
export function newProfile(): ProfileV1 {
  return { schemaVersion:1, selectedCharacterId:'sigma',
    unlockedCharacters:['sigma','alpha','rizzler','ohio'],
    achievements:[],runHistory:[],settings:{reduceMotion:false} };
}
export function readProfile(): ProfileV1 {
  try {
    const value = localStorage.getItem(KEY);
    if (!value) return newProfile();
    const v: unknown = JSON.parse(value);
    if (!v || typeof v !== 'object' || (v as {schemaVersion?:unknown}).schemaVersion !== 1) return newProfile();
    const data = v as Partial<ProfileV1>;
    const allowed = new Set(ACHIEVEMENTS.map(a => a.id));
    const results = Array.isArray(data.runHistory) ? data.runHistory.filter(r =>
      r && typeof r.id === 'string' && isCharacterId(r.characterId) &&
      typeof r.score === 'number' && Number.isFinite(r.score)).slice(-40) : [];
    const unlocked = new Set<CharacterId>(['sigma','alpha','rizzler','ohio']);
    if (Array.isArray(data.unlockedCharacters)) for (const c of data.unlockedCharacters) if (isCharacterId(c)) unlocked.add(c);
    const selectedCharacterId = isCharacterId(data.selectedCharacterId) && unlocked.has(data.selectedCharacterId)
      ? data.selectedCharacterId : 'sigma';
    return { schemaVersion:1,selectedCharacterId, unlockedCharacters:[...unlocked],
      achievements:Array.isArray(data.achievements)
        ? [...new Set(data.achievements.filter((a):a is AchievementId => allowed.has(a)))] : [],
      runHistory:results,
      settings:{reduceMotion:data.settings?.reduceMotion === true} };
  } catch { return newProfile(); } // private browsing, quota denial or corrupted JSON
}
export function writeProfile(profile: ProfileV1): boolean {
  try { localStorage.setItem(KEY,JSON.stringify(profile)); return true; } catch { return false; }
}
export function runResult(arena: Arena): RunResult {
  const won = arena.mode === 'win';
  const wave = Math.max(1,Math.min(5,arena.wave));
  const score = 100 * (won ? 5 : wave - 1) + 10 * arena.kills +
    25 * arena.flexSuccesses + 5 * arena.xp.level + (arena.bossDefeated ? 500 : 0);
  return {
    id: typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function' ? crypto.randomUUID()
      : String(Date.now()) + '-' + String(arena.clock),
    finishedAt:new Date().toISOString(),won,wave,kills:arena.kills,level:arena.xp.level,
    characterId:arena.characterId,durationMs:Math.round(arena.clock),
    xpCollected:arena.xpCollected,flexSuccesses:arena.flexSuccesses,flexInterruptions:arena.flexInterruptions,
    auraBursts:arena.auraBursts,maxAura:arena.maxAura,damageTaken:arena.damageTaken,
    cleanWave:arena.cleanWave,bossDefeated:arena.bossDefeated,
    ultimate67Triggered:arena.ultimate67Triggered,score };
}
export function recordRun(profile: ProfileV1, result: RunResult): { profile: ProfileV1; gained: AchievementId[]; unlocked: CharacterId[] } {
  if (profile.runHistory.some(r => r.id === result.id)) return {profile,gained:[],unlocked:[]};
  const history = [...profile.runHistory, result].slice(-40);
  const total = (key: 'xpCollected'|'flexSuccesses'|'auraBursts') => history.reduce((n,r)=>n+(r[key]||0),0);
  const winnerIds = new Set(history.filter(r=>r.won).map(r=>r.characterId));
  const unlocked = new Set(profile.unlockedCharacters);
  // Unlocks are earned locally; only *verified* future backend results will enter public rankings.
  if (total('xpCollected') >= 500) unlocked.add('fanum');
  if (history.some(r=>r.kills>=67 && r.ultimate67Triggered)) unlocked.add('six-seven');
  const done = new Set(profile.achievements);
  const check: Record<AchievementId,boolean> = {
    'first-run':true,'first-win':history.some(r=>r.won),'sigma-win':winnerIds.has('sigma'),
    'flex10':total('flexSuccesses')>=10,'flex3':result.flexSuccesses>=3,
    'kill67':result.kills>=67,'loot500':total('xpCollected')>=500,
    'god-aura':total('auraBursts')>=10,'character-arc':winnerIds.size>=3,
    'clean-wave':result.cleanWave,'ultimate-67':result.ultimate67Triggered,
    'boss-loss':!result.won&&result.wave===5&&result.bossDefeated===false,
  };
  const gained: AchievementId[] = [];
  for (const a of ACHIEVEMENTS) if(check[a.id]&&!done.has(a.id)){done.add(a.id);gained.push(a.id);}
  const newlyUnlocked = [...unlocked].filter(id=>!profile.unlockedCharacters.includes(id));
  const next: ProfileV1 = { ...profile, runHistory:history, achievements:[...done],
    unlockedCharacters:[...unlocked] };
  return { profile:next,gained,unlocked:newlyUnlocked };
}
export function personalBest(profile: ProfileV1, characterId?: CharacterId): RunResult | undefined {
  return profile.runHistory.filter(r=>!characterId||r.characterId===characterId)
    .reduce<RunResult|undefined>((best,r)=>!best||r.score>best.score?r:best,undefined);
}
