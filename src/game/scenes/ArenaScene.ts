import Phaser from 'phaser';
import { GAME } from '../core/constants';
import { AuraSystem } from '../core/aura';
import { FlexSystem } from '../core/flex';
import { Progression } from '../core/progression';
import { distance, normalized, clamp } from '../core/math';
import { ENEMIES, type EnemyType } from '../data/enemies';
import { BUFFS, emptyBuffLevels, availableBuffs } from '../data/buffs';

type Enemy = { x:number; y:number; hp:number; type:EnemyType; nextHit:number };
type Shot = { x:number; y:number; vx:number; vy:number; ttl:number };
export class ArenaScene extends Phaser.Scene {
  private g!: Phaser.GameObjects.Graphics;
  private hud!: Phaser.GameObjects.Text;
  private keyboard!: Record<string,Phaser.Input.Keyboard.Key>;
  private pos={x:480,y:320};
  private hp=100; private aura=new AuraSystem(); private flex=new FlexSystem();
  private xp=new Progression(); private buffs=emptyBuffLevels();
  private enemies:Enemy[]=[]; private shots:Shot[]=[];
  private mode:'intro'|'playing'|'upgrades'|'between'|'dead'|'win'='intro';
  private clock=0; private wave=1; private waveClock=0; private spawnClock=0; private fireClock=0;private focusReady=0;private focusUntil=0;private kills=0;
  private choices=[] as typeof BUFFS;
  constructor(){super('ArenaScene');}
  create():void{
    this.g=this.add.graphics();
    this.hud=this.add.text(20,12,'',{font:'bold 18px Arial',color:'#fff'}).setDepth(3);
    this.keyboard=this.input.keyboard!.addKeys('W,A,S,D,E,SPACE,ONE,TWO,THREE,ENTER') as Record<string,Phaser.Input.Keyboard.Key>;
    this.add.text(480,300,'',{font:'20px Arial'}); 
  }
  private reset():void{this.pos={x:480,y:320};this.hp=100;this.aura=new AuraSystem();this.flex=new FlexSystem();this.xp=new Progression();this.buffs=emptyBuffLevels();this.enemies=[];this.shots=[];this.clock=0;this.wave=1;this.waveClock=0;this.spawnClock=0;this.fireClock=0;this.focusReady=0;this.focusUntil=0;this.kills=0;this.mode='playing';}
  update(_time:number,delta:number):void{
    const down=(k:string)=>Phaser.Input.Keyboard.JustDown(this.keyboard[k]);
    if(this.mode==='intro'||this.mode==='dead'||this.mode==='win'){if(down('ENTER'))this.reset();this.draw();return;}
    if(this.mode==='between'){if(down('ENTER')){this.wave++;this.waveClock=0;this.enemies=[];this.shots=[];this.hp=Math.min(100,this.hp+20);this.mode='playing';}this.draw();return;}
    if(this.mode==='upgrades'){
      const selected=down('ONE')?0:down('TWO')?1:down('THREE')?2:-1;
      if(selected>=0&&this.choices[selected]){this.buffs[this.choices[selected].id]++;this.mode='playing';}
      this.draw();return;
    }
    const dt=Math.min(delta,50),now=this.clock+=dt;this.waveClock+=dt;this.spawnClock+=dt;this.fireClock-=dt;
    const dx=(this.keyboard.D.isDown?1:0)-(this.keyboard.A.isDown?1:0);
    const dy=(this.keyboard.S.isDown?1:0)-(this.keyboard.W.isDown?1:0);
    if(down('E'))this.flex.tryStart(now);
    if(down('SPACE')&&now>=this.focusReady){this.focusUntil=now+3000;this.focusReady=now+22000;}
    if(this.flex.state!=='charging'){const v=normalized(dx,dy);const speed=205*this.aura.moveMultiplier*(1+this.buffs.speed*.12);this.pos.x=clamp(this.pos.x+v.x*speed*dt/1000,25,935);this.pos.y=clamp(this.pos.y+v.y*speed*dt/1000,105,575);}
    if(this.spawnClock>Math.max(300,1100-this.wave*120)&&this.enemies.length<90){this.spawnClock=0;const types:EnemyType[]=this.wave>=3?['npc','hater','beta']:this.wave>=2?['npc','hater']:['npc'];const type=types[Math.floor(Math.random()*types.length)];this.spawn(type);}
    if(this.wave===5&&!this.enemies.some(e=>e.type==='boss')&&this.waveClock>12000&&this.kills<1e9&&!this.bossSpawned){this.spawn('boss');this.bossSpawned=true;}
    if(this.flex.state!=='charging'&&this.fireClock<=0&&this.enemies.length){let target=this.enemies[0];for(const e of this.enemies)if(distance(e,this.pos)<distance(target,this.pos))target=e;const v=normalized(target.x-this.pos.x,target.y-this.pos.y);this.shots.push({x:this.pos.x,y:this.pos.y,vx:v.x*460,vy:v.y*460,ttl:1600});this.fireClock=420/this.aura.fireRateMultiplier;}
    for(const e of this.enemies){const v=normalized(this.pos.x-e.x,this.pos.y-e.y),stats=ENEMIES[e.type];e.x+=v.x*stats.speed*dt/1000*(now<this.focusUntil?.62:1);e.y+=v.y*stats.speed*dt/1000*(now<this.focusUntil?.62:1);if(distance(e,this.pos)<stats.radius+19&&now>=e.nextHit){e.nextHit=now+850;this.hp-=stats.damage;this.aura.change(-20);this.flex.interrupt(now);if(this.hp<=0)this.mode='dead';}}
    for(let i=this.shots.length-1;i>=0;i--){const s=this.shots[i];s.x+=s.vx*dt/1000;s.y+=s.vy*dt/1000;s.ttl-=dt;if(s.ttl<=0){this.shots.splice(i,1);continue;}const target=this.enemies.find(e=>distance(e,s)<ENEMIES[e.type].radius+6);if(target){target.hp-=18*this.aura.damageMultiplier;this.shots.splice(i,1);if(target.hp<=0){this.enemies.splice(this.enemies.indexOf(target),1);this.kills++;if(this.xp.gain(ENEMIES[target.type].xp)>0){this.choices=availableBuffs(this.buffs).sort(()=>Math.random()-.5).slice(0,3);this.mode='upgrades';}if(this.kills%5===0)this.aura.change(10);}}}
    const near=this.enemies.filter(e=>distance(e,this.pos)<=GAME.flexRadius).length;
    if(this.flex.update(now,near)==='success')this.aura.change(25);
    if(this.waveClock>=GAME.waveDurationMs&&this.mode==='playing'){this.mode=this.wave===5?'win':'between';this.bossSpawned=false;}
    this.draw();
  }
  private bossSpawned=false;
  private spawn(type:EnemyType):void{const angle=Math.random()*Math.PI*2;this.enemies.push({x:clamp(this.pos.x+Math.cos(angle)*360,20,940),y:clamp(this.pos.y+Math.sin(angle)*300,105,575),hp:ENEMIES[type].hp,type,nextHit:0});}
  private draw():void{
    const g=this.g;g.clear();g.fillStyle(0x261c43).fillRect(0,0,960,600);g.fillStyle(0x33234f).fillRoundedRect(12,84,936,502,18);
    for(const e of this.enemies){const s=ENEMIES[e.type];g.fillStyle(s.color).fillCircle(e.x,e.y,s.radius);g.lineStyle(3,0x161124).strokeCircle(e.x,e.y,s.radius);}
    for(const s of this.shots)g.fillStyle(0xffdc68).fillCircle(s.x,s.y,6);
    g.fillStyle(this.flex.state==='charging'?0xffdb77:0x9a78f6).fillCircle(this.pos.x,this.pos.y,19);g.lineStyle(4,0xf9f5ff).strokeCircle(this.pos.x,this.pos.y,19);
    if(this.flex.state==='charging')g.lineStyle(3,0xfbd176).strokeCircle(this.pos.x,this.pos.y,GAME.flexRadius);
    this.hud.setText('AURA FARMER   WAVE '+this.wave+'/5    HP '+Math.max(0,Math.ceil(this.hp))+'    AURA '+this.aura.value+'/100 ('+this.aura.rank+')    LVL '+this.xp.level+'    KILLS '+this.kills+'\nWASD move • E FLEX • SPACE Sigma Focus');
    if(this.mode!=='playing'){g.fillStyle(0x130e2f,.88).fillRoundedRect(125,180,710,260,22);const msg=this.mode==='intro'?'AURA FARMER\nNO AURA? SKILL ISSUE.\nENTER para começar':this.mode==='upgrades'?'LEVEL UP — escolhe 1, 2 ou 3\n'+this.choices.map((b,i)=>(i+1)+' '+b.name+' — '+b.description).join('\n'):this.mode==='between'?'WAVE COMPLETE\nENTER para continuar':this.mode==='dead'?'YOU ARE COOKED 💀\nENTER para reiniciar':'GOD AURA — VITÓRIA!\nENTER para reiniciar';this.hud.setText(this.hud.text+'\n\n'+msg);}
  }
}
