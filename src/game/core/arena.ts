import { AuraSystem } from './aura';
import { FlexSystem, type FlexResult } from './flex';
import { Progression } from './progression';
import { GAME } from './constants';
import { combatStats } from './combat';
import { BuffEffects, findBounce, firstHitDamage, rizzPulse, rizzSpeed, type BuffTarget, type BounceState } from './buffEffects';
import { clamp, distance, normalized, type Vec2 } from './math';
import { availableBuffs, emptyBuffLevels, type BuffDefinition } from '../data/buffs';
import { ENEMIES, type EnemyType } from '../data/enemies';
import { getCharacter, type CharacterId } from '../data/characters';

export type Mode = 'intro' | 'playing' | 'upgrades' | 'between' | 'dead' | 'win';
export interface Controls { x?: number; y?: number; flex?: boolean; focus?: boolean; confirm?: boolean; choice?: number }
export interface Enemy extends BuffTarget { id: number; hp: number; type: EnemyType; nextHit: number; nextShot: number }
export interface Shot extends Vec2, BounceState { vx: number; vy: number; ttl: number; damage: number; hostile: boolean }
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
  private tookHitThisWave = false;
  private trackedBurstUntil = 0;
  private movedDistance = 0;
  focusReady = 0;
  focusUntil = 0;
  bossSpawned = false;
  bossDefeated = false;
  lastDamageAt = 0;
  feedback = '';
  feedbackUntil = 0;
  jawUntil = 0;
  private spawnClock = 0;
  private fireReady = 0;
  private jawReady = 0;
  private orbReady = 0;
  private nextId = 0;

  constructor(private readonly random: () => number = Math.random, readonly characterId: CharacterId = 'sigma') {
    const selected = getCharacter(characterId);
    if (selected.id === 'alpha') this.buffs['mewing-jaw'] = 1;
    if (selected.id === 'rizzler') this.buffs['rizz-aura'] = 1;
    if (selected.id === 'six-seven') this.buffs['six-seven'] = 1;
    this.hp = this.stats.maxHp;
  }

  start(characterId: CharacterId = this.characterId): void {
    Object.assign(this, new Arena(this.random, characterId));
    this.mode = 'playing';
  }

  get nearby(): number { return this.enemies.filter(e => distance(e, this.pos) <= GAME.flexRadius).length; }
  get stats() {
    const character = getCharacter(this.characterId);
    const stats = combatStats(this.buffs, this.aura.value, this.nearby, this.clock - this.lastDamageAt, this.hp, Math.round(100 * character.hp));
    return { ...stats, speed: stats.speed * character.speed, damage: stats.damage * character.damage,
      fireRate: stats.fireRate * character.fireRate, critChance: Math.min(1, stats.critChance + character.crit),
      armor: stats.armor + character.armor };
  }
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
        this.enemies = []; this.shots = []; this.drops = [];
        this.hp = Math.min(this.stats.maxHp, this.hp + 20); this.mode = 'playing';
      }
      return;
    }
    if (this.mode === 'upgrades') {
      const buff = input.choice === undefined ? undefined : this.choices[input.choice];
      if (buff) {
        this.buffs[buff.id]++;
        if (buff.id === 'thick-skin') this.hp = Math.min(this.stats.maxHp, this.hp + 20);
        this.pendingUpgrades--; this.offerUpgrade();
      }
      return;
    }
    if (input.flex && this.flex.tryStart(this.clock)) this.say('FLEX — keep 3 enemies nearby!');
    if (input.focus && this.clock >= this.focusReady) {
      this.focusUntil = this.clock + GAME.focusDurationMs;
      this.focusReady = this.clock + GAME.focusCooldownMs;
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
    const charging = this.flex.state === 'charging';
    if (!charging) {
      const v = normalized(input.x ?? 0, input.y ?? 0);
      const speed = this.stats.speed * this.aura.moveMultiplier;
      const previousX = this.pos.x, previousY = this.pos.y;
      this.pos.x = clamp(this.pos.x + v.x * speed * dt / 1000, 25, 935);
      this.pos.y = clamp(this.pos.y + v.y * speed * dt / 1000, 105, 575);
      if (this.characterId === 'ohio') {
        this.movedDistance += Math.hypot(this.pos.x - previousX, this.pos.y - previousY);
        if (this.movedDistance >= 280 && this.enemies.length) {
          this.movedDistance -= 280;
          const target = this.enemies.reduce((a, b) => distance(a, this.pos) < distance(b, this.pos) ? a : b);
          this.shoot(this.pos, target, this.damage(10));
        }
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
      // Keep Focus unchanged; simultaneous slows use the stronger effect, not a product.
      const slow = Math.min(this.clock < this.focusUntil ? .62 : 1, rizzSpeed(e, e.type === 'boss', this.clock));
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
    // Existing projectiles can finish their flight during FLEX; no new attacks start.
    if (!charging) this.attack();
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
          // A ricochet continues an existing attack, including during FLEX.
          const target = this.buffs['skibidi-bounce'] ? findBounce(shot, enemy, this.enemies) : undefined;
          if (target) {
            const bounce = this.shoot(enemy, target, shot.damage * .55);
            bounce.bounced = true; bounce.targetId = target.id;
          }
        }
      }
    }
    const flexResult = this.flex.update(this.clock, this.nearby);
    if (flexResult !== 'waiting') this.finishFlex(flexResult);
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
    if (this.aura.burstUntil > this.trackedBurstUntil) {
      this.trackedBurstUntil = this.aura.burstUntil; this.auraBursts++; this.maxAura = 100;
    }
    this.maxAura = Math.max(this.maxAura, this.aura.value);
    if (this.pendingUpgrades > 0) { this.offerUpgrade(); if (this.mode === 'upgrades') return; }
    if (this.waveClock >= GAME.waveDurationMs) {
      if (this.wave < GAME.waveCount) {
        if (!this.tookHitThisWave) this.cleanWave = true;
        this.mode = 'between';
      }
      else if (this.bossDefeated) this.mode = 'win';
    }
  }

  private attack(): void {
    if (!this.enemies.length) return;
    if (this.clock >= this.fireReady) {
      const target = this.enemies.reduce((a, b) => distance(a, this.pos) < distance(b, this.pos) ? a : b);
      this.shoot(this.pos, target, this.damage(18));
      this.fireReady = this.clock + 420 / (this.aura.fireRateMultiplier * this.stats.fireRate);
    }
    if (this.buffs['mewing-jaw'] && this.clock >= this.jawReady && this.enemies.some(e => distance(e, this.pos) < 95)) {
      this.jawReady = this.clock + 1100; this.jawUntil = this.clock + 160;
      for (const e of [...this.enemies]) if (distance(e, this.pos) < 95) this.hit(e, this.damage(26) * (this.characterId === 'alpha' ? 1.15 : 1));
    }
    if (this.buffs['ohio-orbiter'] && this.clock >= this.orbReady) {
      const targets = this.enemies.filter(e => distance(e, this.orb) < ENEMIES[e.type].radius + 12);
      if (targets.length) {
        this.orbReady = this.clock + 350;
        for (const e of targets) this.hit(e, this.damage(14));
      }
    }
  }

  private damage(base: number): number {
    const stats = this.stats;
    return base * this.aura.attackMultiplier(this.clock) * stats.damage * (this.random() < stats.critChance ? 2 : 1);
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

  private hit(enemy: Enemy, damage: number): void {
    enemy.hp -= firstHitDamage(enemy, ENEMIES[enemy.type].hp, damage, this.buffs.mogged);
    if (enemy.hp > 0) return;
    const index = this.enemies.indexOf(enemy);
    if (index < 0) return;
    this.enemies.splice(index, 1); this.kills++;
    this.drops.push({ x: enemy.x, y: enemy.y, xp: ENEMIES[enemy.type].xp });
    if (enemy.type === 'boss') { this.bossDefeated = true; this.say('BIG HATER defeated!'); }
    if (this.kills % 5 === 0) this.aura.change(10, this.clock);
    if (this.buffs['rizz-aura'] && this.kills % 12 === 0) {
      rizzPulse(this.enemies, this.pos, this.clock);
      this.effects.rizzPulseUntil = this.clock + 300;
    }
    if (this.buffs['six-seven'] && this.kills % 67 === 0 && this.flex.state !== 'charging') {
      for (let i = 0; i < 7; i++) {
        const angle = i * Math.PI * 2 / 7;
        this.shoot(this.pos, { x: this.pos.x + Math.cos(angle), y: this.pos.y + Math.sin(angle) }, this.damage(18));
      }
      if (this.buffs['skibidi-bounce'] > 0) this.ultimate67Triggered = true;
      this.say(this.effects.volleyMessage(this.buffs['skibidi-bounce'] > 0));
    }
  }

  private hurt(amount: number): void {
    const damage = Math.max(1, amount - this.stats.armor) * this.stats.incomingDamage;
    const result = this.effects.receiveDamage(this.hp, damage, this.clock, this.buffs.delulu > 0);
    if (result.ignored) return;
    this.hp = result.hp;
    this.damageTaken += damage;
    this.tookHitThisWave = true;
    this.effects.tookDamage(this.clock);
    this.lastDamageAt = this.clock;
    this.aura.change(-20, this.clock);
    if (this.flex.interrupt(this.clock) === 'interrupted') {
      this.flexInterruptions++; this.say('FLEX interrupted!');
    }
    if (result.saved) this.say('DELULU SAVED YOU!');
    if (this.hp <= 0) this.mode = 'dead';
  }

  private finishFlex(result: FlexResult): void {
    if (result === 'success') {
      this.flexSuccesses++;
      this.aura.change(25, this.clock);
      for (const enemy of this.enemies) {
        if (distance(enemy, this.pos) > GAME.flexRadius) continue;
        const v = normalized(enemy.x - this.pos.x, enemy.y - this.pos.y);
        enemy.x = clamp(enemy.x + v.x * 85, 20, 940);
        enemy.y = clamp(enemy.y + v.y * 85, 105, 575);
      }
      this.say('FLEX! +25 AURA');
    } else if (result === 'no-audience') this.say('No audience: need 3 enemies within 145px.');
  }

  private offerUpgrade(): void {
    const options = availableBuffs(this.buffs);
    if (!options.length || this.pendingUpgrades <= 0) {
      this.pendingUpgrades = 0; this.choices = []; this.mode = 'playing'; return;
    }
    // Fisher–Yates: unique choices with no random-sort comparator bias.
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [options[i], options[j]] = [options[j], options[i]];
    }
    this.choices = options.slice(0, 3); this.mode = 'upgrades';
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
