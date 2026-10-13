import { clamp, distance, normalized, type Vec2 } from './math';

/** Author-authored collision contract for the first scrolling battlefield. */
export type WorldId = 'ruin-alley';
export interface SolidObstacle { id: string; x: number; y: number; w: number; h: number; kind: 'crate' | 'skip' | 'barrier' }
export interface WorldDefinition {
  id: WorldId; name: string; width: number; height: number; start: Vec2;
  obstacles: readonly SolidObstacle[];
}

export const RUIN_ALLEY: WorldDefinition = {
  id:'ruin-alley', name:'RUIN ALLEY', width:1800, height:1320,
  start:{x:900,y:680},
  // Keep a roomy safe spawn plaza. Shapes intentionally differ in length
  // and grouping: this is gameplay geometry, not a tiling decoration sheet.
  obstacles:[
    {id:'skip-nw',x:290,y:250,w:122,h:76,kind:'skip'},
    {id:'crates-nw',x:500,y:340,w:104,h:108,kind:'crate'},
    {id:'barrier-n',x:865,y:245,w:260,h:38,kind:'barrier'},
    {id:'skip-ne',x:1390,y:320,w:128,h:80,kind:'skip'},
    {id:'crates-w',x:306,y:735,w:140,h:102,kind:'crate'},
    {id:'barrier-sw',x:590,y:990,w:230,h:42,kind:'barrier'},
    {id:'crate-se',x:1310,y:835,w:138,h:103,kind:'crate'},
    {id:'skip-s',x:970,y:1060,w:140,h:82,kind:'skip'},
    {id:'crates-e',x:1530,y:590,w:105,h:122,kind:'crate'},
  ],
};

/** Collision checks are independent of Phaser and unit-testable. */
export function circleHitsObstacle(point:Vec2, radius:number, obstacle:SolidObstacle):boolean {
  const cx=clamp(point.x,obstacle.x,obstacle.x+obstacle.w);
  const cy=clamp(point.y,obstacle.y,obstacle.y+obstacle.h);
  const dx=point.x-cx, dy=point.y-cy;
  return dx*dx+dy*dy<radius*radius;
}
export function isWalkable(point:Vec2,radius:number,world:WorldDefinition):boolean {
  return point.x>=radius+22 && point.x<=world.width-radius-22 &&
    point.y>=radius+22 && point.y<=world.height-radius-22 &&
    world.obstacles.every(ob=>!circleHitsObstacle(point,radius,ob));
}
export function moveOnMap(start:Vec2,dx:number,dy:number,radius:number,world:WorldDefinition):Vec2 {
  const boundsX=(n:number)=>clamp(n,radius+22,world.width-radius-22);
  const boundsY=(n:number)=>clamp(n,radius+22,world.height-radius-22);
  const x={x:boundsX(start.x+dx),y:start.y};
  const afterX=isWalkable(x,radius,world)?x:start;
  const y={x:afterX.x,y:boundsY(afterX.y+dy)};
  return isWalkable(y,radius,world)?y:afterX;
}

/** When direct pursuit hits a prop, skirt it rather than walking through it. */
export function chaseOnMap(start:Vec2,target:Vec2,speed:number,radius:number,world:WorldDefinition,clockwise:boolean):Vec2 {
  const dir=normalized(target.x-start.x,target.y-start.y);
  const direct=moveOnMap(start,dir.x*speed,dir.y*speed,radius,world);
  if(distance(direct,start)>=speed*.55)return direct;
  const side=clockwise?1:-1;
  for(const [vx,vy] of [[-dir.y*side,dir.x*side],[dir.y*side,-dir.x*side]]){
    const next=moveOnMap(start,vx*speed,vy*speed,radius,world);
    if(distance(next,start)>=speed*.4)return next;
  }
  return direct;
}

/** Segment vs padded box — stop projectiles from crossing solid objects. */
export function segmentHitsObstacle(a:Vec2,b:Vec2,obstacle:SolidObstacle,padding=0):boolean{
  const minX=obstacle.x-padding,maxX=obstacle.x+obstacle.w+padding;
  const minY=obstacle.y-padding,maxY=obstacle.y+obstacle.h+padding;
  let tMin=0,tMax=1;
  for(const [start,delta,min,max] of [[a.x,b.x-a.x,minX,maxX],[a.y,b.y-a.y,minY,maxY]]){
    if(Math.abs(delta)<1e-9){if(start<min||start>max)return false;continue;}
    let enter=(min-start)/delta,leave=(max-start)/delta;
    if(enter>leave)[enter,leave]=[leave,enter];
    tMin=Math.max(tMin,enter);tMax=Math.min(tMax,leave);
    if(tMin>tMax)return false;
  }
  return true;
}
export function blocksProjectile(a:Vec2,b:Vec2,world:WorldDefinition):boolean{
  return world.obstacles.some(ob=>segmentHitsObstacle(a,b,ob,4));
}

/** Spawn just outside the action, within world bounds and outside obstacles. */
export function pickSpawnNearPlayer(world:WorldDefinition,player:Vec2,radius:number,random:()=>number):Vec2|null{
  for(let i=0;i<28;i++){
    const angle=random()*Math.PI*2;
    const range=360+random()*150;
    const p={x:player.x+Math.cos(angle)*range,y:player.y+Math.sin(angle)*range};
    if(isWalkable(p,radius+6,world)&&distance(p,player)>=320)return p;
  }
  // Safe fallback on an authored open plaza corner, never inside the hero.
  for(const p of [{x:190,y:180},{x:1610,y:180},{x:190,y:1140},{x:1610,y:1140}]){
    if(isWalkable(p,radius+6,world)&&distance(p,player)>260)return p;
  }
  return null;
}
