import Phaser from 'phaser';
import type {EnemyType} from '../data/enemies';

/**
 * Aura Arena visual-release assets. Designed in a constrained native-pixel
 * vocabulary: fixed silhouette masses, shared ink, controlled highlight and
 * action timing. Canvas draws are authored here and can be edited without
 * asking an image model to invent inconsistent frames.
 */
export function isFinalArt():boolean {
  const p=new URLSearchParams(window.location.search);
  return p.get('visual')!=='legacy' && !p.has('gateA') && !p.has('gateB');
}
type C=CanvasRenderingContext2D;
type P=[number,number];
const pal={ink:'#172235',deep:'#0b1426',white:'#fff0d5',bone:'#d2dce1',
  coral:'#ff647b',coralHi:'#ffb2b0',magenta:'#a94dba',magentaHi:'#e6a8ef',
  slate:'#3f5775',slateHi:'#8097b4',shade:'#29374c',
  mint:'#6cddad',mintHi:'#d9ffec',gold:'#ffc851',goldHi:'#fff4b2'} as const;
const r=(c:C,x:number,y:number,w:number,h:number,color:string):void=>{
 c.fillStyle=color;c.fillRect(Math.round(x),Math.round(y),w,h);
};
function poly(c:C,color:string,pts:P[]):void{
 c.fillStyle=color;c.beginPath();pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
}
function canvas(w:number,h:number,fn:(c:C)=>void):HTMLCanvasElement{
 const cv=document.createElement('canvas');cv.width=w;cv.height=h;
 const c=cv.getContext('2d',{alpha:true})!;c.imageSmoothingEnabled=false;fn(c);return cv;
}
function add(scene:Phaser.Scene,key:string,w:number,h:number,paint:(c:C)=>void):void{
 if(!scene.textures.exists(key))
  scene.textures.addCanvas(key,canvas(w,h,paint))?.setFilter(Phaser.Textures.FilterMode.NEAREST);
}

