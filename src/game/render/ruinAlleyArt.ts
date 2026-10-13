import Phaser from 'phaser';
import type { WorldDefinition, SolidObstacle } from '../core/worldMaps';

/** No stock atlas: geometry and typography are composed deliberately for the
 * first playable alley. Everything is fixed world art, not a moving HUD. */
export function drawRuinAlley(scene:Phaser.Scene,world:WorldDefinition):void {
  const g=scene.add.graphics().setDepth(-12);
  const W=world.width,H=world.height;
  // Quiet, sunny paving instead of full-screen neon noise.
  g.fillStyle(0xd4e0df).fillRect(0,0,W,H);
  g.fillStyle(0xc4d5d4).fillRect(0,0,W,138);
  g.fillStyle(0xa0c3bf).fillRect(0,0,W,14);
  g.fillStyle(0xb2c6d9).fillRect(0,H-120,W,120);
  for(let x=0;x<W;x+=64){
    for(let y=138;y<H-120;y+=64){
      const n=(Math.floor(x/64)*29+Math.floor(y/64)*17)%19;
      g.fillStyle(n===1?0xdfe8df:n===8?0xcbdad9:0xd4e0df).fillRect(x+2,y+2,60,60);
      g.lineStyle(1,0xa9bbb8,.35).strokeRect(x,y,64,64);
      if(n===3 || n===13){
        g.lineStyle(2,0x8eadae,.7).lineBetween(x+18,y+22,x+30,y+27);
        g.lineBetween(x+30,y+27,x+37,y+23);
      }
    }
  }
  // Painted directional centre stripe and informal court markings.
  g.lineStyle(5,0xffec9b,.72);
  g.lineBetween(110,675,1650,675);
  g.lineStyle(3,0xf6fbf5,.42).strokeCircle(900,680,198);
  for(let x=110;x<1680;x+=120){
    g.fillStyle(0xf4ede1,.45).fillRect(x,674,52,5);
  }
  // Hand-authored rain channels: scenery, not collision.
  for(const [x,y] of [[205,215],[725,472],[1155,538],[1515,1010],[420,1130]]){
    g.fillStyle(0x90b7bb,.28).fillEllipse(x,y,112,33);
    g.lineStyle(2,0x93b4bb,.52).strokeEllipse(x,y,112,33);
    g.lineStyle(2,0xeef4ee,.7).lineBetween(x-30,y+3,x+11,y+3);
  }
  // Outer perimeter reads as a wall; world-core clips movement 22px from edges.
  g.fillStyle(0x536b85).fillRect(0,0,18,H);
  g.fillRect(W-18,0,18,H);
  g.fillStyle(0x577890).fillRect(0,0,W,30);
  g.fillRect(0,H-30,W,30);
  for(let x=36;x<W-30;x+=96){
    g.fillStyle(0xf7cc66).fillRect(x,21,28,5);
    g.fillRect(x,H-27,28,5);
  }
  // Drainage and road furniture stay away from the central fighting lanes.
  for(const [x,y] of [[735,210],[1160,980],[290,1000],[1490,170]]){
    g.fillStyle(0x577b88).fillRoundedRect(x,y,64,24,5);
    for(let t=8;t<=50;t+=12)g.lineStyle(2,0xabc7d0,.9).lineBetween(x+t,y+4,x+t,y+20);
  }
  const palette={
    crate:{rim:0x7e635d,front:0xe5ab74,side:0xbd815f},
    skip:{rim:0x355d70,front:0x65b5ba,side:0x2e8996},
    barrier:{rim:0x5c5a69,front:0xffd36c,side:0xd08b62},
  };
  const prop=(ob:SolidObstacle)=>{
    const c=palette[ob.kind],{x,y,w,h}=ob;
    // Contact shadow and unambiguous obstacle silhouette.
    g.fillStyle(0x324c57,.25).fillRoundedRect(x+8,y+12,w+6,h+9,8);
    g.fillStyle(c.rim).fillRoundedRect(x,y,w,h,7);
    g.fillStyle(c.front).fillRoundedRect(x+5,y+4,w-10,h-12,5);
    g.fillStyle(c.side).fillRect(x+8,y+h-20,w-16,12);
    g.lineStyle(3,c.rim).strokeRoundedRect(x+3,y+3,w-6,h-6,6);
    if(ob.kind==='crate'){
      g.lineStyle(5,0x8e6754,.9).lineBetween(x+17,y+16,x+w-17,y+h-22);
      g.lineBetween(x+w-17,y+16,x+17,y+h-22);
      g.fillStyle(0xf7d4a0).fillRect(x+10,y+8,17,5);
    }else if(ob.kind==='skip'){
      g.fillStyle(0x276f79).fillRect(x+14,y+14,w-28,9);
      g.fillStyle(0xe1f4dd).fillRect(x+19,y+28,w-38,3);
      g.lineStyle(3,0xa7e2db).lineBetween(x+21,y+12,x+w-20,y+12);
    }else{
      for(let t=12;t<w-10;t+=48){
        g.fillStyle(0x424c5e).fillTriangle(x+t,y+h-14,x+t+14,y+12,x+t+28,y+h-14);
      }
      g.fillStyle(0xffffff,.65).fillRect(x+8,y+7,w-16,5);
    }
  };
  world.obstacles.forEach(prop);
  // Identical hand-painted crown stamp repeats as a recognizable world motif.
  const crown=(x:number,y:number,scale:number)=>{
    g.fillStyle(0xfacb57).fillTriangle(x-18*scale,y+8*scale,x-24*scale,y-12*scale,x-4*scale,y-1*scale);
    g.fillTriangle(x+18*scale,y+8*scale,x+24*scale,y-12*scale,x+4*scale,y-1*scale);
    g.fillStyle(0xfacb57).fillTriangle(x-9*scale,y+8*scale,x,y-23*scale,x+9*scale,y+8*scale);
    g.fillRect(x-18*scale,y+8*scale,36*scale,8*scale);
  };
  for(const [x,y,s] of [[130,400,1.1],[1650,980,1.2],[850,1090,1.5]] as const)crown(x,y,s);
  function graffiti(text:string,x:number,y:number,color:string,size:number,rotation:number){
    scene.add.text(x+2,y+3,text,{fontFamily:'Arial Black,Arial,sans-serif',fontSize:size,
      fontStyle:'900',color:'#35536A',align:'center'})
      .setOrigin(.5).setRotation(rotation).setAlpha(.28).setDepth(-10);
    scene.add.text(x,y,text,{fontFamily:'Arial Black,Arial,sans-serif',fontSize:size,
      fontStyle:'900',color,align:'center',stroke:'#37546C',strokeThickness:2})
      .setOrigin(.5).setRotation(rotation).setDepth(-9);
  }
  graffiti('NO HATERS',310,145,'#FAE0A0',29,-.07);
  graffiti('ONLY AURA',1470,1180,'#E5F5F3',33,.06);
  graffiti('67',1570,210,'#F8C45F',62,-.16);
  graffiti('FARM HARD',240,920,'#6C73AC',24,-.09);
  // Spawn decal, visible behind the player without a fake objective.
  g.lineStyle(5,0xf9d06c,.38).strokeCircle(world.start.x,world.start.y,50);
  g.lineStyle(3,0xffffff,.35).strokeCircle(world.start.x,world.start.y,59);
}
