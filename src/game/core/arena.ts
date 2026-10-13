import { AuraSystem } from './aura';
import { FlexSystem, type FlexVariant } from './flex';
import {newAffinityCounts,type Affinity,type EssenceDrop} from './affinities';
import {FLEXES_V2,difficultyV2} from '../combatV2';
import { Progression } from './progression';
import { GAME } from './constants';
import { combatStats } from './combat';
import { BuffEffects, findBounce, firstHitDamage, rizzPulse, rizzSpeed, type BuffTarget, type BounceState } from './buffEffects';
import { clamp, distance, normalized, type Vec2 } from './math';
import { availableBuffs, BUFFS, emptyBuffLevels, type BuffDefinition, type BuffId } from '../data/buffs';
import {canEquip,equipment,legalUpgrades} from './equipment';
import { ENEMIES, type EnemyType } from '../data/enemies';
import { getCharacter, type CharacterId } from '../data/characters';
import { RUIN_ALLEY, moveOnMap, chaseOnMap, blocksProjectile, pickSpawnNearPlayer, type WorldDefinition, type WorldId } from './worldMaps';

export type Mode = 'intro' | 'playing' | 'upgrades' | 'between' | 'dead' | 'win';
export interface Controls { x?: number; y?: number; flex?: boolean; confirm?: boolean; choice?: number }
export interface Enemy extends BuffTarget { id: number; hp: number; type: EnemyType; nextHit: number; nextShot: number }
export interface Shot extends Vec2, BounceState { vx: number; vy: number; ttl: number; damage: number; hostile: boolean; piercing?: boolean; splash?: number }
export interface Drop extends Vec2 { xp: number }

/** Phaser-free simulation. All durations use active simulation time, including cooldowns. */
export class Arena {
  mode: Mode = 'intro';
  pos = { x: 480, y: 330 };
  readonly world: WorldDefinition | null;
  hp = 100;
  aura = new AuraSystem();
  flex = new FlexSystem();
  xp = new Progression();
  buffs = emptyBuffLevels();
  effects = new BuffEffects();
  enemies: Enemy[] = [];
  shots: Shot[] = [];
  drops: Drop[] = [];
  essenceDrops: EssenceDrop[] = [];
  affinities = newAffinityCounts();
  lastEssence: Affinity | null = null;
  choices: BuffDefinition[] = [];
  pendingUpgrades = 0;
  clock = 0;
  wave = 1;
  waveClock = 0;
  kills = 0;
  xpCollected = 0;
  flexSuccesses = 0;
  flexInterruptions = 0;
  damageTaken = 0;
  auraBursts = 0;
  maxAura = 0;
  cleanWave = false;
  ultimate67Triggered = false;
  sixSevenTriggered = false;
  private tookHitThisWave = false;
  private flexHitAt = new Map<number,number>();
  private flexBossDamage = new Map<number,number>();
  private nextRizzPulse = 0;
  private nextChadSlam = 0;
  private memeReady = 0;
  private nextThunder = 0;
  private effectCooldowns = new Map<string,number>();
  private timeWarpUntil = 0;
  private flexDamageUntil = 0;
  private builtDifferentUsed = false;
  private lastCrit = false;
  private movedDistance = 0;
  bossSpawned = false;
  bossDefeated = false;
  lastDamageAt = 0;
  feedback = '';
  feedbackUntil = 0;
  jawUntil = 0;
  rizzBlastUntil=0;
  rizzBlastRadius=0;
  private spawnClock = 0;
  private fireReady = 0;
  private jawReady = 0;
  private orbReady = 0;
  private volleyReady=4800; // Keep the signature 67th-kill burst independent of timed volleys.
  private rizzBlastReady=0;
  private nextId = 0;

