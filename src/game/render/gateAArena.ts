import Phaser from "phaser";

/**
 * Gate A: original deliberately authored native-pixel studies.
 * They are preview textures, not outsourced/approved final animation atlases.
 * Only enabled with ?gateA=1; gameplay simulation and existing sprites stay intact.
 */
export const isGateA = (): boolean =>
  new URLSearchParams(window.location.search).get("gateA") === "1";

const C = {
  ink: "#192236", shade: "#101b2d", ivory: "#fff0d0",
  skin: "#f6be92", skinShade: "#d58d6f",
  hair: "#141c2c", hairLight: "#364355",
  hoodie: "#233b57", hoodieLight: "#3c6289",
  gold: "#f9c954", goldLight: "#fff2ab", cyan: "#52c8e8",
  coral: "#ff697a", plum: "#663867", violet: "#bd68e5",
  grey: "#8295a9", greyLight: "#c0cad7", red: "#d94866",
} as const;
type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
function r(c:Ctx,x:number,y:number,w:number,h:number,color:string):void{
  c.fillStyle=color; c.fillRect(Math.round(x),Math.round(y),w,h);
}
function p(c:Ctx,color:string,pts:Point[]):void{
  c.fillStyle=color; c.beginPath();
  pts.forEach(([x,y],i)=>i===0?c.moveTo(x,y):c.lineTo(x,y));
  c.closePath();c.fill();
}
function make(w:number,h:number,draw:(ctx:Ctx)=>void):HTMLCanvasElement{
  const cv=document.createElement("canvas");cv.width=w;cv.height=h;
  const ctx=cv.getContext("2d",{alpha:true})!;
  ctx.imageSmoothingEnabled=false;draw(ctx);return cv;
}
function add(scene:Phaser.Scene,key:string,w:number,h:number,draw:(ctx:Ctx)=>void):void{
  if(!scene.textures.exists(key))
    scene.textures.addCanvas(key,make(w,h,draw))?.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export const GA_SIGMA = {
  idle: { count:4, ms:180 },
  move: { count:6, ms:100 },
  hurt: { count:2, ms:90 },
  flex_charge: { count:4, ms:180 },
  flex_success: { count:3, ms:115 },
  death: { count:6, ms:110 },
} as const;
export type GateASigmaPose=keyof typeof GA_SIGMA;
export function gateASigmaKey(pose:GateASigmaPose,elapsedMs:number):string{
  const tag=GA_SIGMA[pose], index=Math.floor(Math.max(0,elapsedMs)/tag.ms);
  const f=(pose==="hurt"||pose==="death"||pose==="flex_success")
    ? Math.min(index,tag.count-1):index%tag.count;
  return "ga-sigma-"+pose+"-"+f;
}
export function gateAEnemyKey(type:"npc"|"hater",clock:number,id:number):string{
  const frame=Math.floor((clock+id*73)/145)%4;
  return "ga-"+type+"-move-"+frame;
}

function sigma(c:Ctx,pose:GateASigmaPose,f:number):void{
  const moving=pose==="move",charging=pose==="flex_charge";
  const flex=charging||pose==="flex_success";
  const hurt=pose==="hurt", dying=pose==="death";
  const hop=moving ? [0,1,1,0,-1,0][f] : pose==="idle" ? [0,0,1,0][f] : 0;
  const leg=moving?[0,2,3,0,-2,-1][f]:0;
  const y=hop;
  if(dying) { c.save();c.translate(23,37);c.rotate(Math.min(1,f/5)*.95);c.translate(-23,-37); }
  // Shoes: exaggerated blocky trainers with stable contact line.
  r(c,11+leg,37,12,8,C.ink);r(c,25-leg,37,12,8,C.ink);
  r(c,12+leg,39,10,5,C.ivory);r(c,26-leg,39,10,5,C.ivory);
  r(c,13+leg,38,7,3,C.hoodieLight);r(c,27-leg,38,7,3,C.hoodieLight);
  r(c,14+leg,43,10,2,C.shade);r(c,25-leg,43,12,2,C.shade);
  // Folded trousers and dramatic square hoodie.
  p(c,C.ink,[[15,27+y],[33,27+y],[37,40+y],[12,40+y]]);
  p(c,C.hoodie,[[17,28+y],[32,28+y],[33,38+y],[14,38+y]]);
  r(c,16,38+y,7,4,C.hoodieLight);r(c,27,38+y,5,4,C.hoodieLight);
  p(c,C.ink,[[14,21+y],[33,21+y],[40,28+y],[36,36+y],[13,36+y],[9,28+y]]);
  p(c,C.hoodie,[[15,23+y],[32,23+y],[37,29+y],[34,35+y],[14,35+y],[12,29+y]]);
  r(c,15,24+y,18,3,C.hoodieLight);r(c,16,28+y,3,6,C.hoodieLight);
  r(c,30,30+y,4,5,C.shade);
  // Aura insignia: clear 5px iconic diamond.
  p(c,C.gold,[[24,27+y],[29,31+y],[24,36+y],[19,31+y]]);
  p(c,C.goldLight,[[24,28+y],[24,34+y],[21,31+y]]);
  if(flex) {
    // Crossed arms: distinct readable silhouette.
    r(c,7,28+y,34,7,C.ink);r(c,9,29+y,30,4,C.hoodieLight);
    r(c,15,30+y,17,3,C.skin);r(c,19,32+y,12,2,C.skinShade);
    r(c,8,30+y,5,5,C.skin);r(c,35,30+y,5,5,C.skin);
  } else {
    const swing=moving?(f%2===0?-2:2):0;
    r(c,7,27+y+swing,8,11,C.ink);r(c,33,26+y-swing,8,12,C.ink);
    r(c,9,28+y+swing,5,8,C.hoodieLight);r(c,34,28+y-swing,5,8,C.hoodieLight);
    r(c,8,36+y+swing,7,4,C.skin);r(c,34,36+y-swing,7,4,C.skin);
  }
  // Oversized head and recognizable angular black hairstyle.
  r(c,12,8+y,25,19,C.ink);r(c,14,11+y,21,15,C.skin);
  r(c,15,21+y,19,4,C.skinShade);
  r(c,14,13+y,2,8,C.skinShade);
  r(c,16,16+y,18,7,C.skin);
  p(c,C.hair,[[11,13+y],[8,9+y],[14,9+y],[13,4+y],[21,8+y],
             [23,2+y],[29,7+y],[34,4+y],[35,10+y],[41,7+y],
             [38,17+y],[34,15+y],[29,12+y],[24,14+y],[17,12+y]]);
  p(c,C.hairLight,[[15,9+y],[20,7+y],[21,10+y],[17,11+y]]);
  r(c,29,7+y,4,2,C.hairLight);
  if(hurt) {
    r(c,17,18+y,6,2,C.ink);r(c,26,17+y,6,2,C.ink);
    r(c,21,23+y,7,1,C.red);
  } else {
    r(c,17,17+y,5,4,C.ink);r(c,28,17+y,5,4,C.ink);
    r(c,18,17+y,2,2,C.ivory);r(c,29,17+y,2,2,C.ivory);
    r(c,21,24+y,8,2,C.skinShade);r(c,24,24+y,4,1,C.ink);
  }
  if(charging){r(c,10,24+y,3,2,C.gold);r(c,37,25+y,3,2,C.gold);}
  if(pose==="flex_success"){r(c,5,18+y,3,5,C.gold);r(c,40,15+y,3,5,C.gold);}
  if(dying)c.restore();
}

function npc(c:Ctx,pose:"idle"|"move"|"hit"|"death",f:number):void{
  const b=pose==="move" ? [0,1,0,-1][f] : pose==="idle"? f%2:0;
  const step=pose==="move" ? (f%2?2:-2):0;
  if(pose==="death"){c.save();c.translate(24,34);c.rotate(f*.16);c.translate(-24,-34);}
  r(c,13+step,38,10,7,C.ink);r(c,26-step,38,10,7,C.ink);
  r(c,14+step,41,10,3,C.greyLight);r(c,26-step,41,10,3,C.greyLight);
  r(c,9,26+b,31,13,C.ink);r(c,12,27+b,25,11,C.grey);
  r(c,15,27+b,18,3,C.greyLight);
  r(c,8,29+b,7,11,C.ink);r(c,34,29+b,7,11,C.ink);
  r(c,9,30+b,5,8,C.grey);r(c,35,30+b,5,8,C.grey);
  r(c,11,10+b,27,20,C.ink);r(c,13,12+b,23,16,C.grey);
  // Squarish sleepy rival with cheap visor; not a plant.
  r(c,12,10+b,26,6,C.shade);r(c,15,10+b,20,3,C.greyLight);
  r(c,14,15+b,21,12,C.greyLight);
  r(c,18,20+b,4,3,C.ink);r(c,28,20+b,4,3,C.ink);
  r(c,20,20+b,1,1,C.ivory);r(c,29,20+b,1,1,C.ivory);
  r(c,22,25+b,7,1,C.grey);r(c,23,27+b,5,1,C.ink);
  r(c,17,33+b,14,2,C.shade);
  if(pose==="hit")r(c,14,15+b,20,9,C.coral);
  if(pose==="death")c.restore();
}
function hater(c:Ctx,pose:"idle"|"move"|"hit"|"death",f:number):void{
  const b=pose==="move"?[0,-1,0,1][f]:pose==="idle"?f:0;
  const step=pose==="move"? [0,2,0,-2][f]:0;
  if(pose==="death"){c.save();c.translate(25,36);c.rotate(-f*.18);c.translate(-25,-36);}
  r(c,11+step,38,12,7,C.ink);r(c,26-step,38,12,7,C.ink);
  r(c,14+step,40,7,4,C.red);r(c,28-step,40,8,4,C.red);
  p(c,C.ink,[[9,25+b],[16,22+b],[33,23+b],[41,27+b],[37,39+b],[11,39+b]]);
  p(c,C.plum,[[13,27+b],[34,26+b],[36,37+b],[13,37+b]]);
  p(c,C.red,[[15,28+b],[18,26+b],[17,35+b],[12,36+b]]);
  r(c,6,28+b,8,10,C.ink);r(c,35,28+b,9,10,C.ink);
  r(c,8,29+b,5,7,C.violet);r(c,37,29+b,5,7,C.violet);
  r(c,7,36+b,7,4,C.skin);r(c,37,36+b,7,4,C.skin);
  // Spiked hood/hair triangle creates a distinct ranged-mob silhouette.
  p(c,C.ink,[[11,24+b],[8,14+b],[14,13+b],[11,7+b],[20,9+b],
           [24,3+b],[31,10+b],[39,8+b],[37,16+b],[42,19+b],
           [36,28+b],[17,28+b]]);
  p(c,C.red,[[14,15+b],[18,12+b],[24,13+b],[31,10+b],[35,16+b],
             [34,27+b],[16,27+b]]);
  p(c,C.plum,[[16,14+b],[24,11+b],[26,14+b],[21,17+b]]);
  r(c,15,18+b,19,8,C.skin);
  r(c,16,18+b,17,2,C.skinShade);
  p(c,C.ink,[[15,19+b],[23,21+b],[23,23+b],[17,22+b]]);
  p(c,C.ink,[[27,21+b],[35,18+b],[33,23+b],[27,24+b]]);
  r(c,18,23+b,3,2,C.ivory);r(c,29,23+b,3,2,C.ivory);
  r(c,23,26+b,6,2,C.ink);
  if(pose==="hit")r(c,16,20+b,18,5,C.ivory);
  if(pose==="death")c.restore();
}

function gem(c:Ctx):void{
  p(c,C.ink,[[8,0],[15,6],[13,12],[8,16],[2,11],[1,5]]);
  p(c,"#31c58d",[[8,2],[13,6],[11,11],[8,14],[4,10],[3,6]]);
  p(c,"#b6ffe5",[[8,2],[8,13],[4,9],[4,6]]);
  p(c,"#167969",[[8,13],[11,11],[13,6],[8,8]]);
  r(c,7,4,2,3,"#f3fff2");
}
function shot(c:Ctx,hostile:boolean):void{
  const base=hostile?C.coral:C.cyan, edge=hostile?C.red:"#2a779b";
  p(c,C.ink,[[8,0],[15,8],[8,15],[0,8]]);
  p(c,edge,[[8,2],[13,8],[8,13],[2,8]]);
  p(c,base,[[8,3],[12,8],[8,11],[4,8]]);
  r(c,7,5,2,3,C.ivory);
}

function hit(c:Ctx,f:number):void{
  const colors=[C.ivory,C.gold,C.coral,C.gold];
  const distance=[3,7,11,14][f];
  const len=[6,7,5,3][f];
  const pts:[[number,number],[number,number],[number,number]]=[
    [16,16-distance],[16-len/2,16-distance-len],[16+len/2,16-distance-len]
  ];
  for(let a=0;a<8;a++){
    c.save();c.translate(16,16);c.rotate(a*Math.PI/4);c.translate(-16,-16);
    p(c,C.ink,pts.map(([x,y])=>[x,y+2] as Point));
    p(c,colors[f],pts);c.restore();
  }
  if(f<3)r(c,14,14,4,4,C.ivory);
}
function arenaFloor(c:Ctx):void{
  r(c,0,0,960,600,"#0d1729");
  r(c,0,0,960,83,C.shade);
  r(c,10,86,940,509,"#0c1527");
  r(c,17,92,926,493,"#515d72");
  for(let y=94;y<580;y+=32){
    for(let x=18;x<940;x+=32){
      const n=(Math.floor(x/32)*13+Math.floor(y/32)*19)%17;
      r(c,x,y,32,32,n<3?"#536176":"#515d72");
      r(c,x,y,32,1,"#58687c");
      r(c,x,y,1,32,"#4d5b70");
      if(n===7){r(c,x+12,y+18,8,2,"#46556c");r(c,x+13,y+16,3,1,"#697a89");}
      if(n===13){r(c,x+7,y+23,4,1,"#72849b");r(c,x+18,y+21,5,1,"#46536a");}
    }
  }
  // The center intentionally stays quiet; strong shapes live at perimeter.
  r(c,22,100,916,4,"#b0b6a5");r(c,22,574,916,4,"#a8b1ae");
  r(c,24,103,912,2,"#283950");r(c,24,569,912,2,"#283950");
  r(c,25,109,4,456,"#3b4e65");r(c,930,109,4,456,"#3b4e65");
  for(const x of [39,893]){
    for(const y of [127,530]){
      r(c,x,y,28,28,"#1b314c");r(c,x+4,y+4,20,20,"#647c94");
      r(c,x+6,y+6,16,16,"#1d3a5b");
      r(c,x+11,y+7,6,13,"#f9c954");r(c,x+8,y+11,13,5,"#f9c954");
    }
  }
  // Stage insignia is low contrast and outside the hero's spawn area.
  c.globalAlpha=.32;
  p(c,"#8e9eb1",[[468,168],[493,168],[511,184],[492,205],[468,205],[448,184]]);
  p(c,"#516f87",[[480,173],[503,187],[480,201],[457,187]]);
  c.globalAlpha=1;
  // Angled yellow safety markers, located only around the arena rails.
  for(let x=103;x<890;x+=133){
    p(c,"#b4a17b",[[x,99],[x+19,99],[x+13,105],[x-6,105]]);
    p(c,"#b4a17b",[[x,579],[x+18,579],[x+12,585],[x-6,585]]);
  }
  // Thin arena score ticks add a graphic identity, never gameplay obstacles.
  for(let i=0;i<8;i++){
    const x=337+i*39;
    r(c,x,106,23,2,"#8b97a3");r(c,x,565,23,2,"#8b97a3");
  }
}

export function createGateA(scene:Phaser.Scene):void{
  if(!isGateA())return;
  Object.entries(GA_SIGMA).forEach(([pose,tag])=>{
    for(let i=0;i<tag.count;i++)
      add(scene,"ga-sigma-"+pose+"-"+i,48,48,c=>sigma(c,pose as GateASigmaPose,i));
  });
  for(const type of ["npc","hater"] as const){
    for(let i=0;i<2;i++)add(scene,"ga-"+type+"-idle-"+i,48,48,c=>
      type==="npc"?npc(c,"idle",i):hater(c,"idle",i));
    for(let i=0;i<4;i++)add(scene,"ga-"+type+"-move-"+i,48,48,c=>
      type==="npc"?npc(c,"move",i):hater(c,"move",i));
    add(scene,"ga-"+type+"-hit-0",48,48,c=>
      type==="npc"?npc(c,"hit",0):hater(c,"hit",0));
    for(let i=0;i<4;i++)add(scene,"ga-"+type+"-death-"+i,48,48,c=>
      type==="npc"?npc(c,"death",i):hater(c,"death",i));
  }
  add(scene,"ga-floor",960,600,arenaFloor);
  add(scene,"ga-xp",16,16,gem);
  add(scene,"ga-shot-friendly",16,16,c=>shot(c,false));
  add(scene,"ga-shot-hostile",16,16,c=>shot(c,true));
  for(let i=0;i<4;i++)add(scene,"ga-hit-"+i,32,32,c=>hit(c,i));
}
