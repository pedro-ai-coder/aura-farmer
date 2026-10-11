import type Phaser from 'phaser';

// Drawn with intentionally limited geometric shapes: a small consistent UI kit
// that stays crisp at Phaser's 960×600 reference resolution.
type G = Phaser.GameObjects.Graphics;
const WOOD=0x965628, EDGE=0xedb866, INK=0x08152a, PANEL=0x112946, LEAF=0x76d54e;
function leaf(g:G,x:number,y:number,scale=1):void {
  g.fillStyle(0x123a2d).fillEllipse(x+1,y+1,19*scale,9*scale);
  g.fillStyle(LEAF).fillEllipse(x,y,16*scale,7*scale);
  g.lineStyle(1,0x215b32,.8).lineBetween(x-5*scale,y,x+5*scale,y);
}
function crystal(g:G,x:number,y:number,color=0x4ad7ff):void {
  g.fillStyle(0x06152b).fillTriangle(x,y-13,x-11,y+1,x+11,y+1).fillTriangle(x-11,y+1,x+11,y+1,x,y+16);
  g.fillStyle(color).fillTriangle(x,y-11,x-9,y+1,x+9,y+1).fillTriangle(x-9,y+1,x+9,y+1,x,y+13);
  g.fillStyle(0xcdf7ff,.88).fillTriangle(x,y-9,x-5,y+1,x,y+8);
}
function heart(g:G,x:number,y:number):void {
  g.fillStyle(0x702437).fillCircle(x-6,y-2,9).fillCircle(x+6,y-2,9).fillTriangle(x-14,y+1,x+14,y+1,x,y+17);
  g.fillStyle(0xff6370).fillCircle(x-6,y-3,7).fillCircle(x+6,y-3,7).fillTriangle(x-12,y+1,x+12,y+1,x,y+13);
  g.fillStyle(0xffafb0,.8).fillEllipse(x-8,y-7,5,3);
}
function panel(g:G,x:number,y:number,w:number,h:number):void {
  g.fillStyle(0x07101c,.63).fillRoundedRect(x+3,y+5,w,h,11);
  g.fillStyle(0x512917).fillRoundedRect(x,y,w,h,10);
  g.lineStyle(3,WOOD,1).strokeRoundedRect(x+1,y+1,w-2,h-2,10);
  g.lineStyle(2,EDGE,.85).strokeRoundedRect(x+4,y+3,w-8,h-7,8);
  g.fillStyle(PANEL,.98).fillRoundedRect(x+7,y+8,w-14,h-17,7);
  g.lineStyle(1,0x3b7895,.9).strokeRoundedRect(x+7,y+8,w-14,h-17,7);
  g.fillStyle(0x365c78,.47).fillRoundedRect(x+13,y+10,w-26,3,2);
  // Small leaf sprigs are repeated as the signature for every panel.
  leaf(g,x+12,y+4,.68);leaf(g,x+w-11,y+5,.62);
  g.fillStyle(0xffd57d).fillCircle(x+7,y+h-7,1.8).fillCircle(x+w-7,y+h-7,1.8);
}
export function drawHudChrome(g:G):void {
  for(const [x,w] of [[18,199],[238,288],[555,164],[735,211]]) panel(g,x,4,w,55);
  heart(g,37,28);
  crystal(g,258,28,0xb76dff);
  leaf(g,575,26,1.3);
  g.fillStyle(0x19416a).fillTriangle(754,11,774,11,764,43);
  g.fillStyle(0xf3e2ad).fillCircle(764,23,5).fillRect(760,26,8,4);
  for(let i=0;i<3;i++)g.fillStyle(0x19416a).fillRect(760+i*3,30,2,3);
  // Slim engraved ribbon: make keyboard status feel part of the HUD.
  g.fillStyle(0x291b19,.93).fillRoundedRect(18,60,924,24,6);
  g.lineStyle(2,WOOD).strokeRoundedRect(19,60,922,24,6);
  g.fillStyle(INK,.96).fillRoundedRect(22,63,916,18,5);
  leaf(g,29,70,.55);leaf(g,931,70,.55);
}
export function drawHudMeter(g:G,x:number,width:number,ratio:number,color:number):void {
  const y=40;
  g.fillStyle(0x071222).fillRoundedRect(x,y,width,11,5);
  g.lineStyle(1,0x7b9ba3,.7).strokeRoundedRect(x,y,width,11,5);
  const clamped=Math.max(0,Math.min(1,ratio));
  if(clamped>0){
    g.fillStyle(color,.5).fillRoundedRect(x+1,y+1,Math.max(3,(width-2)*clamped),9,4);
    g.fillStyle(color).fillRoundedRect(x+2,y+2,Math.max(2,(width-4)*clamped),6,3);
    g.lineStyle(1,0xffffff,.3).lineBetween(x+5,y+3,x+Math.max(5,(width-4)*clamped),y+3);
  }
  g.lineStyle(1,0x092039,.8);
  for(let i=1;i<5;i++)g.lineBetween(x+i*width/5,y+1,x+i*width/5,y+10);
}