  constructor(private readonly random: () => number = Math.random, readonly characterId: CharacterId = 'sigma', readonly worldId: WorldId | null = null) {
    this.world = worldId === 'ruin-alley' ? RUIN_ALLEY : null;
    if (this.world) this.pos = { ...this.world.start };
    const selected = getCharacter(characterId);
    // Every starter carries one real automatic weapon, counted in the loadout.
    this.buffs['aura-shot']=1;
    if (selected.id === 'alpha'||selected.id==='cool-kid') this.buffs['mewing-jaw'] = 1;
    if (selected.id === 'rizzler') this.buffs['rizz-blast']=1;
    if (selected.id === 'six-seven') this.buffs['six-seven'] = 1;
    this.hp = this.stats.maxHp;
  }

  start(characterId: CharacterId = this.characterId): void {
    Object.assign(this, new Arena(this.random, characterId, this.worldId));
    this.mode = 'playing';
  }

  get loadout():{weapons:readonly BuffId[];passives:readonly BuffId[]}{return equipment(this.buffs);}
  get nearby(): number { return this.enemies.filter(e => distance(e, this.pos) <= GAME.flexRadius).length; }
  get stats() {
    const character = getCharacter(this.characterId);
    const stats = combatStats(this.buffs, this.aura.peak, this.nearby, this.clock - this.lastDamageAt, this.hp, Math.round(100 * character.hp));
    return { ...stats, speed: stats.speed * character.speed, damage: stats.damage * character.damage,
      fireRate: stats.fireRate * character.fireRate, critChance: Math.min(1, stats.critChance + character.crit),
      armor: stats.armor + character.armor };
  }
  get flexVariant():FlexVariant {
    return this.characterId==='cool-kid'||this.characterId==='alpha'||this.characterId==='fanum'?'alpha':
      this.characterId==='rizzler'?'rizz':'sigma';
  }
  get flexName():string {
    return FLEXES_V2.find(f=>f.characterId===this.characterId)?.name.toUpperCase() ?? 'SIGMA LOCK-IN';
  }
  get flexActive():boolean {return this.flex.isActive(this.clock);}
  get orb(): Vec2 { return { x: this.pos.x + Math.cos(this.clock / 350) * 76, y: this.pos.y + Math.sin(this.clock / 350) * 76 }; }

  update(elapsed: number, input: Controls = {}): void {
    if (this.mode === 'intro' || this.mode === 'dead' || this.mode === 'win') {
      if (input.confirm) this.start();
      return;
    }
    if (this.mode === 'between') {
      if (input.confirm) {
        this.wave++; this.waveClock = 0; this.spawnClock = 0;
        this.effects.beginWave();
        this.tookHitThisWave = false;
        this.enemies = []; this.shots = []; this.drops = []; this.essenceDrops = [];
        this.hp = Math.min(this.stats.maxHp, this.hp + Math.ceil(this.stats.maxHp*.1)); this.mode = 'playing';
      }
      return;
    }
    if (this.mode === 'upgrades') {
      const buff = input.choice === undefined ? undefined : this.choices[input.choice];
      if (buff && BUFFS.includes(buff) && canEquip(this.buffs,buff)) {
        this.buffs[buff.id]++;
        if (buff.id === 'thick-skin') this.hp = Math.min(this.stats.maxHp, this.hp + Math.ceil(this.stats.maxHp*.05));
        this.pendingUpgrades--; this.offerUpgrade();
      } else if (buff) {
        // Ignore stale/tampered rewards rather than bypassing slot capacity.
        this.offerUpgrade();
      }
      return;
    }
    this.flex.sync(this.clock,this.aura.value);
    if (input.flex && this.flex.activate(this.clock,this.aura.value,this.flexVariant)) {
      this.aura.spend();
      this.flexSuccesses++;
      this.auraBursts++; // Legacy local achievement/event counter now tracks FLEX Ultimate.
      this.maxAura=100;
      this.flexHitAt.clear();
      this.flexBossDamage.clear();
      this.nextRizzPulse=this.clock;
      this.nextChadSlam=this.clock;
      this.flexDamageUntil=this.clock+9000;
      this.say('FLEX! '+this.flexName);
    }
    // Small steps prevent projectile tunnelling; discard long inactive-tab gaps.
    let remaining = clamp(elapsed, 0, 250);
    while (remaining > 0 && this.mode === 'playing') {
      const dt = Math.min(remaining, 1000 / 60);
      this.step(dt, input); remaining -= dt;
    }
  }

