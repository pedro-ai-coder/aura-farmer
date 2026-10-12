import { AuraSystem } from './aura';
import { FlexSystem, type FlexVariant } from './flex';
import {dominantAffinity,collectAffinity,newAffinityCounts,type Affinity,type EssenceDrop} from './affinities';
import { Progression } from './progression';
import { GAME } from './constants';
import { combatStats } from './combat';
import { BuffEffects, findBounce, firstHitDamage, rizzPulse, rizzSpeed, type BuffTarget, type BounceState } from './buffEffects';
import { clamp, distance, normalized, type Vec2 } from './math';
import { availableBuffs, BUFFS, emptyBuffLevels, type BuffDefinition, type BuffId } from '../data/buffs';
import {canEquip,equipment,legalUpgrades} from './equipment';
import { ENEMIES, type EnemyType } from '../data/enemies';
import { getCharacter, type CharacterId } from '../data/characters';

export type Mode = 'intro' | 'playing' | 'upgrades' | 'between' | 'dead' | 'win';
export interface Controls { x?: number; y?: number; flex?: boolean; confirm?: boolean; choice?: number }
export interface Enemy extends BuffTarget { id: number; hp: number; type: EnemyType; nextHit: number; nextShot: number }
export interface Shot extends Vec2, BounceState { vx: number; vy: number; ttl: number; damage: number; hostile: boolean; piercing?: boolean }
export interface Drop extends Vec2 { xp: number }

/** Phaser-free simulation. All durations use active simulation time, including cooldowns. */
export class Arena {
  mode: Mode = 'intro';
  pos = { x: 480, y: 330 };
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

  constructor(private readonly random: () => number = Math.random, readonly characterId: CharacterId = 'sigma') {
    const selected = getCharacter(characterId);
    // Every starter carries one real automatic weapon, counted in the loadout.
    this.buffs['aura-shot']=1;
    if (selected.id === 'alpha'||selected.id==='cool-kid') this.buffs['mewing-jaw'] = 1;
    if (selected.id === 'rizzler') { this.buffs['rizz-aura'] = 1; this.buffs['rizz-blast']=1; }
    if (selected.id === 'six-seven') this.buffs['six-seven'] = 1;
    this.hp = this.stats.maxHp;
  }

