import Phaser from 'phaser';

/** Gate B / Hero Identity Slice
 * Original code-authored pixel studies, not externally painted final atlases.
 * Rendered at native 48px with deliberately fixed wardrobe and silhouette.
 */
export const isGateB = (): boolean =>
  new URLSearchParams(window.location.search).get('gateB') === '1';
export type GateBHero = 'alpha' | 'rizzler';
export type GateBHeroPose = 'idle'|'move'|'hurt'|'flex_charge'|'flex_success'|'death'|'punch'|'cast';
const TAGS:Record<GateBHeroPose,{count:number;duration:number}> = {
  idle:{count:4,duration:175},move:{count:6,duration:95},
  hurt:{count:2,duration:85},flex_charge:{count:4,duration:145},
  flex_success:{count:3,duration:120},death:{count:6,duration:120},
  punch:{count:6,duration:29},cast:{count:6,duration:52},
};
export function gateBHeroKey(id:GateBHero,pose:GateBHeroPose,elapsed:number):string {
  const t=TAGS[pose];
  const raw=Math.floor(Math.max(0,elapsed)/t.duration);
  const i=(pose==='death'||pose==='hurt'||pose==='flex_success'||pose==='punch'||pose==='cast')
    ? Math.min(t.count-1,raw) : raw%t.count;
  return 'gb-'+id+'-'+pose+'-'+i;
}

type Paint=CanvasRenderingContext2D;
const K={ ink:'#182439',deep:'#111a2e',hi:'#e8f3fb',skin:'#f1b48e',
  skin2:'#d48668',hair:'#3d2733',hairHi:'#67434b',
  orange:'#f59a45',orangeHi:'#ffcf79',orangeLo:'#a9593f',
  slate:'#314963',slateHi:'#53769a',steel:'#a9c6d5',
  plum:'#6e3c82',pink:'#ed76c2',pinkHi:'#ffc1ee',magenta:'#bd4b9e',
  gold:'#f7c652',white:'#fff4db',shoe:'#4e5069' } as const;
