import {describe,it,expect} from "vitest";
import {PASSIVES_V2,WEAPONS_V2,FLEXES_V2,validateBuildV2,difficultyV2,eligiblePassivesV2} from "./combatV2";
const weapons=[{id:"aura-blaster",level:1},{id:"sigma-sword",level:1},{id:"boom-box",level:1}];
describe("Combat V2 isolated contract",()=>{
 it("defines exactly 6 weapons, 28 passives and 8 distinct Flexes",()=>{
  expect(WEAPONS_V2).toHaveLength(6);
  expect(PASSIVES_V2).toHaveLength(28);
  expect(FLEXES_V2).toHaveLength(8);
  expect(new Set(FLEXES_V2.map(x=>x.name)).size).toBe(8);
  expect(PASSIVES_V2.filter(x=>x.rarity==="normal")).toHaveLength(10);
  expect(PASSIVES_V2.filter(x=>x.rarity==="rare")).toHaveLength(8);
  expect(PASSIVES_V2.filter(x=>x.rarity==="epic")).toHaveLength(6);
  expect(PASSIVES_V2.filter(x=>x.rarity==="legendary")).toHaveLength(4);
 });
 it("enforces exactly 3 weapons, max 5 passives and one legendary",()=>{
  expect(validateBuildV2({weapons,passives:[]})).toBe(true);
  expect(validateBuildV2({weapons:weapons.slice(1),passives:[]})).toBe(false);
  expect(validateBuildV2({weapons:[...weapons,{id:"rizz-beam",level:1}],passives:[]})).toBe(false);
  const passives=PASSIVES_V2.filter(x=>x.rarity==="normal").slice(0,5).map(p=>({id:p.id,level:1}));
  expect(validateBuildV2({weapons,passives})).toBe(true);
  expect(validateBuildV2({weapons,passives:[...passives,{id:"critical-drip",level:1}]})).toBe(false);
  expect(validateBuildV2({weapons,passives:[{id:"built-different",level:1},{id:"infinite-rizz",level:1}]})).toBe(false);
  expect(validateBuildV2({weapons,passives:[{id:"gym-routine",level:5}]})).toBe(false);
 });
 it("has strictly increasing threat through five levels",()=>{
  for(let i=1;i<5;i++){
   const a=difficultyV2(i),b=difficultyV2(i+1);
   expect(b.hp).toBeGreaterThan(a.hp);
   expect(b.damage).toBeGreaterThan(a.damage);
   expect(b.spawnDensity).toBeGreaterThan(a.spawnDensity);
  }
  expect(()=>difficultyV2(6)).toThrow();
 });
 it("only offers upgrades when five slots are full and restricts rarity",()=>{
  const passives=PASSIVES_V2.filter(p=>p.rarity==="normal").slice(0,5).map(p=>({id:p.id,level:1}));
  expect(eligiblePassivesV2({weapons,passives},10).every(p=>passives.some(x=>x.id===p.id))).toBe(true);
  expect(eligiblePassivesV2({weapons,passives:[]},1).every(p=>p.rarity==="normal")).toBe(true);
 });
});