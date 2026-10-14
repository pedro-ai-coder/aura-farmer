import type Phaser from 'phaser';

export function drawHudChrome(g:Phaser.GameObjects.Graphics):void{
  const panels:[[number,number],[number,number],[number,number],[number,number]]=[
    [18,199],[238,288],[555,164],[735,211],
  ];
  for(const [x,w] of panels){
    g.fillStyle(0x081523,.8).fillRoundedRect(x+2,7,w,53,5);
    g.fillStyle(0x172d48,1).fillRoundedRect(x,4,w,53,5);
    g.lineStyle(2,0x58738e,1).strokeRoundedRect(x,4,w,53,5);
    g.fillStyle(0x78bada,.6).fillRect(x+7,6,31,2);
    g.fillStyle(0x263c55,.9).fillRect(x+6,35,w-12,18);
  }
  // Short neutral status bar with a cyan signal tick.
  g.fillStyle(0x0c1a2b,.98).fillRoundedRect(18,60,924,24,4);
  g.lineStyle(1,0x6585a4,.9).strokeRoundedRect(18,60,924,24,4);
  g.fillStyle(0x57c7ee).fillRect(26,64,4,16);
}
export function drawHudMeter(g:Phaser.GameObjects.Graphics,x:number,w:number,v:number,color:number):void{
  g.fillStyle(0x0a1426).fillRoundedRect(x,40,w,10,3);
  g.lineStyle(1,0x59738a,.9).strokeRoundedRect(x,40,w,10,3);
  const len=Math.round(Math.max(0,Math.min(1,v))*(w-4));
  if(len>0){
    g.fillStyle(color,1).fillRoundedRect(x+2,42,len,6,2);
    g.fillStyle(0xffffff,.28).fillRect(x+3,42,Math.max(0,len-2),1);
  }
  g.lineStyle(1,0x0f2440,.7);
  for(let i=1;i<5;i++)g.lineBetween(x+i*w/5,41,x+i*w/5,49);
}