  private step(dt: number, input: Controls): void {
    this.clock += dt; this.waveClock += dt; this.spawnClock += dt;
    this.flex.sync(this.clock,this.aura.value);
    const active=this.flexActive,variant=this.flex.variant;
    const v=normalized(input.x??0,input.y??0);
    const speed=this.stats.speed*this.aura.moveMultiplier*(active&&this.characterId==='cool-kid'?1.6:active&&this.characterId==='ohio'?1.45:1);
    const previousX=this.pos.x,previousY=this.pos.y;
    if(this.world) {
      const moved=moveOnMap(this.pos,v.x*speed*dt/1000,v.y*speed*dt/1000,GAME.playerRadius,this.world);
      this.pos.x=moved.x;this.pos.y=moved.y;
    } else {
      this.pos.x=clamp(this.pos.x+v.x*speed*dt/1000,25,935);
      this.pos.y=clamp(this.pos.y+v.y*speed*dt/1000,105,575);
    }
    if (this.characterId==='ohio') {
      this.movedDistance+=Math.hypot(this.pos.x-previousX,this.pos.y-previousY);
      if(this.movedDistance>=280&&this.enemies.length){
        this.movedDistance-=280;
        const target=this.enemies.reduce((a,b)=>distance(a,this.pos)<distance(b,this.pos)?a:b);
        this.shoot(this.pos,target,this.damage(10));
      }
    }
    if (this.waveClock < GAME.waveDurationMs && this.spawnClock >= Math.max(280, (1100 - this.wave * 90)/difficultyV2(this.wave).spawnDensity)) {
      this.spawnClock = 0;
      if (this.enemies.length < GAME.maxEnemies - (this.wave === 5 && !this.bossSpawned ? 1 : 0)) {
        const types: EnemyType[] = this.wave >= 3 ? ['npc', 'hater', 'beta'] : this.wave >= 2 ? ['npc', 'hater'] : ['npc'];
        this.spawn(types[Math.floor(this.random() * types.length)]);
      }
    }
    if (this.wave === 5 && !this.bossSpawned && this.waveClock >= 12000) {
      this.spawn('boss'); this.bossSpawned = true;
      this.say('BIG HATER is here! Defeat the boss to win!');
    }
    for (const e of this.enemies) {
      const stats = ENEMIES[e.type];
      const threat=difficultyV2(this.wave);
      const d = distance(e, this.pos), v = normalized(this.pos.x - e.x, this.pos.y - e.y);
      // Rizz Ultimate slows crowds, with reduced effects on bosses.
      const slow=rizzSpeed(e,e.type==='boss',this.clock);
      // Haters stop at range and fire aimed, dodgeable projectiles.
      if (e.type !== 'hater' || d > 235) {
        if(this.world) {
          const next=chaseOnMap(e,this.pos,stats.speed*threat.spawnDensity*dt/1000*slow,stats.radius,this.world,e.id%2===0);
          e.x=next.x;e.y=next.y;
        } else {
          e.x += v.x * stats.speed * threat.spawnDensity * dt / 1000 * slow;
          e.y += v.y * stats.speed * dt / 1000 * slow;
        }
      }
      if ((e.type === 'hater' || e.type === 'boss') && this.clock >= e.nextShot) {
        this.shoot(e, this.pos, stats.damage*threat.damage, true, 165);
        e.nextShot = this.clock + (e.type === 'boss' ? 1200 : 1800);
      }
      if (distance(e, this.pos) < stats.radius + GAME.playerRadius && this.clock >= e.nextHit) {
        e.nextHit = this.clock + 850;
        this.hurt(stats.damage*threat.damage);
        if (this.mode === 'dead') return;
      }
    }
    if(active&&this.characterId==='cool-kid')this.rampage();
    if(active&&this.characterId==='six-seven'&&this.clock>=this.nextChadSlam){
      this.nextChadSlam=this.clock+850;
      for(let i=0;i<2;i++){
        const angle=this.clock/500+i*Math.PI;
        this.shoot(this.pos,{x:this.pos.x+Math.cos(angle),y:this.pos.y+Math.sin(angle)},this.damage(12));
      }
    }
    if(active&&this.characterId==='alpha'&&this.clock>=this.nextChadSlam){
      this.nextChadSlam=this.clock+800;
      for(const e of [...this.enemies])if(distance(e,this.pos)<145)
        this.hit(e,this.damage(e.type==='boss'?20:42),'flex');
    }
    if(this.buffs['thunder-strike']>0&&this.clock>=this.nextThunder&&this.enemies.length){
      const level=this.buffs['thunder-strike'];
      this.nextThunder=this.clock+(level===2?7000:8000);
      const e=this.enemies.reduce((a,b)=>distance(a,this.pos)<distance(b,this.pos)?a:b);
      this.hit(e,level===2?55:35,'flex');
    }
    if(active&&variant==='rizz'&&this.clock>=this.nextRizzPulse){
      this.nextRizzPulse=this.clock+700;
      for(const e of [...this.enemies]){
        if(distance(e,this.pos)>235)continue;
        e.rizzSlowUntil=this.clock+(e.type==='boss'?600:1350);
        this.hit(e,Math.min(e.type==='boss'?11:22,this.damage(18)),'flex');
      }
    }
    // Alpha RAMPAGE replaces ordinary auto-fire; prevents five seconds of
    // invulnerable boss DPS stacking outside the per-activation stomp cap.
    if(!(active&&this.characterId==='cool-kid'))this.attack();
    for (const shot of [...this.shots]) {
      const previous={x:shot.x,y:shot.y};
      shot.x += shot.vx * dt / 1000; shot.y += shot.vy * dt / 1000; shot.ttl -= dt;
      if (shot.ttl <= 0 || (this.world && blocksProjectile(previous,shot,this.world))) {
        this.removeShot(shot); continue;
      }
      if (shot.hostile) {
        if (distance(shot, this.pos) < GAME.playerRadius + 6) {
          this.removeShot(shot); this.hurt(shot.damage);
          if (this.mode === 'dead') return;
        }
      } else {
        const enemy = this.enemies.find(e => (shot.targetId === undefined || e.id === shot.targetId) && distance(e, shot) < ENEMIES[e.type].radius + 6);
        if (enemy) {
          this.removeShot(shot);
          this.hit(enemy, shot.damage);
          if(shot.splash)for(const other of [...this.enemies])if(other!==enemy&&distance(other,enemy)<shot.splash)
            this.hit(other,shot.damage*.55,'flex');
          if(this.buffs['chain-reaction']>0&&this.random()<(.05+this.buffs['chain-reaction']*.05))
            for(const other of this.enemies.filter(e=>e!==enemy&&distance(e,enemy)<100).slice(0,1))
              this.hit(other,shot.damage*.4,'flex');
          // Piercing Sigma FLEX makes one additional bounded strike. Ordinary
          // Skibidi ricochet remains available and can never loop indefinitely.
          const target=shot.piercing
            ? this.enemies.find(e=>e.id!==enemy.id && distance(e,enemy)<120)
            : this.buffs['skibidi-bounce']?findBounce(shot,enemy,this.enemies):undefined;
          if(target){
            if(shot.piercing)this.hit(target,shot.damage*.6,'flex');
            else{
              const bounce=this.shoot(enemy,target,shot.damage*.55);
              bounce.bounced=true;bounce.targetId=target.id;
            }
          }
        }
      }
    }
    // Combat V2: old affinity drops are no longer collected.
    for (const drop of [...this.drops]) {
      const d = distance(drop, this.pos);
      if (d < 26) {
        this.drops.splice(this.drops.indexOf(drop), 1);
        const amount = this.characterId === 'fanum' ? Math.ceil(drop.xp * 1.25) : drop.xp;
        this.xpCollected += amount;
        this.pendingUpgrades += this.xp.gain(amount);
      } else if (d < 100+(this.buffs['magnet-mode']??0)*12) {
        const v = normalized(this.pos.x - drop.x, this.pos.y - drop.y);
        const step = Math.min(d, 300 * dt / 1000);
        drop.x += v.x * step; drop.y += v.y * step;
      }
    }
    this.hp = this.effects.heal(this.hp, this.stats.maxHp, this.clock, this.lastDamageAt, this.buffs['touch-grass'] > 0);
    this.hp = Math.min(this.stats.maxHp,this.hp+(this.buffs['recovery-snack']??0)*.2*dt/1000);
    this.flex.sync(this.clock,this.aura.value);
    this.maxAura=Math.max(this.maxAura,this.aura.peak);
    if (this.pendingUpgrades > 0) { this.offerUpgrade(); if (this.mode === 'upgrades') return; }
    if (this.waveClock >= GAME.waveDurationMs) {
      if (this.wave < GAME.waveCount) {
        if (!this.tookHitThisWave) this.cleanWave = true;
        this.mode = 'between';
      }
      else if (this.bossDefeated) this.mode = 'win';
    }
  }

