/**
 * Combat System V2 — self-contained, pure rules registry.
 * Integration with the live Phaser runtime is deliberately a separate, gated change.
 * No legacy save IDs are deleted by this module.
 */
export const COMBAT_V2_VERSION = 2 as const;
export const MAX_WEAPONS = 3 as const;
export const MAX_PASSIVES = 5 as const;
export const MAX_LEGENDARIES = 1 as const;
export const FLEX_COST = 100 as const;
export type Rarity = "normal" | "rare" | "epic" | "legendary";
export type Passive = { id: string; name: string; rarity: Rarity; maxLevel: number; description: string };
const normal = [
  ["gym-routine","Gym Routine","+4% weapon damage / level"],
  ["speed-shoes","Speed Shoes","+4% movement / level"],
  ["thick-skin","Thick Skin","+5% max HP / level"],
  ["quick-hands","Quick Hands","+3% attack speed / level"],
  ["long-reach","Long Reach","+5% eligible range / level"],
  ["magnet-mode","Magnet Mode","+12% XP pickup radius / level"],
  ["cardio-king","Cardio King","-3% weapon cooldown / level"],
  ["iron-will","Iron Will","-3% damage received / level"],
  ["recovery-snack","Recovery Snack","+0.2 HP/s / level"],
  ["lucky-charm","Lucky Charm","+2pp crit chance / level"]
] as const;
const rare = [
  ["critical-drip","Critical Drip","+7pp crit bonus / level"],
  ["shockwave","Shockwave","8/12/16% proc; 2s ICD"],
  ["vampire-mode","Vampire Mode","2/3/4 HP per eligible kill; 2s ICD"],
  ["chain-reaction","Chain Reaction","10/15/20% secondary hit at 40% damage"],
  ["adrenaline","Adrenaline","+8/12/16% movement below 35% HP"],
  ["aura-magnet","Aura Magnet","+15/25/35% Aura pickup radius"],
  ["heavy-impact","Heavy Impact","+10/15/20% knockback"],
  ["second-wind","Second Wind","Heal 8/12/16 HP below 30%; 45s ICD"]
] as const;
const epic = [
  ["double-trouble","Double Trouble","10/18% extra projectile proc"],
  ["berserker","Berserker","+12/20% damage below 35% HP"],
  ["time-warp","Time Warp","-15/25% weapon cooldown for 3s on elite kill"],
  ["thunder-strike","Thunder Strike","35 every 8s / 55 every 7s"],
  ["guardian-angel","Guardian Angel","One-hit shield every 60/45s"],
  ["explosive-finish","Explosive Finish","8% at 35 / 12% at 50 explosion"]
] as const;
const legendary = [
  ["main-character-energy","Main Character Energy","+25% weapon damage for 4s after Flex"],
  ["infinite-rizz","Infinite Rizz","Crit procs one 35% follow-up, max once/s"],
  ["built-different","Built Different","Survive lethal damage once with 25% max HP"],
  ["final-boss-energy","Final Boss Energy","+15% vs elites/bosses; +15 Aura on elite kills"]
] as const;
function definePassives(items: readonly (readonly [string,string,string])[], rarity: Rarity, maxLevel:number): Passive[] {
  return items.map(([id,name,description])=>({id,name,description,rarity,maxLevel}));
}
export const PASSIVES_V2: readonly Passive[] = [
  ...definePassives(normal,"normal",4),
  ...definePassives(rare,"rare",3),
  ...definePassives(epic,"epic",2),
  ...definePassives(legendary,"legendary",1)
];
export type Weapon = {id:string;name:string;role:string;baseDamage:number;intervalSeconds:number;maxLevel:4};
export const WEAPONS_V2: readonly Weapon[] = [
  {id:"aura-blaster",name:"Aura Blaster",role:"targeted-projectile",baseDamage:18,intervalSeconds:0.6,maxLevel:4},
  {id:"sigma-sword",name:"Sigma Sword",role:"melee-arc",baseDamage:32,intervalSeconds:1.1,maxLevel:4},
  {id:"boom-box",name:"Boom Box",role:"area-pulse",baseDamage:22,intervalSeconds:2.5,maxLevel:4},
  {id:"meme-launcher",name:"Meme Launcher",role:"explosion",baseDamage:45,intervalSeconds:3,maxLevel:4},
  {id:"orbiting-drip",name:"Orbiting Drip",role:"orbit-contact",baseDamage:12,intervalSeconds:0.5,maxLevel:4},
  {id:"rizz-beam",name:"Rizz Beam",role:"piercing-beam",baseDamage:38,intervalSeconds:2.2,maxLevel:4}
];
export type Flex = {characterId:string;name:string;role:string;durationSeconds:number;effect:string};
export const FLEXES_V2: readonly Flex[] = [
 {characterId:"cool-kid",name:"Untouchable",role:"mobility",durationSeconds:5,effect:"Invulnerable; +60% move speed; 50 contact DPS; 0.5s per-target ICD; boss cap 25% max HP"},
 {characterId:"alpha-chad",name:"Sigma Slam",role:"burst-control",durationSeconds:5,effect:"220 damage, 4m radius slam; push 2.5m/stun 1.5s nonboss; +20% weapon damage for 5s"},
 {characterId:"the-sigma",name:"Sigma Lock-In",role:"precision",durationSeconds:5,effect:"+25% attack cadence; piercing shots; +15pp crit chance; secondary proc capped once/s"},
 {characterId:"ohio-kid",name:"Ohio Blitz",role:"mobility-burst",durationSeconds:5,effect:"+45% speed; 3 dash charges with 60 contact damage; target ICD 0.5s"},
 {characterId:"the-rizzler",name:"Rizz Takeover",role:"area-control",durationSeconds:5,effect:"Pulse every 1s; 45 area damage; 40% nonboss slow for 2s"},
 {characterId:"fanum-lord",name:"Fanum Tax Break",role:"sustain",durationSeconds:5,effect:"+20% melee damage; recover 3 HP per kill max 1/s, heal cap 15% max HP/activation"},
 {characterId:"six-seven-kid",name:"67 Overdrive",role:"area-projectiles",durationSeconds:5,effect:"+2 capped radial shots per volley; +15% projectile damage; max one ricochet"},
 {characterId:"nerd",name:"Sigma Kid Overclock",role:"rapid-fire",durationSeconds:5,effect:"+30% attack speed; piercing projectiles; +10pp crit; secondary capped once/s"}
];
export type Equip = {id:string;level:number};
export type BuildV2 = {weapons:readonly Equip[];passives:readonly Equip[]};
export function validateBuildV2(build:BuildV2):boolean {
 if(build.weapons.length!==MAX_WEAPONS || build.passives.length>MAX_PASSIVES) return false;
 if(new Set(build.weapons.map(x=>x.id)).size!==build.weapons.length || new Set(build.passives.map(x=>x.id)).size!==build.passives.length) return false;
 if(build.weapons.some(x=>!WEAPONS_V2.some(w=>w.id===x.id && Number.isInteger(x.level) && x.level>=1 && x.level<=w.maxLevel))) return false;
 if(build.passives.some(x=>!PASSIVES_V2.some(p=>p.id===x.id && Number.isInteger(x.level) && x.level>=1 && x.level<=p.maxLevel))) return false;
 return build.passives.filter(x=>PASSIVES_V2.some(p=>p.id===x.id && p.rarity==="legendary")).length<=MAX_LEGENDARIES;
}
export function difficultyV2(level:number) {
 if(!Number.isInteger(level) || level<1 || level>5) throw new RangeError("Difficulty level must be 1..5");
 return {hp:Math.pow(1.22,level-1), damage:Math.pow(1.13,level-1), spawnDensity:Math.pow(1.18,level-1)};
}
export function eligiblePassivesV2(build:BuildV2, xpLevel:number):Passive[] {
 const owned=new Map(build.passives.map(p=>[p.id,p.level]));
 const alreadyLegendary=build.passives.some(p=>PASSIVES_V2.some(x=>x.id===p.id && x.rarity==="legendary"));
 return PASSIVES_V2.filter(p=>{
   if(p.rarity==="rare" && xpLevel<3 || p.rarity==="epic" && xpLevel<6 || p.rarity==="legendary" && xpLevel<10) return false;
   const level=owned.get(p.id);
   if(level!==undefined) return level<p.maxLevel;
   return build.passives.length<MAX_PASSIVES && !(p.rarity==="legendary" && alreadyLegendary);
 });
}
