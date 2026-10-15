import Phaser from 'phaser';
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
export function effectKey(kind:FxKind,t:number,ttl:number):string{
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
export function createEffects(scene:Phaser.Scene):void{
 add(scene,'af-xp',16,16,xp);
 add(scene,'af-shot',16,16,c=>projectile(c,false));
 add(scene,'af-hostile',16,16,c=>projectile(c,true));
 for(const kind of Object.keys(fxFrames) as FxKind[]){
  const size=kind==='burst'||kind==='boss_warn'?96:40;
  for(let f=0;f<fxFrames[kind];f++)
   add(scene,'af-fx-'+kind+'-'+f,size,size,c=>fx(c,kind,f,size));
 }
}
