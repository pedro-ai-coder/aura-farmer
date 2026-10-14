/**
 * Combat System V2 — self-contained, pure rules registry.
 * Current runtime catalog; target product behavior is specified only in docs/GDD.md.
 * No legacy save IDs are deleted by this module.
 */
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
  {id:"aura-shot",name:"Aura Shot",role:"targeted-projectile",baseDamage:18,intervalSeconds:0.42,maxLevel:4},
  {id:"mewing-jaw",name:"Mewing Jaw",role:"melee-arc",baseDamage:26,intervalSeconds:1.1,maxLevel:4},
  {id:"ohio-orbiter",name:"Ohio Orbiter",role:"orbit-contact",baseDamage:14,intervalSeconds:0.35,maxLevel:4},
  {id:"six-seven",name:"Six Seven",role:"radial-projectiles",baseDamage:11,intervalSeconds:6.5,maxLevel:4},
  {id:"rizz-blast",name:"Rizz Pulse",role:"area-pulse",baseDamage:13,intervalSeconds:4.8,maxLevel:4},
  {id:"meme-launcher",name:"Meme Launcher",role:"explosive-projectile",baseDamage:45,intervalSeconds:3,maxLevel:4}
];
export type Flex = {characterId:string;name:string;role:string;durationSeconds:number;effect:string};
export const FLEXES_V2: readonly Flex[] = [
 {characterId:"cool-kid",name:"Giga Chad Rampage",role:"mobility",durationSeconds:5,effect:"Invulnerable; +60% move speed; 50 contact DPS; 0.5s per-target ICD; boss cap 25% max HP"},
 {characterId:"alpha",name:"Unstoppable Chad",role:"burst-control",durationSeconds:5,effect:"72% damage reduction; 145px shockwave every 0.8s; weapons stay active for 5s"},
 {characterId:"sigma",name:"Sigma Lock-In",role:"precision",durationSeconds:5,effect:"+25% attack cadence; piercing shots; +15pp crit chance for 5s"},
 {characterId:"ohio",name:"Ohio Blitz",role:"mobility-burst",durationSeconds:5,effect:"+45% speed; 3 dash charges with 60 contact damage; target ICD 0.5s"},
 {characterId:"rizzler",name:"Rizz Takeover",role:"area-control",durationSeconds:5,effect:"Pulse every 1s; 45 area damage; 40% nonboss slow for 2s"},
 {characterId:"fanum",name:"Fanum Tax Break",role:"sustain",durationSeconds:5,effect:"+20% melee damage; recover 3 HP per kill max 1/s, heal cap 15% max HP/activation"},
 {characterId:"six-seven",name:"67 Overdrive",role:"area-projectiles",durationSeconds:5,effect:"+2 capped radial shots per volley; +15% projectile damage; max one ricochet"},
 {characterId:"nerd",name:"Sigma Kid Overclock",role:"rapid-fire",durationSeconds:5,effect:"+30% attack speed; piercing projectiles; +10pp crit; secondary capped once/s"}
];
export function difficultyV2(level:number) {
 if(!Number.isInteger(level) || level<1 || level>5) throw new RangeError("Difficulty level must be 1..5");
 return {hp:Math.pow(1.22,level-1), damage:Math.pow(1.13,level-1), spawnDensity:Math.pow(1.18,level-1)};
}