export type EnemyPose='idle'|'move'|'hit'|'attack'|'death';
const frameMs:Record<EnemyPose,number>={idle:180,move:135,hit:80,attack:105,death:95};
const counts:Record<EnemyPose,number>={idle:4,move:4,hit:2,attack:5,death:7};
export function finalEnemyKey(type:EnemyType,pose:EnemyPose,elapsed:number,id=0):string{
 const f=Math.max(0,Math.floor((elapsed+(pose==='move'?id*21:0))/frameMs[pose]));
 const frame=pose==='hit'||pose==='attack'||pose==='death'?Math.min(counts[pose]-1,f):f%counts[pose];
 return 'af-enemy-'+type+'-'+pose+'-'+frame;
}
function npc(c:C,pose:EnemyPose,f:number):void{
 const y=pose==='move'?[0,1,0,-1][f%4]:pose==='idle'?[0,0,1,0][f%4]:0;
 const step=pose==='move'?(f%2?2:-2):0;
 r(c,10+step,39,12,7,pal.ink);r(c,25-step,39,12,7,pal.ink);
 r(c,12+step,40,9,4,pal.slateHi);r(c,27-step,40,9,4,pal.slateHi);
 poly(c,pal.ink,[[11,24+y],[36,24+y],[43,32+y],[37,41+y],[9,41+y],[5,32+y]]);
 poly(c,pal.slate,[[13,26+y],[34,26+y],[39,33+y],[35,39+y],[13,39+y],[10,33+y]]);
 r(c,18,29+y,12,3,pal.slateHi);
 r(c,5,29+y,9,11,pal.ink);r(c,34,29+y,9,11,pal.ink);
 r(c,7,30+y,6,8,pal.slateHi);r(c,35,30+y,6,8,pal.slateHi);
 r(c,12,10+y,26,20,pal.ink);r(c,14,12+y,22,16,pal.bone);
 r(c,13,10+y,25,7,pal.shade);r(c,16,10+y,19,3,pal.slateHi);
 r(c,16,19+y,7,4,pal.ink);r(c,28,19+y,7,4,pal.ink);
 r(c,18,19+y,2,1,pal.white);r(c,30,19+y,2,1,pal.white);
 r(c,22,25+y,9,2,pal.shade);
 if(pose==='hit')r(c,17,17+y,17,7,pal.coralHi);
 if(pose==='attack'){r(c,4,26+y,9+f*2,6,pal.slateHi);}
}
function hater(c:C,pose:EnemyPose,f:number):void{
 const y=pose==='move'?[0,1,0,-1][f%4]:0;
 const a=pose==='attack'?f:0;
 r(c,10,39,12,7,pal.ink);r(c,27,39,12,7,pal.ink);
 r(c,12,41,9,4,pal.coral);r(c,28,41,9,4,pal.coral);
 poly(c,pal.ink,[[8,29+y],[16,23+y],[35,23+y],[44,30+y],[39,41+y],[10,41+y]]);
 poly(c,pal.magenta,[[14,26+y],[33,25+y],[39,32+y],[34,38+y],[13,38+y]]);
 r(c,7,29+y,8,11,pal.ink);r(c,36,29+y,8,11,pal.ink);
 r(c,8,30+y,6,8,pal.coral);r(c,37,30+y,5,8,pal.coral);
 poly(c,pal.ink,[[9,22+y],[8,11+y],[14,13+y],[18,4+y],[25,10+y],[30,3+y],[36,13+y],[42,10+y],[39,26+y]]);
 poly(c,pal.coral,[[15,15+y],[22,11+y],[30,13+y],[36,17+y],[34,26+y],[17,26+y]]);
 r(c,17,19+y,17,7,pal.white);
 poly(c,pal.ink,[[17,19+y],[23,22+y],[23,24+y],[18,23+y]]);
 poly(c,pal.ink,[[27,22+y],[34,19+y],[33,24+y],[27,24+y]]);
 r(c,22,26+y,9,2,pal.ink);
 if(a){r(c,37,21+y,7+a,6,pal.ink);r(c,40,22+y,5+a,4,pal.coral);}
 if(pose==='hit')r(c,17,20+y,16,4,pal.coralHi);
}
function beta(c:C,pose:EnemyPose,f:number):void{
 const hop=pose==='move'?[0,1,0,-1][f%4]:0;
 const a=pose==='attack'?[0,1,2,6,1][f]:0;
 // 64×64 broad heavyweight, giant rectangular fists.
 r(c,9,53,18,9,pal.ink);r(c,35,53,18,9,pal.ink);
 r(c,12,55,14,5,pal.slateHi);r(c,36,55,14,5,pal.slateHi);
 poly(c,pal.ink,[[13,25+hop],[45,24+hop],[56,33+hop],[52,56+hop],[10,56+hop],[6,34+hop]]);
 poly(c,pal.slate,[[16,28+hop],[45,27+hop],[52,35+hop],[48,53+hop],[13,53+hop],[11,35+hop]]);
 r(c,22,30+hop,20,16,pal.magenta);r(c,25,32+hop,15,11,pal.magentaHi);
 // Squared shoulder pads remain prominent at game zoom.
 r(c,4,31+hop,15+a,18,pal.ink);r(c,45,30+hop,15+a,19,pal.ink);
 r(c,6,33+hop,12+a,12,pal.slateHi);r(c,47,32+hop,11+a,13,pal.slateHi);
 r(c,2,45+hop,18+a,11,pal.ink);r(c,46,45+hop,17+a,11,pal.ink);
 r(c,4,47+hop,14+a,7,pal.magenta);r(c,48,47+hop,13+a,7,pal.magenta);
 r(c,14,9+hop,37,27,pal.ink);r(c,17,12+hop,31,21,pal.bone);
 // Close-cropped sharp hair and broad jaw.
 poly(c,pal.shade,[[14,17+hop],[15,8+hop],[23,10+hop],[28,5+hop],[35,8+hop],[47,6+hop],[51,17+hop]]);
 r(c,20,19+hop,11,5,pal.ink);r(c,37,19+hop,10,5,pal.ink);
 r(c,23,21+hop,4,2,pal.white);r(c,39,21+hop,4,2,pal.white);
 r(c,23,29+hop,19,5,pal.ink);r(c,27,31+hop,11,1,pal.white);
 if(pose==='hit'){r(c,19,18+hop,29,9,pal.coralHi);}
}
function boss(c:C,pose:EnemyPose,f:number):void{
 const hop=pose==='move'?[0,2,1,-1][f%4]:pose==='idle'?[0,0,1,0][f%4]:0;
 const swing=pose==='attack'?[0,3,8,16,6][f]:0;
 // 128x128: consistent 5-mass villain silhouette, not an ornate fantasy creature.
 r(c,22,108,34,16,pal.ink);r(c,74,108,34,16,pal.ink);
 r(c,26,111,28,10,pal.slate);r(c,77,111,27,10,pal.slate);
 poly(c,pal.ink,[[27,55+hop],[100,55+hop],[115,84+hop],[105,114+hop],[22,114+hop],[13,83+hop]]);
 poly(c,pal.magenta,[[33,61+hop],[96,61+hop],[107,83+hop],[98,110+hop],[28,110+hop],[20,84+hop]]);
 r(c,34,73+hop,61,24,pal.shade);r(c,42,79+hop,47,11,pal.magentaHi);
 poly(c,pal.ink,[[35,57+hop],[63,68+hop],[92,57+hop],[85,76+hop],[43,76+hop]]);
 // Huge padded hands telegraph punching ranges without affecting collision.
 r(c,4,71+hop,29+swing,38,pal.ink);r(c,92-swing,68+hop,31+swing,40,pal.ink);
 r(c,9,75+hop,20+swing,28,pal.coral);r(c,97-swing,72+hop,21+swing,28,pal.coral);
 r(c,12,77+hop,12,5,pal.coralHi);r(c,102-swing,73+hop,12,5,pal.coralHi);
 // Jaw / lower face is a consistent rounded hexagon.
 poly(c,pal.ink,[[31,22+hop],[95,22+hop],[105,41+hop],[95,71+hop],[80,82+hop],[48,82+hop],[30,70+hop],[23,41+hop]]);
 poly(c,pal.coral,[[35,26+hop],[91,26+hop],[99,44+hop],[89,68+hop],[77,76+hop],[50,76+hop],[36,67+hop],[29,43+hop]]);
 r(c,44,63+hop,43,8,pal.magenta);r(c,52,71+hop,27,3,pal.ink);
 // Jagged signature crown / hair, graphic not organic.
 poly(c,pal.ink,[[23,36+hop],[17,13+hop],[35,18+hop],[38,2+hop],[52,17+hop],
  [62,3+hop],[76,17+hop],[91,5+hop],[98,22+hop],[112,15+hop],[104,45+hop],
  [95,39+hop],[80,35+hop],[64,33+hop],[46,35+hop],[31,40+hop]]);
 poly(c,pal.shade,[[28,30+hop],[40,12+hop],[53,27+hop],[63,16+hop],[76,26+hop],
  [91,17+hop],[101,34+hop],[80,30+hop],[52,29+hop]]);
 // Aggressive square eyes, iconic angry mouth.
 poly(c,pal.ink,[[36,48+hop],[57,52+hop],[57,60+hop],[39,57+hop]]);
 poly(c,pal.ink,[[71,52+hop],[92,47+hop],[89,57+hop],[71,60+hop]]);
 r(c,43,53+hop,8,4,pal.white);r(c,77,52+hop,8,4,pal.white);
 poly(c,pal.ink,[[49,65+hop],[79,65+hop],[85,71+hop],[74,78+hop],[57,78+hop],[42,71+hop]]);
 r(c,55,70+hop,18,3,pal.white);r(c,60,73+hop,8,3,pal.white);
 if(pose==='hit')r(c,39,45+hop,52,12,pal.coralHi);
 if(pose==='attack' && f===3)r(c,50,85+hop,27,8,pal.gold);
}
function enemyDraw(c:C,type:EnemyType,pose:EnemyPose,f:number):void{
 const size=type==='boss'?128:type==='beta'?64:48;
 if(pose==='death'){c.save();c.translate(size/2,size*.82);c.rotate(f*.13);c.translate(-size/2,-size*.82);c.globalAlpha=Math.max(.1,1-f/8);}
 if(type==='npc')npc(c,pose,f);
 else if(type==='hater')hater(c,pose,f);
 else if(type==='beta')beta(c,pose,f);
 else boss(c,pose,f);
 if(pose==='death')c.restore();
}
function xp(c:C):void{
 poly(c,pal.ink,[[8,0],[15,5],[15,10],[8,16],[1,10],[1,5]]);
 poly(c,pal.mint,[[8,2],[13,6],[12,10],[8,14],[3,10],[3,6]]);
 poly(c,pal.mintHi,[[8,2],[8,13],[4,9],[4,6]]);
 r(c,7,4,2,3,pal.white);
}
function projectile(c:C,hostile:boolean):void{
 if(hostile){
  poly(c,pal.ink,[[8,0],[12,4],[16,8],[11,11],[8,16],[5,11],[0,8],[4,4]]);
  poly(c,pal.coral,[[8,2],[13,8],[8,13],[3,8]]);
  poly(c,pal.coralHi,[[8,4],[10,8],[8,10],[6,8]]);
 }else{
  poly(c,pal.ink,[[1,10],[7,2],[15,7],[8,15]]);
  poly(c,pal.gold,[[4,9],[8,4],[13,7],[8,12]]);
  r(c,7,6,3,2,pal.white);
 }
}
export type FxKind='hit'|'crit'|'death'|'burst'|'heal'|'charge'|'boss_warn';
const fxFrames:Record<FxKind,number>={hit:5,crit:5,death:6,burst:7,heal:5,charge:5,boss_warn:5};
export function finalFxKey(kind:FxKind,t:number,ttl:number):string{
 const count=fxFrames[kind];
 return 'af-fx-'+kind+'-'+Math.min(count-1,Math.max(0,Math.floor(t/ttl*count)));
}
function fx(c:C,kind:FxKind,f:number,n:number):void{
 const mid=n/2,progress=(f+1)/fxFrames[kind],radius=kind==='burst'?(10+progress*36):kind==='boss_warn'?(16+progress*20):(3+progress*11);
 const clr=kind==='hit'?pal.white:kind==='crit'||kind==='burst'?pal.gold:kind==='death'?pal.magentaHi:kind==='heal'?pal.mint:kind==='charge'?pal.goldHi:pal.coral;
 if(kind==='burst'||kind==='boss_warn'){
  c.save();c.translate(mid,mid);
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,dist=radius;
   c.save();c.rotate(a);
   r(c,dist,-2,kind==='burst'?9:5,kind==='burst'?4:3,clr);
   if(f<3)r(c,dist+2,0,3,2,pal.white);
   c.restore();
  }
  c.restore();
 }else{
  c.save();c.translate(mid,mid);
  for(let i=0;i<(kind==='crit'?8:kind==='heal'?4:6);i++){
   c.save();c.rotate(i*Math.PI/(kind==='heal'?2:kind==='crit'?4:3));
   r(c,radius,-2,Math.max(2,8-f),kind==='death'?5:3,clr);
   if(kind==='heal')r(c,radius+2,-4,2,8,pal.mintHi);
   c.restore();
  }
  c.restore();
 }
 if(kind==='crit'&&f<3)r(c,mid-3,mid-3,6,6,pal.white);
}
function arenaFloor(c:C):void{
 // Custom quiet modular metal/plastic arena; not a garden and not a painting.
 r(c,0,0,960,600,'#0a1426');
 r(c,0,0,960,82,'#101e33');
 r(c,12,86,936,508,'#14263d');
 r(c,20,93,920,492,'#495a71');
 for(let y=97;y<578;y+=32)for(let x=24;x<937;x+=32){
  const row=Math.floor((y-97)/32),col=Math.floor((x-24)/32);
  const v=(row*31+col*17+row*col*7)%31;
  r(c,x,y,32,32,v===0?'#526279':v%7===0?'#4c5e75':'#495a71');
  r(c,x,y,32,1,'#51637a');r(c,x,y,1,32,'#45576d');
  if(v===7){r(c,x+9,y+19,8,1,'#394e66');r(c,x+11,y+17,3,1,'#75879a');}
  if(v===19){r(c,x+18,y+7,5,1,'#738396');}
 }
 // Center deliberately quiet; strong stage motifs at rails, not under hazards.
 r(c,20,93,920,6,'#233950');r(c,20,577,920,7,'#26394d');
 r(c,20,93,6,490,'#2a425c');r(c,934,93,6,490,'#2a425c');
 r(c,30,104,900,3,'#8291a1');r(c,30,568,900,3,'#8291a1');
 // Safety chevrons built from manual native-pixel geometry.
 for(let x=45;x<913;x+=86){
  poly(c,'#ddba70',[[x,95],[x+17,95],[x+9,102],[x-8,102]]);
  poly(c,'#ddba70',[[x,580],[x+17,580],[x+9,587],[x-8,587]]);
 }
 // Four distinctive scoreboard power fixtures, all off center.
 for(const x of [33,894])for(const y of [122,514]){
  r(c,x,y,34,34,pal.ink);r(c,x+3,y+3,28,28,pal.slate);
  r(c,x+7,y+7,20,20,'#243950');
  r(c,x+15,y+8,4,18,pal.gold);
  r(c,x+8,y+15,18,4,pal.gold);
 }
 // subtle Aura insignia above player level but NOT neon floor noise
 c.globalAlpha=.25;
 poly(c,'#99b4c6',[[480,160],[504,178],[480,196],[456,178]]);
 poly(c,'#1d3450',[[480,167],[496,178],[480,189],[464,178]]);
 c.globalAlpha=1;
 // Stage lines on perimeter create arcade-sport visual identity.
 for(let i=0;i<11;i++){r(c,275+i*38,111,18,2,'#9baabd');r(c,275+i*38,561,18,2,'#9baabd');}
}
export function loadFinalArt(scene:Phaser.Scene):void{
 if(!isFinalArt())return;
 add(scene,'af-arena',960,600,arenaFloor);
 for(const type of ['npc','hater','beta','boss'] as EnemyType[]){
  const sz=type==='boss'?128:type==='beta'?64:48;
  for(const pose of ['idle','move','hit','attack','death'] as EnemyPose[]){
   for(let f=0;f<counts[pose];f++)
    add(scene,'af-enemy-'+type+'-'+pose+'-'+f,sz,sz,c=>enemyDraw(c,type,pose,f));
  }
 }
 add(scene,'af-xp',16,16,xp);
 add(scene,'af-shot',16,16,c=>projectile(c,false));
 add(scene,'af-hostile',16,16,c=>projectile(c,true));
 for(const kind of Object.keys(fxFrames) as FxKind[]){
  const size=kind==='burst'||kind==='boss_warn'?96:40;
  for(let f=0;f<fxFrames[kind];f++)
   add(scene,'af-fx-'+kind+'-'+f,size,size,c=>fx(c,kind,f,size));
 }
}
export const finalArtKeys=()=>[
 'af-arena','af-xp','af-shot','af-hostile','af-enemy-boss-idle-0','af-enemy-beta-idle-0',
 'af-fx-hit-0','af-fx-crit-0','af-fx-death-0','af-fx-burst-0','af-fx-heal-0','af-fx-boss_warn-0'
] as const;
