import { isFinalArt } from './finalArt';
import Phaser from 'phaser';

/** Gate B2 — three character silhouette/animation studies.
 * 48px-native authored primitives, coherent character proportions across poses.
 * These are editable code studies, not signed-off production atlas exports.
 */
export const isGateB2=():boolean=>new URLSearchParams(location.search).get('gateB')==='2';
export type B2Id='ohio'|'fanum'|'six-seven';
export type B2Pose='idle'|'move'|'hurt'|'flex_charge'|'flex_success'|'death'|'dash'|'tax'|'volley';
type Tag={n:number,ms:number};
const common:Record<B2Pose,Tag>={
 idle:{n:4,ms:160},move:{n:6,ms:85},hurt:{n:2,ms:95},flex_charge:{n:4,ms:160},
 flex_success:{n:3,ms:115},death:{n:6,ms:115},dash:{n:6,ms:65},tax:{n:4,ms:75},volley:{n:6,ms:60},
};
export function b2Key(id:B2Id,pose:B2Pose,elapsedMs:number):string{
 const t=common[pose],f=Math.floor(Math.max(0,elapsedMs)/t.ms);
 const oneShot=['hurt','death','flex_success','tax','volley'].includes(pose);
 return 'gb2-'+id+'-'+pose+'-'+(oneShot?Math.min(t.n-1,f):f%t.n);
}
type C=CanvasRenderingContext2D;
type P=[number,number];
const col={
 ink:'#182439',shadow:'#0f192c',white:'#fff3df',skin:'#f2ba95',skinLow:'#d48d70',
 cyan:'#56d5eb',cyanHi:'#bcf5ff',cyanLow:'#2289bd',blue:'#263951',shoe:'#243148',
 mint:'#6ee2b2',mintHi:'#d5ffe7',mintLow:'#239e91',indigo:'#464277',
 gold:'#ffd15c',goldHi:'#fff2b5',goldLow:'#d59a38',violet:'#7261b8',red:'#e96a80'
} as const;
const box=(c:C,x:number,y:number,w:number,h:number,f:string):void=>{c.fillStyle=f;c.fillRect(Math.round(x),Math.round(y),w,h)};
const poly=(c:C,f:string,pts:P[]):void=>{c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=f;c.fill()};
const canvas=(draw:(ctx:C)=>void):HTMLCanvasElement=>{
 const cv=document.createElement('canvas');cv.width=48;cv.height=48;
 const ctx=cv.getContext('2d',{alpha:true})!;ctx.imageSmoothingEnabled=false;draw(ctx);return cv;
};
function sharedFeet(c:C,id:B2Id,f:number,pose:B2Pose):void{
 const running=pose==='move'||pose==='dash',s=running?[0,2,3,0,-2,-3][f%6]:0;
 const top=id==='ohio'?col.cyan:id==='fanum'?col.mint:col.gold;
 box(c,9+s,37,14,9,col.ink);box(c,26-s,37,14,9,col.ink);
 box(c,10+s,39,12,5,col.shoe);box(c,27-s,39,12,5,col.shoe);
 box(c,10+s,44,14,2,top);box(c,26-s,44,14,2,top);
}
function ohio(c:C,pose:B2Pose,f:number):void{
 const run=pose==='dash'||pose==='move';
 const bob=run?[0,1,0,-1,0,1][f%6]:0;
 const lean=run?2:0;
 sharedFeet(c,'ohio',f,pose);
 // Narrow diagonal track jacket and exaggerated sneaker profile.
 poly(c,col.ink,[[10+lean,24+bob],[31+lean,21+bob],[40+lean,27+bob],[36,38+bob],[11,38+bob],[7,30+bob]]);
 poly(c,col.cyan,[[12+lean,26+bob],[31+lean,23+bob],[36,29+bob],[33,37+bob],[12,37+bob]]);
 box(c,18+lean,27+bob,14,8,col.blue);
 poly(c,col.cyanHi,[[13+lean,26+bob],[20+lean,25+bob],[14+lean,36+bob]]);
 box(c,23+lean,26+bob,2,10,col.white);box(c,28+lean,30+bob,4,2,col.cyanLow);
 if(pose==='flex_charge'||pose==='flex_success'){
   box(c,5,30+bob,37,7,col.ink);box(c,8,31+bob,32,5,col.cyanLow);
   box(c,15,32+bob,19,3,col.skin);box(c,7,33+bob,7,6,col.skin);
 }else{
   const swing=run?[3,1,-1,2,4,0][f%6]:0;
   box(c,6+lean,27+bob-swing,8,11,col.ink);
   box(c,8+lean,28+bob-swing,5,8,col.cyanLow);box(c,8+lean,36+bob-swing,6,5,col.skin);
   box(c,34+lean,27+bob+swing,8,11,col.ink);
   box(c,35+lean,28+bob+swing,6,8,col.blue);box(c,36+lean,36+bob+swing,6,5,col.skin);
 }
 // Lightning visor plus asymmetrical sharp hair.
 box(c,12+lean,11+bob,26,19,col.ink);box(c,14+lean,14+bob,22,13,col.skin);
 box(c,16+lean,24+bob,18,4,col.skinLow);
 poly(c,col.ink,[[11+lean,17+bob],[8+lean,10+bob],[15+lean,9+bob],[18+lean,3+bob],
 [23+lean,8+bob],[30+lean,4+bob],[40+lean,8+bob],[36+lean,18+bob]]);
 box(c,13+lean,14+bob,24,4,col.cyanLow);box(c,16+lean,14+bob,18,2,col.cyanHi);
 if(pose==='hurt'){box(c,17+lean,20+bob,7,2,col.ink);box(c,29+lean,20+bob,7,2,col.ink);}
 else{box(c,17+lean,20+bob,5,3,col.ink);box(c,28+lean,20+bob,5,3,col.ink);
 box(c,18+lean,20+bob,2,1,col.white);box(c,29+lean,20+bob,2,1,col.white);}
 box(c,24+lean,25+bob,6,1,col.ink);
 // Deliberate cyan speed ticks appear only during moving, not idle glow.
 if(run&&f%3>0){box(c,1,23+bob,4,2,col.cyanHi);box(c,0,31+bob,6,2,col.cyan);}
 if(pose==='flex_success'){box(c,5,17,4,5,col.gold);box(c,40,19,4,5,col.gold);}
}
function fanum(c:C,pose:B2Pose,f:number):void{
 const bob=pose==='move'?[0,1,0,-1,0,1][f%6]:0;
 sharedFeet(c,'fanum',f,pose);
 // Round-body indigo hoodie + BIG messenger bag: not a plant or fruit.
 poly(c,col.ink,[[10,23+bob],[37,23+bob],[43,29+bob],[39,40+bob],[9,40+bob],[5,29+bob]]);
 poly(c,col.indigo,[[12,25+bob],[37,25+bob],[40,31+bob],[37,39+bob],[11,39+bob],[8,31+bob]]);
 box(c,13,28+bob,25,9,col.mintLow);
 box(c,16,29+bob,20,7,col.mint);box(c,19,31+bob,6,3,col.mintHi);
 // Diagonal strap and large satchel on one side
 poly(c,col.ink,[[31,22+bob],[35,23+bob],[21,38+bob],[17,36+bob]]);
 poly(c,col.gold,[[31,24+bob],[33,24+bob],[20,36+bob],[19,35+bob]]);
 box(c,29,30+bob,13,13,col.ink);box(c,30,31+bob,11,11,col.mintLow);
 box(c,30,32+bob,11,4,col.mint);box(c,34,37+bob,4,3,col.gold);
 const collecting=pose==='tax';
 if(collecting){
  const reach=[0,3,6,2][f%4];
  box(c,3,27+bob,11,9,col.ink);box(c,4,28+bob,8,7,col.indigo);
  box(c,34,25+bob-reach,10,9,col.ink);box(c,35,26+bob-reach,7,6,col.indigo);
  box(c,37,22+bob-reach,7,6,col.skin);
  if(f>1){box(c,41,17+bob-reach,5,5,col.mintHi);}
 }else if(pose==='flex_charge'||pose==='flex_success'){
  box(c,5,27+bob,37,9,col.ink);box(c,8,28+bob,32,6,col.indigo);
  box(c,15,31+bob,20,3,col.skin);
 }else{
  box(c,3,27+bob,10,11,col.ink);box(c,5,28+bob,7,8,col.indigo);
  box(c,38,27+bob,8,10,col.ink);box(c,39,28+bob,6,8,col.indigo);
  box(c,5,35+bob,9,5,col.skin);box(c,39,35+bob,7,5,col.skin);
 }
 // Cap with visor; face sits lower for compact, broad silhouette.
 box(c,12,10+bob,27,20,col.ink);box(c,14,14+bob,23,13,col.skin);
 box(c,14,24+bob,23,4,col.skinLow);
 box(c,12,9+bob,27,8,col.indigo);box(c,15,8+bob,19,4,col.mint);
 box(c,24,15+bob,18,4,col.ink);box(c,25,16+bob,17,2,col.mintLow);
 if(pose==='hurt'){box(c,17,19+bob,6,2,col.ink);box(c,29,19+bob,6,2,col.ink);}
 else{box(c,18,20+bob,5,3,col.ink);box(c,30,20+bob,5,3,col.ink);}
 box(c,25,26+bob,6,2,col.ink);
 if(pose==='flex_success'){box(c,3,13,5,5,col.gold);box(c,40,12,5,5,col.gold);}
}
function sixSeven(c:C,pose:B2Pose,f:number):void{
 const bob=pose==='move'?[0,1,0,-1,0,1][f%6]:0;
 sharedFeet(c,'six-seven',f,pose);
 poly(c,col.ink,[[10,23+bob],[36,23+bob],[41,30+bob],[36,40+bob],[12,40+bob],[7,30+bob]]);
 poly(c,col.violet,[[13,25+bob],[35,25+bob],[38,31+bob],[34,39+bob],[14,39+bob],[10,31+bob]]);
 box(c,17,27+bob,17,9,col.ink);
 box(c,18,28+bob,15,7,col.gold);
 // Crisp 6 and 7 glyphs drawn at native resolution — no font rendering.
 box(c,20,29+bob,5,1,col.ink);box(c,20,30+bob,1,4,col.ink);
 box(c,20,32+bob,5,1,col.ink);box(c,24,33+bob,1,2,col.ink);box(c,20,34+bob,5,1,col.ink);
 box(c,27,29+bob,5,1,col.ink);box(c,31,30+bob,1,5,col.ink);
 if(pose==='volley'){
  const spread=[0,2,5,7,5,3][f%6];
  box(c,1,23+bob-spread,10,9,col.ink);box(c,2,24+bob-spread,7,7,col.gold);
  box(c,39,23+bob-spread,9,9,col.ink);box(c,40,24+bob-spread,7,7,col.gold);
  if(f>1){box(c,0,10,4,5,col.goldHi);box(c,44,10,4,5,col.gold);}
 }else if(pose==='flex_charge'||pose==='flex_success'){
  box(c,4,28+bob,39,8,col.ink);box(c,7,29+bob,34,5,col.violet);
  box(c,15,31+bob,20,3,col.skin);
 }else{
  const swing=pose==='move'?(f%2?2:-2):0;
  box(c,5,27+bob+swing,9,11,col.ink);box(c,6,28+bob+swing,7,8,col.violet);
  box(c,36,27+bob-swing,9,11,col.ink);box(c,37,28+bob-swing,7,8,col.violet);
  box(c,5,35+bob+swing,8,5,col.skin);box(c,38,35+bob-swing,7,5,col.skin);
 }
 box(c,13,10+bob,26,18,col.ink);box(c,15,13+bob,22,13,col.skin);
 box(c,16,23+bob,20,4,col.skinLow);
 // Crisp angular visor, tilted cap brim to one side.
 poly(c,col.ink,[[11,12+bob],[14,7+bob],[24,4+bob],[36,7+bob],[40,12+bob],[34,15+bob]]);
 box(c,16,8+bob,19,5,col.violet);box(c,18,8+bob,13,2,col.gold);
 poly(c,col.ink,[[30,12+bob],[42,13+bob],[42,17+bob],[30,16+bob]]);
 box(c,32,13+bob,8,2,col.goldLow);
 if(pose==='hurt'){box(c,18,20+bob,6,1,col.ink);box(c,30,20+bob,6,1,col.ink);}
 else{box(c,18,19+bob,6,3,col.ink);box(c,29,19+bob,6,3,col.ink);}
 box(c,23,25+bob,8,1,col.ink);
 if(pose==='flex_success'){box(c,4,13,4,5,col.goldHi);box(c,40,13,4,5,col.goldHi);}
}
function draw(c:C,id:B2Id,pose:B2Pose,f:number):void{
 const dying=pose==='death';
 if(dying){c.save();c.translate(23,36);c.rotate(f*.17);c.translate(-23,-36);}
 if(id==='ohio')ohio(c,pose,f);
 else if(id==='fanum')fanum(c,pose,f);
 else sixSeven(c,pose,f);
 if(dying)c.restore();
}
function source(id:B2Id,pose:B2Pose,f:number):HTMLCanvasElement{
 return canvas(c=>draw(c,id,pose,f));
}
export function createGateB2Heroes(scene:Phaser.Scene):void{
 if(!isGateB2() && !isFinalArt())return;
 for(const id of ['ohio','fanum','six-seven'] as B2Id[]){
  for(const pose of ['idle','move','hurt','flex_charge','flex_success','death',
     id==='ohio'?'dash':id==='fanum'?'tax':'volley'] as B2Pose[]){
   const tag=common[pose];
   for(let i=0;i<tag.n;i++){
    const key='gb2-'+id+'-'+pose+'-'+i;
    if(!scene.textures.exists(key))
      scene.textures.addCanvas(key,source(id,pose,i))?.setFilter(Phaser.Textures.FilterMode.NEAREST);
   }
  }
 }
}
const portraitCache=new Map<B2Id,string>();
export function gateB2Portrait(id:B2Id):string{
 let url=portraitCache.get(id);
 if(!url){url=source(id,'idle',0).toDataURL('image/png');portraitCache.set(id,url);}
 return url;
}