  private attack():void {
    if(!this.enemies.length)return;
    const auraShot=this.buffs['aura-shot'];
    if(auraShot>0 && this.clock>=this.fireReady){
      const target=this.enemies.reduce((x,y)=>distance(x,this.pos)<distance(y,this.pos)?x:y);
      const shot=this.shoot(this.pos,target,this.damage(18*(1+(auraShot-1)*.23)));
      if(this.buffs['double-trouble']>0&&this.random()<(this.buffs['double-trouble']===2?.18:.1))
        this.shoot(this.pos,target,this.damage(10));
      if(this.flexActive&&(this.characterId==='sigma'||this.characterId==='nerd'))shot.piercing=true;
      this.fireReady=this.clock+420/(this.aura.fireRateMultiplier*this.stats.fireRate*
        (1+(auraShot-1)*.13)*(this.flexActive&&this.characterId==='nerd'?1.3:this.flexActive&&this.characterId==='sigma'?1.25:1)*(this.clock<this.timeWarpUntil?1.25:1));
    }
    const jawLevel=this.buffs['mewing-jaw'];
    const jawRadius=(90+Math.max(0,jawLevel-1)*10)*(1+this.buffs['long-reach']*.05);
    if(jawLevel>0 && this.clock>=this.jawReady &&
      this.enemies.some(e=>distance(e,this.pos)<jawRadius)){
      this.jawReady=this.clock+1100/(1+(jawLevel-1)*.12);
      this.jawUntil=this.clock+175;
      for(const e of [...this.enemies])if(distance(e,this.pos)<jawRadius)
        this.hit(e,this.damage(26*(1+(jawLevel-1)*.3))*
          (this.characterId==='alpha'?1.15:1));
    }
    const orbLevel=this.buffs['ohio-orbiter'];
    if(orbLevel>0 && this.clock>=this.orbReady){
      const range=ENEMIES.npc.radius+12+3*(orbLevel-1);
      const targets=this.enemies.filter(e=>distance(e,this.orb)<ENEMIES[e.type].radius+range);
      if(targets.length){
        this.orbReady=this.clock+350/(1+(orbLevel-1)*.08);
        for(const e of [...targets])this.hit(e,this.damage(14*(1+(orbLevel-1)*.26)));
      }
    }
    const volleyLevel=this.buffs['six-seven'];
    if(volleyLevel>0 && this.clock>=this.volleyReady){
      this.volleyReady=this.clock+6500/(1+(volleyLevel-1)*.16);
      const count=5+volleyLevel*2;
      for(let i=0;i<count;i++){
        const angle=i*Math.PI*2/count;
        this.shoot(this.pos,{x:this.pos.x+Math.cos(angle),y:this.pos.y+Math.sin(angle)},
          this.damage(11+(volleyLevel-1)*4),false,400);
      }
    }
    const memeLevel=this.buffs['meme-launcher'];
    if(memeLevel>0&&this.clock>=this.memeReady){
      const target=this.enemies.reduce((a,b)=>distance(a,this.pos)<distance(b,this.pos)?a:b);
      const shot=this.shoot(this.pos,target,this.damage(45*(1+(memeLevel-1)*.22)),false,320);
      shot.splash=88+(memeLevel-1)*13;
      this.memeReady=this.clock+3000/(1+(memeLevel-1)*.14);
    }
    const rizzLevel=this.buffs['rizz-blast'];
    const radius=(110+(rizzLevel-1)*19)*(1+this.buffs['long-reach']*.05);
    if(rizzLevel>0 && this.clock>=this.rizzBlastReady &&
      this.enemies.some(e=>distance(e,this.pos)<=radius)){
      this.rizzBlastReady=this.clock+4800/(1+(rizzLevel-1)*.13);
      this.rizzBlastUntil=this.clock+260;
      this.rizzBlastRadius=radius;
      for(const e of [...this.enemies])if(distance(e,this.pos)<=radius){
        e.rizzSlowUntil=this.clock+(e.type==='boss'?400:1050);
        this.hit(e,this.damage(13+(rizzLevel-1)*7));
      }
    }
  }