function b(c:Paint,x:number,y:number,w:number,h:number,col:string):void{
  c.fillStyle=col;c.fillRect(Math.round(x),Math.round(y),w,h);
}
function poly(c:Paint,col:string,pts:[number,number][]):void{
  c.fillStyle=col;c.beginPath();
  pts.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fill();
}
function artCanvas(id:GateBHero,pose:GateBHeroPose,frame:number):HTMLCanvasElement{
 const cv=document.createElement('canvas');cv.width=48;cv.height=48;
 const c=cv.getContext('2d',{alpha:true})!;
 c.imageSmoothingEnabled=false;
 drawHero(c,id,pose,frame);
 return cv;
}
function drawHero(c:Paint,id:GateBHero,pose:GateBHeroPose,frame:number):void{
  const move=pose==='move',flex=pose==='flex_charge'||pose==='flex_success';
  const hurt=pose==='hurt',attack=(id==='alpha'&&pose==='punch')||(id==='rizzler'&&pose==='cast');
  const shift=move ? [0,1,0,-1,0,1][frame] : pose==='idle'?[0,0,1,0][frame]:0;
  const stride=move?[0,2,3,0,-2,-3][frame]:0;
  const dying=pose==='death';
  if(dying){
    c.save();c.translate(24,38);c.rotate(Math.min(frame,5)*.19);c.translate(-24,-38);
  }
  if(id==='alpha')drawAlpha(c,pose,frame,shift,stride,flex,hurt,attack);
  else drawRizzler(c,pose,frame,shift,stride,flex,hurt,attack);
  if(dying)c.restore();
}
function drawAlpha(c:Paint,pose:GateBHeroPose,f:number,y:number,stride:number,flex:boolean,hurt:boolean,attack:boolean):void{
  // 3 silhouette masses: squared jacket, huge hands, geometric jaw.
  b(c,10+stride,37,13,9,K.ink);b(c,26-stride,37,13,9,K.ink);
  b(c,12+stride,39,11,4,K.shoe);b(c,28-stride,39,10,4,K.shoe);
  b(c,10+stride,44,15,2,K.orangeHi);b(c,26-stride,44,15,2,K.orangeHi);
  b(c,12,29+y,26,11,K.ink);
  b(c,15,30+y,20,9,K.slate);
  b(c,17,35+y,8,3,K.slateHi);b(c,28,35+y,7,3,K.slateHi);
  // Large varsity/weightlifter jacket with orange asymmetric lapels.
  poly(c,K.ink,[[8,25+y],[14,22+y],[34,22+y],[42,27+y],[39,38+y],[8,38+y],[5,29+y]]);
  poly(c,K.orange,[[12,26+y],[34,25+y],[39,30+y],[35,37+y],[12,37+y],[9,30+y]]);
  b(c,18,25+y,13,12,K.slate);
  poly(c,K.orangeHi,[[18,25+y],[24,30+y],[24,37+y],[20,33+y]]);
  b(c,30,26+y,3,9,K.orangeLo);
  // Unmistakable chunky white badge.
  b(c,23,29+y,8,6,K.ink);b(c,24,30+y,6,4,K.white);
  b(c,26,30+y,2,4,K.gold);
  const jab=pose==='punch'?Math.min(13,f*3):0;
  if(attack && pose==='punch'){
    b(c,32,26+y,8+jab,8,K.ink);
    b(c,36,27+y,5+jab,6,K.orangeLo);
    b(c,40+jab,24+y,8,10,K.ink);
    b(c,41+jab,25+y,6,8,K.skin);
    b(c,42+jab,26+y,3,2,K.white);
    b(c,4,26+y,9,12,K.ink);b(c,5,27+y,7,10,K.orangeLo);
    b(c,5,35+y,7,6,K.skin);
  }else if(flex){
    b(c,3,27+y,41,10,K.ink);b(c,6,28+y,36,7,K.orangeLo);
    b(c,13,30+y,23,5,K.skin);b(c,16,34+y,18,2,K.skin2);
    b(c,6,31+y,8,7,K.skin);b(c,36,31+y,8,7,K.skin);
  }else{
    const arm=pose==='move'?(f%2?2:-2):0;
    b(c,3,26+y+arm,11,12,K.ink);b(c,34,26+y-arm,11,12,K.ink);
    b(c,5,27+y+arm,8,9,K.orange);b(c,36,27+y-arm,8,9,K.orange);
    b(c,3,35+y+arm,12,7,K.ink);b(c,35,35+y-arm,12,7,K.ink);
    b(c,5,36+y+arm,9,5,K.skin);b(c,37,36+y-arm,8,5,K.skin);
  }
  // Chin is an iconic square; sides stay identical during animation.
  b(c,13,10+y,25,20,K.ink);b(c,15,11+y,21,17,K.skin);
  b(c,17,25+y,17,5,K.skin2);b(c,19,27+y,13,3,K.ink);
  b(c,20,26+y,10,3,K.skin);
  // Pompadour, fixed outline in every pose.
  poly(c,K.ink,[[10,17+y],[10,9+y],[15,7+y],[17,4+y],[27,3+y],
                [34,7+y],[40,7+y],[39,16+y],[34,14+y],[27,12+y],[19,13+y],[14,15+y]]);
  b(c,18,5+y,12,4,K.hair);b(c,14,9+y,21,5,K.hair);
  b(c,18,7+y,8,2,K.hairHi);b(c,30,10+y,6,2,K.hairHi);
  // Eyes and a stern pronounced eyebrow.
  if(hurt){b(c,17,18+y,7,2,K.ink);b(c,29,18+y,7,2,K.ink);}
  else{b(c,17,17+y,8,2,K.ink);b(c,28,17+y,8,2,K.ink);
    b(c,18,20+y,4,3,K.ink);b(c,30,20+y,4,3,K.ink);
    b(c,19,20+y,1,1,K.white);b(c,31,20+y,1,1,K.white);}
  b(c,23,24+y,10,1,K.ink);
  if(pose==='flex_success'){
    b(c,2,17+y,4,7,K.gold);b(c,42,14+y,4,7,K.gold);
  }
}
function drawRizzler(c:Paint,pose:GateBHeroPose,f:number,y:number,stride:number,flex:boolean,hurt:boolean,attack:boolean):void{
  // 3 masses: tall asymmetrical hair, long violet coat, flowing pink scarf.
  b(c,11+stride,39,11,7,K.ink);b(c,26-stride,39,11,7,K.ink);
  b(c,12+stride,40,10,5,K.shoe);b(c,27-stride,40,9,5,K.shoe);
  b(c,11+stride,44,12,2,K.pink);b(c,26-stride,44,12,2,K.pink);
  poly(c,K.ink,[[16,28+y],[33,28+y],[37,40+y],[13,40+y]]);
  poly(c,K.plum,[[18,29+y],[32,29+y],[34,38+y],[16,38+y]]);
  b(c,17,32+y,4,5,K.magenta);b(c,28,33+y,4,5,K.magenta);
  // Button-down collar is a clean high-contrast triangle.
  poly(c,K.ink,[[14,21+y],[33,21+y],[40,27+y],[36,37+y],[11,37+y],[8,27+y]]);
  poly(c,K.plum,[[15,23+y],[33,23+y],[37,28+y],[34,36+y],[13,36+y],[11,28+y]]);
  b(c,18,25+y,13,9,K.ink);b(c,21,25+y,7,7,K.white);
  poly(c,K.magenta,[[22,26+y],[28,26+y],[25,32+y]]);
  // Scarf stays attached at neck; swings deliberately from two positions.
  b(c,12,24+y,23,4,K.ink);b(c,13,24+y,20,3,K.pink);
  const tail=pose==='move' ? [1,2,4,2,-1,1][f] : pose==='cast'?f*2 : 1;
  poly(c,K.ink,[[32,24+y],[40,23+y-tail],[46,27+y-tail],[37,30+y],[33,29+y]]);
  poly(c,K.pink,[[34,25+y],[41,25+y-tail],[43,27+y-tail],[37,28+y]]);
  // Long skinny arms distinguish him from Alpha.
  if(attack&&pose==='cast'){
    b(c,7,24+y,8,10,K.ink);b(c,8,25+y,5,8,K.magenta);
    b(c,4,18+y,9,9,K.ink);b(c,5,19+y,7,7,K.skin);
    b(c,36,21+y,8,12,K.ink);b(c,37,22+y,5,10,K.magenta);
    b(c,36,13+y,8,9,K.ink);b(c,37,14+y,6,7,K.skin);
    if(f>0){ b(c,2,10+y,4,4,K.pinkHi);b(c,43,8+y,4,5,K.pink);}
    if(f>2){b(c,0,17+y,4,3,K.gold);b(c,44,19+y,3,4,K.white);}
  }else if(flex){
    b(c,8,29+y,32,7,K.ink);b(c,10,30+y,29,5,K.magenta);
    b(c,16,30+y,19,3,K.skin);b(c,15,34+y,20,2,K.skin2);
  }else{
    const swing=pose==='move'?f%2?2:-2:0;
    b(c,6,27+y+swing,9,10,K.ink);b(c,35,27+y-swing,9,10,K.ink);
    b(c,8,28+y+swing,5,8,K.magenta);b(c,37,28+y-swing,5,8,K.magenta);
    b(c,7,36+y+swing,7,5,K.skin);b(c,37,36+y-swing,7,5,K.skin);
  }
  // Tapered face with signature rounded glasses.
  b(c,14,10+y,23,19,K.ink);b(c,16,12+y,19,15,K.skin);
  b(c,17,22+y,17,5,K.skin2);
  poly(c,K.ink,[[12,16+y],[10,9+y],[17,7+y],[21,3+y],[29,6+y],
                [32,2+y],[38,9+y],[39,15+y],[33,13+y],[26,11+y],[19,13+y]]);
  b(c,18,7+y,8,3,K.hairHi);b(c,30,8+y,4,2,K.hairHi);
  b(c,16,17+y,9,7,K.ink);b(c,27,17+y,9,7,K.ink);
  b(c,18,18+y,5,4,hurt?K.pink:K.slateHi);
  b(c,29,18+y,5,4,hurt?K.pink:K.slateHi);
  b(c,25,19+y,2,2,K.ink);
  b(c,20,19+y,2,1,K.white);b(c,31,19+y,2,1,K.white);
  b(c,24,26+y,7,2,K.ink);
  if(pose==='flex_success') {b(c,6,17+y,3,5,K.pinkHi);b(c,40,12+y,3,5,K.pinkHi);}
}
export function createGateBHeroes(scene:Phaser.Scene):void{
 if(!isGateB())return;
 for(const id of ['alpha','rizzler'] as GateBHero[]){
  for(const [pose,tag] of Object.entries(TAGS)){
   if(id==='alpha'&&pose==='cast'||id==='rizzler'&&pose==='punch')continue;
   for(let f=0;f<tag.count;f++){
    const key='gb-'+id+'-'+pose+'-'+f;
    if(!scene.textures.exists(key))
      scene.textures.addCanvas(key,artCanvas(id,pose as GateBHeroPose,f))?.setFilter(Phaser.Textures.FilterMode.NEAREST);
   }
  }
 }
}
const urlCache=new Map<GateBHero,string>();
export function gateBPortraitUrl(id:GateBHero):string{
 let url=urlCache.get(id);
 if(!url){url=artCanvas(id,'idle',0).toDataURL('image/png');urlCache.set(id,url);}
 return url;
}
