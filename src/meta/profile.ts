// RunResult.auraBursts retains its v1 save key but now counts FLEX Ultimate activations.
import type { Arena } from '../game/core/arena';
import type { CharacterId } from '../game/data/characters';
import { isCharacterId } from '../game/data/characters';

export type RunResult = {
  id: string; characterId: CharacterId; finishedAt: string; won: boolean;
  wave: number; kills: number; level: number; durationMs: number; xpCollected: number;
  flexSuccesses: number; flexInterruptions: number; auraBursts: number;
  maxAura: number; damageTaken: number; cleanWave: boolean; bossDefeated: boolean;
  ultimate67Triggered: boolean; sixSevenTriggered: boolean; score: number;
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
  { id:'god-aura', name:'God Aura', description:'Activate FLEX Ultimate 10 times across runs.' },
  { id:'character-arc', name:'Character Arc', description:'Win with 3 different characters.' },
  { id:'clean-wave', name:'Touch Grass', description:'Clear a wave without damage.' },
  { id:'ultimate-67', name:'Ultimate 67', description:'Trigger Six Seven with Skibidi Bounce.' },
  { id:'boss-loss', name:'Skill Issue', description:'Fall to the Big Hater on wave five.' },
];
export type LifetimeStats = {
  runs: number; wins: number; xpCollected: number; flexSuccesses: number; auraBursts: number;
  winningCharacters: CharacterId[];
};
export type ProfileV1 = {
  schemaVersion: 1; selectedCharacterId: CharacterId;
  unlockedCharacters: CharacterId[]; achievements: AchievementId[];
  runHistory: RunResult[]; lifetime: LifetimeStats; settings: { reduceMotion: boolean };
};
const KEY = 'aura-farmer:profile:v1';
export function newProfile(): ProfileV1 {
  return { schemaVersion:1, selectedCharacterId:'sigma',
    unlockedCharacters:['sigma','alpha','rizzler','ohio','cool-kid','nerd'],
    achievements:[],runHistory:[],lifetime:{runs:0,wins:0,xpCollected:0,flexSuccesses:0,auraBursts:0,winningCharacters:[]},settings:{reduceMotion:false} };
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
    const unlocked = new Set<CharacterId>(['sigma','alpha','rizzler','ohio','cool-kid','nerd']);
    if (Array.isArray(data.unlockedCharacters)) for (const c of data.unlockedCharacters) if (isCharacterId(c)) unlocked.add(c);
    const selectedCharacterId = isCharacterId(data.selectedCharacterId) && unlocked.has(data.selectedCharacterId)
      ? data.selectedCharacterId : 'sigma';
    const previous=data.lifetime;
    const legacyTotal=(key:'xpCollected'|'flexSuccesses'|'auraBursts')=>results.reduce((n,r)=>n+(r[key]||0),0);
    const lifetime: LifetimeStats = {
      runs:Number.isFinite(previous?.runs)?Math.max(0,previous!.runs):results.length,
      wins:Number.isFinite(previous?.wins)?Math.max(0,previous!.wins):results.filter(r=>r.won).length,
      xpCollected:Number.isFinite(previous?.xpCollected)?Math.max(0,previous!.xpCollected):legacyTotal('xpCollected'),
      flexSuccesses:Number.isFinite(previous?.flexSuccesses)?Math.max(0,previous!.flexSuccesses):legacyTotal('flexSuccesses'),
      auraBursts:Number.isFinite(previous?.auraBursts)?Math.max(0,previous!.auraBursts):legacyTotal('auraBursts'),
      winningCharacters:Array.isArray(previous?.winningCharacters)
        ? [...new Set(previous.winningCharacters.filter(isCharacterId))]
        : [...new Set(results.filter(r=>r.won).map(r=>r.characterId))],
    };
    return { schemaVersion:1,selectedCharacterId, unlockedCharacters:[...unlocked],lifetime,
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
    ultimate67Triggered:arena.ultimate67Triggered,sixSevenTriggered:arena.sixSevenTriggered,score };
}
export function recordRun(profile: ProfileV1, result: RunResult): { profile: ProfileV1; gained: AchievementId[]; unlocked: CharacterId[] } {
  if (profile.runHistory.some(r => r.id === result.id)) return {profile,gained:[],unlocked:[]};
  const history = [...profile.runHistory, result].slice(-40);
  const winnerIds = new Set([...profile.lifetime.winningCharacters,...(result.won?[result.characterId]:[])]);
  const lifetime: LifetimeStats = {
    runs:profile.lifetime.runs+1, wins:profile.lifetime.wins+(result.won?1:0),
    xpCollected:profile.lifetime.xpCollected+result.xpCollected,
    flexSuccesses:profile.lifetime.flexSuccesses+result.flexSuccesses,
    auraBursts:profile.lifetime.auraBursts+result.auraBursts,
    winningCharacters:[...winnerIds],
  };
  const unlocked = new Set(profile.unlockedCharacters);
  // Unlocks are earned locally; only *verified* future backend results will enter public rankings.
  if (lifetime.xpCollected >= 500) unlocked.add('fanum');
  if (history.some(r=>r.kills>=67 && r.sixSevenTriggered)) unlocked.add('six-seven');
  const done = new Set(profile.achievements);
  const check: Record<AchievementId,boolean> = {
    'first-run':true,'first-win':history.some(r=>r.won),'sigma-win':winnerIds.has('sigma'),
    'flex10':lifetime.flexSuccesses>=10,'flex3':result.flexSuccesses>=3,
    'kill67':result.kills>=67,'loot500':lifetime.xpCollected>=500,
    'god-aura':lifetime.auraBursts>=10,'character-arc':winnerIds.size>=3,
    'clean-wave':result.cleanWave,'ultimate-67':result.ultimate67Triggered,
    'boss-loss':!result.won&&result.wave===5&&result.bossDefeated===false,
  };
  const gained: AchievementId[] = [];
  for (const a of ACHIEVEMENTS) if(check[a.id]&&!done.has(a.id)){done.add(a.id);gained.push(a.id);}
  const newlyUnlocked = [...unlocked].filter(id=>!profile.unlockedCharacters.includes(id));
  const next: ProfileV1 = { ...profile, runHistory:history, lifetime, achievements:[...done],
    unlockedCharacters:[...unlocked] };
  return { profile:next,gained,unlocked:newlyUnlocked };
}
export function personalBest(profile: ProfileV1, characterId?: CharacterId): RunResult | undefined {
  return profile.runHistory.filter(r=>!characterId||r.characterId===characterId)
    .reduce<RunResult|undefined>((best,r)=>!best||r.score>best.score?r:best,undefined);
}