  private damage(base: number): number {
    const stats = this.stats;
    const sigma=this.flexActive&&(this.characterId==='sigma'||this.characterId==='nerd');
    const crit=this.random()<Math.min(.5,this.stats.critChance+(sigma?.15:0));
    this.lastCrit=crit;
    return base*this.aura.attackMultiplier(this.clock)*stats.damage*(sigma?1.15:1)*(this.clock<this.flexDamageUntil&&this.buffs['main-character-energy']>0?1.25:1)*
      (crit?2:1);
  }

  private shoot(from: Vec2, to: Vec2, damage: number, hostile = false, speed = 470): Shot {
    const v = normalized(to.x - from.x, to.y - from.y);
    const shot: Shot = { x: from.x, y: from.y, vx: v.x * speed, vy: v.y * speed, ttl: hostile ? 5000 : 1800, damage, hostile };
    this.shots.push(shot);
    return shot;
  }

  private removeShot(shot: Shot): void {
    const index = this.shots.indexOf(shot);
    if (index >= 0) this.shots.splice(index, 1);
  }

  private hit(enemy: Enemy, damage: number,source:'normal'|'flex'='normal'): void {
    const elite=enemy.type==='boss'||enemy.type==='beta';
    const dealt=damage*(elite&&this.buffs['final-boss-energy']>0?1.15:1);
    if(source==='normal'&&this.buffs['infinite-rizz']>0&&this.lastCrit&&this.clock>=(this.effectCooldowns.get('infinite-rizz')??0)){
      this.effectCooldowns.set('infinite-rizz',this.clock+1000);
      this.lastCrit=false;
      enemy.hp-=dealt*.35;
    }
    if(source==='normal'&&this.buffs.shockwave>0&&this.random()<(.04+.04*this.buffs.shockwave)
       &&this.clock>=(this.effectCooldowns.get('shockwave')??0)){
      this.effectCooldowns.set('shockwave',this.clock+2000);
      for(const other of [...this.enemies])if(other!==enemy&&distance(other,enemy)<105)
        this.hit(other,dealt*.35,'flex');
    }
    enemy.hp-=source==='flex'?dealt:firstHitDamage(enemy,ENEMIES[enemy.type].hp*difficultyV2(this.wave).hp,dealt,this.buffs.mogged);
    if(source==='normal'&&this.buffs['heavy-impact']>0&&enemy.hp>0){
      const dir=normalized(enemy.x-this.pos.x,enemy.y-this.pos.y);
      const push=4+this.buffs['heavy-impact']*3;
      if(this.world){const next=moveOnMap(enemy,dir.x*push,dir.y*push,ENEMIES[enemy.type].radius,this.world);enemy.x=next.x;enemy.y=next.y;}
      else{enemy.x=clamp(enemy.x+dir.x*push,25,935);enemy.y=clamp(enemy.y+dir.y*push,105,575);}
    }
    if (enemy.hp > 0) return;
    const index = this.enemies.indexOf(enemy);
    if (index < 0) return;
    this.enemies.splice(index, 1); this.kills++;
    this.drops.push({ x: enemy.x, y: enemy.y, xp: ENEMIES[enemy.type].xp });
    if (enemy.type === 'boss') { this.bossDefeated = true; this.say('BIG HATER defeated!'); }
    // Active FLEX kills must not immediately recharge the Ultimate.
    if(!this.flexActive)this.aura.change(5+(distance(enemy,this.pos)<=135+(this.buffs['aura-magnet']??0)*18?2:0)+(elite&&this.buffs['final-boss-energy']>0?15:0),this.clock);
    if(this.buffs['vampire-mode']>0&&this.clock>=(this.effectCooldowns.get('vampire')??0)){
      this.hp=Math.min(this.stats.maxHp,this.hp+1+this.buffs['vampire-mode']);
      this.effectCooldowns.set('vampire',this.clock+2000);
    }
    if(this.characterId==='fanum'&&this.flexActive&&this.clock>=(this.effectCooldowns.get('fanum')??0)){
      this.hp=Math.min(this.stats.maxHp,this.hp+3);this.effectCooldowns.set('fanum',this.clock+1000);
    }
    if(enemy.type==='beta'&&this.buffs['time-warp']>0)this.timeWarpUntil=this.clock+3000;
    if(this.buffs['explosive-finish']>0&&this.random()<this.buffs['explosive-finish']*.04)
      for(const e of [...this.enemies])if(distance(e,enemy)<95)this.hit(e,35+15*(this.buffs['explosive-finish']-1),'flex');

    if (this.buffs['rizz-aura'] && this.kills % 12 === 0) {
      rizzPulse(this.enemies, this.pos, this.clock);
      this.effects.rizzPulseUntil = this.clock + 300;
    }
    if (this.buffs['six-seven'] && this.kills % 67 === 0 && !this.flexActive) {
      this.sixSevenTriggered = true;
      for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7;
        this.shoot(this.pos, { x: this.pos.x + Math.cos(angle), y: this.pos.y + Math.sin(angle) }, this.damage(18));
      }
      if (this.buffs['skibidi-bounce'] > 0) this.ultimate67Triggered = true;
      this.say(this.effects.volleyMessage(this.buffs['skibidi-bounce'] > 0));
    }
  }

  private hurt(amount:number):void {
    if(this.flexActive&&this.characterId==='cool-kid')return;
    const damage = Math.max(1, amount - this.stats.armor) * this.stats.incomingDamage * (this.flexActive&&this.characterId==='alpha'?.28:1);
    if(this.buffs['guardian-angel']>0&&this.clock>=(this.effectCooldowns.get('guardian')??0)){
      this.effectCooldowns.set('guardian',this.clock+(this.buffs['guardian-angel']===2?45000:60000));
      return;
    }
    const result = this.effects.receiveDamage(this.hp, damage, this.clock, this.buffs.delulu > 0);
    if (result.ignored) return;
    this.hp = result.hp;
    this.damageTaken += damage;
    this.tookHitThisWave = true;
    this.effects.tookDamage(this.clock);
    this.lastDamageAt = this.clock;
    // HP damage does not erase earned FLEX charge: prevents melee death spirals.
    // Existing Delulu and incoming armor calculations remain unchanged.
    if (result.saved) this.say('DELULU SAVED YOU!');
    if(this.hp<=0&&this.buffs['built-different']>0&&!this.builtDifferentUsed){
      this.builtDifferentUsed=true;this.hp=Math.ceil(this.stats.maxHp*.25);this.say('BUILT DIFFERENT!');
    }
    if(this.hp>0&&this.hp<this.stats.maxHp*.3&&this.buffs['second-wind']>0&&this.clock>=(this.effectCooldowns.get('second-wind')??0)){
      this.hp=Math.min(this.stats.maxHp,this.hp+4+4*this.buffs['second-wind']);
      this.effectCooldowns.set('second-wind',this.clock+45000);
    }
    if (this.hp <= 0) this.mode = 'dead';
  }

  private rampage():void {
    for(const e of [...this.enemies]){
      if(distance(e,this.pos)>ENEMIES[e.type].radius+GAME.playerRadius+12)continue;
      if(this.clock<(this.flexHitAt.get(e.id)??-1))continue;
      this.flexHitAt.set(e.id,this.clock+350);
      const base=32*this.stats.damage*(1+this.buffs['mewing-jaw']*.12);
      if(e.type==='boss'){
        const total=ENEMIES.boss.hp*.25;
        const already=this.flexBossDamage.get(e.id)??0;
        const actual=Math.min(Math.max(0,total-already),base);
        if(actual<=0)continue;
        this.flexBossDamage.set(e.id,already+actual);
        this.hit(e,actual,'flex');
      }else{
        this.hit(e,base,'flex');
        if(this.enemies.includes(e)){
          const direction=normalized(e.x-this.pos.x,e.y-this.pos.y);
          if(this.world){
            const shoved=moveOnMap(e,direction.x*21,direction.y*21,ENEMIES[e.type].radius,this.world);
            e.x=shoved.x;e.y=shoved.y;
          } else {
            e.x=clamp(e.x+direction.x*21,25,935);
            e.y=clamp(e.y+direction.y*21,105,575);
          }
        }
      }
    }
  }

  private offerUpgrade(): void {
    const options=legalUpgrades(this.buffs,availableBuffs(this.buffs,this.xp.level));
    if (!options.length || this.pendingUpgrades <= 0) {
      // Exhausted loadouts turn surplus XP into a small, deterministic resource
      // benefit instead of trapping the player on an empty choice screen.
      if(this.pendingUpgrades>0 && !options.length){
        this.hp=Math.min(this.stats.maxHp,this.hp+8*this.pendingUpgrades);
        if(!this.flexActive)this.aura.change(6*this.pendingUpgrades,this.clock);
      }
      this.pendingUpgrades = 0; this.choices = []; this.mode = 'playing'; return;
    }
    // Fisher–Yates: unique choices with no random-sort comparator bias.
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    // All heroes draw from the same weapon and passive offer pool.
    this.choices=options.slice(0,3);
    this.mode='upgrades';
  }

  private spawn(type: EnemyType): void {
    let pos: Vec2;
    if(this.world) {
      const result=pickSpawnNearPlayer(this.world,this.pos,ENEMIES[type].radius,this.random);
      if(!result)return; // Never spawn inside an obstacle or directly on the hero.
      pos=result;
    } else {
      const side = Math.floor(this.random() * 4), offset = this.random();
      pos = side < 2 ? { x: side === 0 ? 25 : 935, y: 105 + offset * 470 }
        : { x: 25 + offset * 910, y: side === 2 ? 105 : 575 };
      if (distance(pos, this.pos) < 220) { pos.x = 960 - pos.x; pos.y = 680 - pos.y; }
    }
    this.enemies.push({ ...pos, id: this.nextId++, type, hp: Math.ceil(ENEMIES[type].hp*difficultyV2(this.wave).hp), nextHit: this.clock, nextShot: this.clock + 1500 });
  }

  private say(message: string): void { this.feedback = message; this.feedbackUntil = this.clock + 2200; }
}