  start(characterId: CharacterId = this.characterId): void {
    Object.assign(this, new Arena(this.random, characterId));
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
    const fallback:Affinity=this.characterId==='alpha'||this.characterId==='fanum'||this.characterId==='cool-kid'?'alpha':
      this.characterId==='rizzler'?'rizz':'sigma';
    return dominantAffinity(this.affinities,fallback);
  }
  get flexName():string {
    const family=this.flex.isActive(this.clock)?this.flex.variant:this.flexVariant;
    if(family==='alpha')return this.characterId==='cool-kid'?'GIGA CHAD RAMPAGE':
      this.characterId==='alpha'?'UNSTOPPABLE CHAD':'ALPHA RAMPAGE';
    if(family==='sigma')return this.characterId==='nerd'?'SIGMA KID OVERCLOCK':
      this.characterId==='six-seven'?'67 OVERDRIVE':
      this.characterId==='ohio'?'OHIO BLITZ':'SIGMA OVERCLOCK';
    return this.characterId==='rizzler'?'INFINITE RIZZ':'RIZZ TAKEOVER';
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
        this.hp = Math.min(this.stats.maxHp, this.hp + 20); this.mode = 'playing';
      }
      return;
    }
    if (this.mode === 'upgrades') {
      const buff = input.choice === undefined ? undefined : this.choices[input.choice];
      if (buff && BUFFS.includes(buff) && canEquip(this.buffs,buff)) {
        this.buffs[buff.id]++;
        if (buff.id === 'thick-skin') this.hp = Math.min(this.stats.maxHp, this.hp + 20);
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
    const alphaBoost=active&&variant==='alpha'?(this.characterId==='cool-kid'?1.85:this.characterId==='alpha'?1.22:1.45):1;
    const speed=this.stats.speed*this.aura.moveMultiplier*alphaBoost;
    const previousX=this.pos.x,previousY=this.pos.y;
    this.pos.x=clamp(this.pos.x+v.x*speed*dt/1000,25,935);
    this.pos.y=clamp(this.pos.y+v.y*speed*dt/1000,105,575);
    if (this.characterId==='ohio') {
      this.movedDistance+=Math.hypot(this.pos.x-previousX,this.pos.y-previousY);
      if(this.movedDistance>=280&&this.enemies.length){
        this.movedDistance-=280;
        const target=this.enemies.reduce((a,b)=>distance(a,this.pos)<distance(b,this.pos)?a:b);
        this.shoot(this.pos,target,this.damage(10));
      }
    }
    if (this.waveClock < GAME.waveDurationMs && this.spawnClock >= Math.max(300, 1100 - this.wave * 120)) {
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
      const d = distance(e, this.pos), v = normalized(this.pos.x - e.x, this.pos.y - e.y);
      // Rizz Ultimate slows crowds, with reduced effects on bosses.
      const slow=rizzSpeed(e,e.type==='boss',this.clock);
      // Haters stop at range and fire aimed, dodgeable projectiles.
      if (e.type !== 'hater' || d > 235) {
        e.x += v.x * stats.speed * dt / 1000 * slow;
        e.y += v.y * stats.speed * dt / 1000 * slow;
      }
      if ((e.type === 'hater' || e.type === 'boss') && this.clock >= e.nextShot) {
        this.shoot(e, this.pos, stats.damage, true, 165);
        e.nextShot = this.clock + (e.type === 'boss' ? 1200 : 1800);
      }
      if (distance(e, this.pos) < stats.radius + GAME.playerRadius && this.clock >= e.nextHit) {
        e.nextHit = this.clock + 850;
        this.hurt(stats.damage);
        if (this.mode === 'dead') return;
      }
    }
    if(active&&variant==='alpha')this.rampage();
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
    if(!(active&&variant==='alpha'))this.attack();
    for (const shot of [...this.shots]) {
      shot.x += shot.vx * dt / 1000; shot.y += shot.vy * dt / 1000; shot.ttl -= dt;
      if (shot.ttl <= 0) { this.removeShot(shot); continue; }
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
    for(const drop of [...this.essenceDrops]){
      const d=distance(drop,this.pos);
      if(d<26){
        this.essenceDrops.splice(this.essenceDrops.indexOf(drop),1);
        collectAffinity(this.affinities,drop.affinity);
        this.lastEssence=drop.affinity;
        this.say(drop.affinity.toUpperCase()+' ESSENCE +1');
      }else if(d<110){
        const v=normalized(this.pos.x-drop.x,this.pos.y-drop.y);
        const step=Math.min(d,310*dt/1000);
        drop.x+=v.x*step;drop.y+=v.y*step;
      }
    }
    for (const drop of [...this.drops]) {
      const d = distance(drop, this.pos);
      if (d < 26) {
        this.drops.splice(this.drops.indexOf(drop), 1);
        const amount = this.characterId === 'fanum' ? Math.ceil(drop.xp * 1.25) : drop.xp;
        this.xpCollected += amount;
        this.pendingUpgrades += this.xp.gain(amount);
      } else if (d < 100) {
        const v = normalized(this.pos.x - drop.x, this.pos.y - drop.y);
        const step = Math.min(d, 300 * dt / 1000);
        drop.x += v.x * step; drop.y += v.y * step;
      }
    }
    this.hp = this.effects.heal(this.hp, this.stats.maxHp, this.clock, this.lastDamageAt, this.buffs['touch-grass'] > 0);
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
      if(this.flexActive&&this.flex.variant==='sigma')shot.piercing=true;
      this.fireReady=this.clock+420/(this.aura.fireRateMultiplier*this.stats.fireRate*
        (1+(auraShot-1)*.13)*(this.flexActive&&this.flex.variant==='sigma'?(this.characterId==='nerd'?2.35:1.9):1));
    }
    const jawLevel=this.buffs['mewing-jaw'];
    const jawRadius=90+Math.max(0,jawLevel-1)*10;
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
    const rizzLevel=this.buffs['rizz-blast'];
    const radius=110+(rizzLevel-1)*19;
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
    const sigma=this.flexActive&&this.flex.variant==='sigma';
    const overclock=sigma?(this.characterId==='nerd'?1.38:this.characterId==='six-seven'?1.12:1.24):1;
    return base*this.aura.attackMultiplier(this.clock)*stats.damage*overclock*
      (this.random()<Math.min(.65,stats.critChance+(sigma?(this.characterId==='nerd'?.22:.12):0))?1.7:1);
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
    enemy.hp-=source==='flex'?damage:firstHitDamage(enemy,ENEMIES[enemy.type].hp,damage,this.buffs.mogged);
    if (enemy.hp > 0) return;
    const index = this.enemies.indexOf(enemy);
    if (index < 0) return;
    this.enemies.splice(index, 1); this.kills++;
    this.drops.push({ x: enemy.x, y: enemy.y, xp: ENEMIES[enemy.type].xp });
    if (enemy.type === 'boss') { this.bossDefeated = true; this.say('BIG HATER defeated!'); }
    // Active FLEX kills must not immediately recharge the Ultimate.
    if(!this.flexActive)this.aura.change(5+(distance(enemy,this.pos)<=135?2:0),this.clock);
    if(this.random()<.38){
      const affinity:Affinity=enemy.type==='beta'?'alpha':enemy.type==='hater'?'sigma':
        this.random()<.34?'alpha':this.random()<.5?'sigma':'rizz';
      this.essenceDrops.push({x:enemy.x,y:enemy.y,affinity});
    }
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
    if(this.flexActive&&this.flex.variant==='alpha')return;
    const damage = Math.max(1, amount - this.stats.armor) * this.stats.incomingDamage;
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
    if (this.hp <= 0) this.mode = 'dead';
  }

  private rampage():void {
    for(const e of [...this.enemies]){
      if(distance(e,this.pos)>ENEMIES[e.type].radius+GAME.playerRadius+12)continue;
      if(this.clock<(this.flexHitAt.get(e.id)??-1))continue;
      this.flexHitAt.set(e.id,this.clock+(this.characterId==='cool-kid'?290:this.characterId==='alpha'?620:420));
      // Cool Kid clears crowds quickly; Alpha Chad controls space with a heavier shove.
      // Snapshot family remains fixed during the activation; ordinary build damage is capped.
      const cool=this.characterId==='cool-kid',chad=this.characterId==='alpha';
      const base=(cool?42:chad?22:29)*Math.min(1.35,this.stats.damage)*(1+Math.min(3,this.buffs['mewing-jaw'])*.08);
      if(e.type==='boss'){
        const total=ENEMIES.boss.hp*(this.characterId==='cool-kid'?.22:this.characterId==='alpha'?.16:.18);
        const already=this.flexBossDamage.get(e.id)??0;
        const actual=Math.min(Math.max(0,total-already),base);
        if(actual<=0)continue;
        this.flexBossDamage.set(e.id,already+actual);
        this.hit(e,actual,'flex');
      }else{
        this.hit(e,base,'flex');
        if(this.enemies.includes(e)){
          const direction=normalized(e.x-this.pos.x,e.y-this.pos.y);
          const shove=this.characterId==='alpha'?54:this.characterId==='cool-kid'?15:25;
          e.x=clamp(e.x+direction.x*shove,25,935);
          e.y=clamp(e.y+direction.y*shove,105,575);
        }
      }
    }
  }

  private offerUpgrade(): void {
    const options=legalUpgrades(this.buffs,availableBuffs(this.buffs));
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
    // Prefer matching essence builds, but preserve cross-affinity choices.
    const current=this.flexVariant;
    const tags:Record<string,Affinity>={alpha:'alpha',drip:'alpha','thick-skin':'alpha','mewing-jaw':'alpha',
      sigma:'sigma',mewing:'sigma','locked-in':'sigma','skibidi-bounce':'sigma','six-seven':'sigma','aura-shot':'sigma',
      'rizz-aura':'rizz','rizz-blast':'rizz','touch-grass':'rizz',delulu:'rizz',speed:'rizz'};
    const collected=this.affinities[current];
    const aligned=collected?options.filter(o=>tags[o.id]===current):[];
    const neutral=options.filter(o=>!aligned.includes(o));
    const preferred=aligned.slice(0,Math.min(collected?2:0,3));
    this.choices=[...preferred,...neutral].slice(0,3);
    if(this.choices.length<3)this.choices.push(...aligned.slice(preferred.length,3));
    this.mode='upgrades';
  }

  private spawn(type: EnemyType): void {
    const side = Math.floor(this.random() * 4), offset = this.random();
    const pos = side < 2 ? { x: side === 0 ? 25 : 935, y: 105 + offset * 470 }
      : { x: 25 + offset * 910, y: side === 2 ? 105 : 575 };
    // Never materialize on the player, even when they hug an arena edge.
    if (distance(pos, this.pos) < 220) { pos.x = 960 - pos.x; pos.y = 680 - pos.y; }
    this.enemies.push({ ...pos, id: this.nextId++, type, hp: ENEMIES[type].hp, nextHit: this.clock, nextShot: this.clock + 1500 });
  }

  private say(message: string): void { this.feedback = message; this.feedbackUntil = this.clock + 2200; }
}
