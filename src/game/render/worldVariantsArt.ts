import Phaser from 'phaser';
import type { WorldDefinition, SolidObstacle } from '../core/worldMaps';

type SceneTheme={
  ink:number; ground:number; tile:number; joint:number; border:number; decoration:number;
  sunlight:number; shadow:number; sign:string; subtitle:string;
};
const THEMES:Record<'crown-chamber'|'toxic-rooftop',SceneTheme>={
 'crown-chamber':{
   ink:0x48415a,ground:0xf1d9af,tile:0xe9cba8,joint:0xc8a780,
   border:0x987c8b,decoration:0x8c6992,sunlight:0xfff0c7,shadow:0x674c66,
   sign:'THE CROWN CHAMBER',subtitle:'FIVE WAVES · ONE THRONE',
 },
 'toxic-rooftop':{
   ink:0x314958,ground:0xbcd6ca,tile:0xa8c5c0,joint:0x78a8a3,
   border:0x6b8691,decoration:0x60aaa5,sunlight:0xe7f3d4,shadow:0x416a6e,
   sign:'TOXIC ROOFTOP',subtitle:'WATCH YOUR STEP',
 },
};
function colorForProp(kind:SolidObstacle['kind'],id:WorldDefinition['id']){
 if(kind==='pillar')return {base:0x947c98,top:0xfbe8c5,side:0xd6b1a5,outline:0x51455d};
 if(kind==='planter')return {base:0x739568,top:0x8bb58b,side:0x4c8066,outline:0x416455};
 if(kind==='vent')return {base:0x5b8591,top:0xd9e7de,side:0x91b4b8,outline:0x375666};
 if(kind==='pipe')return {base:0x568d86,top:0xe3b976,side:0x74b2a1,outline:0x476470};
 if(kind==='skip')return {base:0x537c86,top:0x90bcc0,side:0x3a747e,outline:0x354e62};
 if(kind==='crate')return {base:0x8e695f,top:0xf0c88d,side:0xd69c74,outline:0x725560};
 return {base:0x817c7f,top:id==='crown-chamber'?0xf4d39b:0xf4c96e,side:0xbe8e79,outline:0x625467};
}
function drawProp(g:Phaser.GameObjects.Graphics,ob:SolidObstacle,world:WorldDefinition):void {
 const {x,y,w,h,kind}=ob,c=colorForProp(kind,world.id);
 g.fillStyle(0x284451,.21).fillRoundedRect(x+9,y+15,w+4,h+8,9);
 g.fillStyle(c.outline).fillRoundedRect(x-2,y-2,w+4,h+4,10);
 g.fillStyle(c.base).fillRoundedRect(x+3,y+4,w-6,h-5,8);
 g.fillStyle(c.top).fillRoundedRect(x+7,y+5,w-14,h-19,6);
 g.fillStyle(c.side).fillRoundedRect(x+8,y+h-19,w-16,13,4);
 if(kind==='pillar'){
   g.lineStyle(4,c.outline,.8).strokeEllipse(x+w/2,y+h/2,w-34,h-32);
   g.fillStyle(0xfff7db,.92).fillEllipse(x+w/2,y+h/2,Math.max(18,w/3),Math.max(18,h/3));
 }else if(kind==='vent'){
   g.fillStyle(0x557b85).fillCircle(x+w/2,y+(h-15)/2,Math.min(w,h)/2-15);
   g.lineStyle(4,0xf6ead2).strokeCircle(x+w/2,y+(h-15)/2,Math.min(w,h)/2-13);
   const cx=x+w/2,cy=y+(h-15)/2;
   for(let a=0;a<4;a++){
     const t=a*Math.PI/2;
     g.fillStyle(0x9ed1c8).fillTriangle(
       cx+Math.cos(t)*10,cy+Math.sin(t)*10,
       cx+Math.cos(t+.6)*40,cy+Math.sin(t+.6)*40,
       cx+Math.cos(t+1.4)*22,cy+Math.sin(t+1.4)*22);
   }
 }else if(kind==='pipe'){
   g.lineStyle(9,0x507a7d).strokeRoundedRect(x+13,y+11,w-26,h-24,9);
   g.lineStyle(3,0xffe5a8).lineBetween(x+16,y+14,x+w-16,y+14);
   for(let a=26;a<w-15;a+=60)g.fillStyle(0x425c65).fillRect(x+a,y+5,7,Math.min(h-12,12));
 }else if(kind==='planter'){
   for(let n=0;n<5;n++){
     const cx=x+18+n*(w-36)/4,cy=y+25+(n%2)*17;
     g.fillStyle(n%2?0x6aa573:0x4b8c65).fillEllipse(cx,cy,31,47);
     g.fillStyle(0xbee0a2).fillEllipse(cx-7,cy-8,9,17);
   }
 }else if(kind==='crate'){
   g.lineStyle(5,c.outline,.7).lineBetween(x+15,y+14,x+w-14,y+h-23);
   g.lineBetween(x+w-14,y+14,x+15,y+h-23);
 }else if(kind==='barrier'){
   for(let n=18;n<w-15;n+=44){
     g.fillStyle(0x4a5366).fillTriangle(x+n,y+h-18,x+n+14,y+12,x+n+26,y+h-18);
   }
 }else{
   g.lineStyle(4,0x38767d).lineBetween(x+17,y+14,x+w-16,y+14);
   g.fillStyle(0xd8f0e7).fillRect(x+16,y+28,w-32,5);
 }
}
/** Full world scenery, separate from immutable solid collision layout. */
export function drawVariantWorld(scene:Phaser.Scene,world:WorldDefinition):void {
 if(world.id==='ruin-alley')return;
 const theme=THEMES[world.id];
 const g=scene.add.graphics().setDepth(-12);
 g.fillStyle(theme.ground).fillRect(0,0,world.width,world.height);
 const step=world.id==='crown-chamber'?86:74;
 for(let y=35;y<world.height-35;y+=step)for(let x=35;x<world.width-35;x+=step){
   const n=(x*13+y*7)%17;
   g.fillStyle(n<5?theme.tile:theme.ground).fillRect(x+2,y+2,step-4,step-4);
   g.lineStyle(1,theme.joint,.55).strokeRect(x,y,step,step);
 }
 g.fillStyle(theme.border).fillRect(0,0,world.width,30);
 g.fillRect(0,world.height-30,world.width,30);
 g.fillRect(0,0,30,world.height);g.fillRect(world.width-30,0,30,world.height);
 if(world.id==='crown-chamber'){
   // Painted gilded competition ring: zero collision; props are the only solids.
   g.lineStyle(13,0xc2a27c,.35).strokeCircle(900,680,255);
   g.lineStyle(7,0xfdf1d1,.85).strokeCircle(900,680,243);
   g.lineStyle(4,0xb58e98,.65).strokeCircle(900,680,212);
   for(let i=0;i<12;i++){
     const t=i*Math.PI/6;
     const px=900+Math.cos(t)*337,py=680+Math.sin(t)*337;
     g.fillStyle(0xeacb75,.7).fillCircle(px,py,13);
     g.fillStyle(0x98678d,.72).fillCircle(px,py,5);
   }
   // Crown directly belongs to arena identity, not to the HUD.
   g.fillStyle(0xd4af62,.58).fillTriangle(875,691,857,654,891,665);
   g.fillTriangle(925,691,943,654,909,665);
   g.fillTriangle(878,693,900,636,922,693);
   g.fillRect(866,692,68,12);
   for(let i=0;i<12;i++){
     const x=120+i*140;
     g.fillStyle(i%2?0x987ca1:0xc5a29d,.35).fillRoundedRect(x,45,96,68,12);
   }
 }else{
   // Industrial warning zones are *decals only*: not damaging trap mechanics.
   for(const [x,y,w,h] of [[88,395,290,23],[1390,390,310,23],[620,990,560,25]]){
     g.fillStyle(0xe2c17a,.8).fillRect(x,y,w,h);
     for(let dx=0;dx<w;dx+=45){
       g.fillStyle(0x526b6e,.85).fillTriangle(x+dx,y+h,x+dx+21,y,x+dx+37,y);
     }
   }
   for(const [x,y] of [[110,175],[1655,275],[95,1050],[1630,1110]]){
     g.fillStyle(0x78b3ad,.48).fillEllipse(x,y,92,41);
     g.lineStyle(3,0x517e81,.65).strokeEllipse(x,y,92,41);
     g.fillStyle(0xe6f4d8,.5).fillEllipse(x+15,y-7,26,7);
   }
   g.lineStyle(5,0xe6f1d6,.5).strokeEllipse(900,680,410,410);
 }
 world.obstacles.forEach(ob=>drawProp(g,ob,world));
 // Map lettering is world furniture. It never overlays interactive controls.
 scene.add.text(124,104,theme.sign,{fontFamily:'Arial Black,Arial,sans-serif',
   fontSize:40,fontStyle:'bold',color:'#'+theme.ink.toString(16).padStart(6,'0'),
   stroke:'#fff5dc',strokeThickness:4}).setDepth(-9).setRotation(-.025);
 scene.add.text(128,158,theme.subtitle,{fontFamily:'Arial,sans-serif',fontSize:16,
   fontStyle:'bold',color:'#'+theme.ink.toString(16).padStart(6,'0')}).setDepth(-9);
 g.lineStyle(5,theme.sunlight,.72).strokeCircle(world.start.x,world.start.y,48);
}
