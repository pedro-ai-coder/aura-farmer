import { BERSERK_AFTER, BOSS_START, CAPS, HEROES, WAVES, heroById, weaponById, xpRequired, type DemoHero } from '../catalog/content';
import { ENEMIES, EVENTS, type EnemyKind } from '../catalog/enemies';
import { Inventory, type Choice } from './inventory';
import { angleDelta, clearLine, direction, distance, move, seededRandom, spawnPoint, type Point } from './world';
import type { Area, Drop, Effect, Enemy, Input, Projectile, RunMode, Shield } from './types';
import { updateWeapons } from './weapons';
import { updateEnemies } from './enemies';
/** Pure, seeded simulation. Seconds are active time; every modal freezes this clock. */
export class Run {
    readonly hero;
    readonly inventory;
    readonly random;
    time = 0;
    wave = 1;
    level = 1;
    xp = 0;
    xpCollected = 0;
    pending = 0;
    kills = 0;
    mode: RunMode = 'playing';
    pos: Point = { x: 724, y: 610 };
    facing = 0;
    movementFacing = 0;
    moving = false;
    hp: number;
    aura = 0;
    flexUntil = 0;
    flexCooldown = 0;
    flexTarget = 0;
    flexCount = 0;
    enemies: Enemy[] = [];
    shots: Projectile[] = [];
    areas: Area[] = [];
    drops: Drop[] = [];
    effects: Effect[] = [];
    shields: Record<string, Shield> = {};
    timers: Record<string, number> = {};
    counters: Record<string, number> = {};
    choices: Choice[] = [];
    legendaryOffer: Choice[] = [];
    legendaryDeferred = false;
    legendaryReminder = false;
    message = 'FIRST POST';
    messageUntil = 4;
    autoAim = true;
    reduceMotion = false;
    bossDefeated = false;
    eventsDefeated: string[] = [];
    damageTaken = 0;
    damageDealt = 0;
    healing = 0;
    protection = 0;
    nextSpawn = 1;
    lastContact = -1;
    primaryAura: number[] = [];
    procHits = new Set<number>();
    nextId = 1;
    activation = 0;
    movedSince = 0;
    stoppedSince = 0;
    lockTarget = 0;
    lockSince = 0;
    lockLost = 0;
    private previousMode: RunMode = 'playing';
    private eventIndex = 0;
    private maxLevelHealAt = 0;
    constructor(readonly characterId: DemoHero = 'sigma', readonly seed = Date.now()) {
        this.hero = heroById(characterId);
        this.inventory = new Inventory(this.hero.role, this.hero.starter);
        this.hp = this.hero.hp;
        this.random = seededRandom(seed);
    }
    get activeFlex() { return this.time < this.flexUntil; }
    get maxHp() { return (this.hero.hp + 2 * (this.level - 1)) * (1 + .08 * this.inventory.level('built-different')); }
    get shield() { return Object.values(this.shields).reduce((n, s) => n + (s.until > this.time ? s.amount : 0), 0); }
    get power() { return this.hero.power * (1 + .01 * (this.level - 1)); }
    get support() { return (1 + .06 * this.inventory.level('certified-w')) * (this.inventory.level('w-squad') ? 1.25 : 1); }
    get areaScale() { return 1 + .06 * this.inventory.level('big-meme'); }
    get frequency() {
        const wifi = this.timers.wifiUntil > this.time && distance(this.pos, { x: this.timers.wifiX, y: this.timers.wifiY }) <= 160 ? (.08 + .04 * (this.inventory.level('w-wifi') - 1)) : 0;
        const viral = this.timers.viralUntil > this.time ? .12 + .06 * (this.inventory.level('aura-viral') - 1) : 0;
        return Math.min(1, .05 * this.inventory.level('terminally-online') + Math.max(wifi, viral));
    }
    get boss() { return this.enemies.find(e => e.kind === 'boss'); }
    get berserk() { return !!this.boss && this.time - BOSS_START >= BERSERK_AFTER; }
    get bossDamageMultiplier() { return this.berserk ? Math.min(3, 2 * Math.pow(1.1, Math.floor((this.time - BOSS_START - BERSERK_AFTER) / 30))) : 1; }
    announce(text: string, seconds = 4) { this.message = text; this.messageUntil = this.time + seconds; }
    effect(kind: Effect['kind'], p: Point, text?: string, radius = 25) { this.effects.push({ ...p, id: this.nextId++, kind, until: this.time + .55, text, radius }); }
    addShield(id: string, amount: number, duration: number) {
        const other = Object.entries(this.shields).reduce((n, [key, s]) => n + (key !== id && s.until > this.time ? s.amount : 0), 0);
        const scaled = amount * this.support * (1 + .08 * this.inventory.level('cope-harder'));
        this.shields[id] = { amount: Math.max(0, Math.min(scaled, this.maxHp * .4 - other)), until: this.time + Math.min(6, duration) };
        this.effect('shield', this.pos, undefined, 35);
    }
    heal(amount: number) { const value = Math.min(this.maxHp - this.hp, amount * this.support); this.hp += value; this.healing += value; if (value > 0)
        this.effect('heal', this.pos, '+' + Math.round(value)); }
    gainXp(amount: number) {
        if (amount <= 0)
            return;
        this.xp += amount;
        this.xpCollected += amount;
        while (this.xp >= xpRequired(this.level)) {
            this.xp -= xpRequired(this.level);
            if (this.level < 25) {
                const old = this.maxHp;
                this.level++;
                this.pending++;
                this.hp += this.maxHp - old;
                this.effect('level', this.pos, 'LEVEL ' + this.level, 50);
            }
            else if (this.time >= this.maxLevelHealAt) {
                this.heal(this.maxHp * .05);
                this.maxLevelHealAt = this.time + 20;
            }
        }
    }
    choose(index: number, replaceId?: string): boolean {
        if (this.mode !== 'upgrade' && this.mode !== 'legendary')
            return false;
        const offer = this.choices[index];
        if (!offer)
            return false;
        const old = this.maxHp;
        if (offer.kind === 'heal')
            this.heal(this.maxHp * .08);
        else if (offer.kind === 'shield')
            this.addShield('recovery', this.maxHp * .08, 6);
        else if (!this.inventory.apply(offer, replaceId))
            return false;
        this.hp = Math.min(this.maxHp, this.hp + Math.max(0, this.maxHp - old));
        // First periodic activation starts at acquisition; timers survive removal/re-equipping.
        if (offer.item) {
            const intervals: Record<string, number> = { 'w-wifi': 12, 'big-chad': 10, 'no-u': 15 };
            const interval = intervals[offer.item.id];
            if (interval && this.timers[offer.item.id] === undefined)
                this.timers[offer.item.id] = this.time + interval;
        }
        if (this.mode === 'upgrade')
            this.pending--;
        this.choices = [];
        this.mode = 'playing';
        this.openPending();
        return true;
    }
    deferLegendary() { if (this.mode === 'legendary') {
        this.legendaryDeferred = true;
        this.mode = 'playing';
        this.choices = [];
        this.openPending();
    } }
    openLegendary() {
        if (this.inventory.legendarySpent || this.time < 540 || this.time >= 895 || this.mode !== 'playing')
            return false;
        if (!this.legendaryOffer.length)
            this.legendaryOffer = this.inventory.legendaryChoices(this.random);
        this.mode = 'legendary';
        this.choices = this.legendaryOffer;
        return true;
    }
    openPending() { if (this.mode === 'playing' && this.pending > 0) {
        this.mode = 'upgrade';
        this.choices = this.inventory.normalChoices(this.wave, this.random);
    } }
    pause() { if (this.mode === 'playing') {
        this.previousMode = this.mode;
        this.mode = 'paused';
    } }
    resume() { if (this.mode === 'paused')
        this.mode = this.previousMode; }
    target(range = Infinity): Enemy | undefined {
        return this.enemies.filter(e => e.born <= this.time && e.hp > 0 && distance(this.pos, e) <= range && clearLine(this.pos, e))
            .sort((a, b) => distance(a, this.pos) - distance(b, this.pos) || a.id - b.id)[0];
    }
    activateFlex(): boolean {
        if (this.mode !== 'playing' || this.aura < 100 || this.time < this.flexCooldown || this.activeFlex)
            return false;
        const target = this.target(600);
        if (this.characterId === 'sigma' && !target)
            return false;
        this.aura = 0;
        this.flexUntil = this.time + this.hero.duration;
        this.flexCooldown = this.time + 30;
        this.flexCount++;
        this.flexTarget = target?.id ?? 0;
        this.counters.flexSlams = 0;
        this.counters.flexBossDamage = 0;
        this.timers.flexStart = this.time;
        if (this.characterId === 'alpha')
            this.addShield('alpha-hold', this.maxHp * .25, 6);
        if (this.inventory.level('aura-viral'))
            this.timers.viralUntil = this.time + 5;
        if (this.inventory.level('w-squad'))
            this.timers.squadUntil = this.time + 6;
        this.effect('flex', this.pos, this.hero.flex, 90);
        this.announce(this.hero.flex.toUpperCase(), 2);
        return true;
    }
    spawn(kind: EnemyKind, point?: Point, elite = false, add = false): Enemy | undefined {
        const p = point ?? spawnPoint(this.pos, this.random);
        if (!p)
            return;
        const d = ENEMIES[kind], scale = d.boss || kind === 'terminal' ? 1 : WAVES[this.wave - 1].hp * (elite ? 2.5 : 1);
        const e: Enemy = { ...p, id: this.nextId++, kind, hp: d.hp * scale, maxHp: d.hp * scale, damage: d.damage * (d.boss ? 1 : WAVES[this.wave - 1].damage) * (elite ? 1.3 : 1), radius: d.radius * (elite ? 1.2 : 1), elite, born: this.time + .8, nextAttack: this.time + 2, nextAux: this.time + 8, contactAt: 0, angle: direction(p, this.pos), slow: 0, slowUntil: 0, weaken: 0, weakenUntil: 0, shield: 0, shieldUntil: 0, phase: 0, stagger: 0, staggerUntil: 0, staggerLocked: 0, staggerWindow: 0, staggerAdded: 0, regenAt: BOSS_START + BERSERK_AFTER + 1, chargeUntil: 0, chargeAngle: 0 };
        if (add)
            this.counters['add:' + e.id] = 1;
        if (elite)
            e.shield = e.maxHp * .2, e.shieldUntil = Infinity;
        this.enemies.push(e);
        return e;
    }
    addArea(partial: Partial<Area> & Pick<Area, 'x' | 'y' | 'radius' | 'damage'>): Area {
        const area: Area = { id: this.nextId++, shape: 'circle', width: 30, angle: 0, arc: Math.PI * 2, at: this.time, end: this.time + .1, nextTick: this.time, hostile: false, source: 0, weapon: '', activation: 0, primary: false, hit: [], label: '', start: this.time, ...partial };
        this.areas.push(area);
        return area;
    }
    hitEnemy(e: Enemy, raw: number, weapon = '', activation = 0, primary = false) {
        if (e.hp <= 0 || e.born > this.time)
            return;
        let damage = raw;
        if (weapon) {
            damage *= 1 + .06 * this.inventory.level('main-character') + (this.inventory.level('absolute-cinema') ? .25 + (this.activeFlex ? .20 : 0) : 0) + (this.timers.squadUntil > this.time ? .10 : 0);
            if (this.hero.role === 'melee' && distance(this.pos, e) <= 150)
                damage *= 1 + .07 * this.inventory.level('hands-on-sight');
            if (this.characterId === 'cool-kid' && this.movedSince && this.time - this.movedSince >= 3)
                damage *= 1.1;
            if (this.characterId === 'sigma' && this.lockTarget === e.id && this.time - this.lockSince >= 2)
                damage *= 1.1;
            if (this.activeFlex && this.characterId === 'sigma' && e.id === this.flexTarget)
                damage *= 1.4;
            if (this.inventory.level('let-him-cook') && this.timers.cookUntil > this.time)
                damage *= 1 + (2 + this.inventory.level('let-him-cook')) * .01 * (this.counters.cook ?? 0);
        }
        const execute = this.inventory.level('its-over');
        if (execute && e.hp < e.maxHp * .3)
            damage *= 1 + .15 + .1 * (execute - 1);
        if (e.kind === 'beta' && Math.abs(angleDelta(direction(e, this.pos), e.angle)) <= Math.PI * 100 / 360)
            damage *= .6;
        if (e.kind === 'boss') {
            if (this.berserk)
                damage *= .65;
            damage *= e.staggerUntil > this.time ? 1.15 : this.timers.bossExposed > this.time ? 1.1 : 1;
        }
        if (e.shieldUntil > this.time && e.shield > 0) {
            const block = Math.min(e.shield, damage);
            e.shield -= block;
            damage -= block;
        }
        e.hp -= damage;
        this.damageDealt += damage;
        this.effect('hit', e, String(Math.round(damage)));
        if (primary && !this.procHits.has(activation)) {
            this.procHits.add(activation);
            this.primaryHit(e);
        }
        if (e.hp <= 0)
            this.kill(e);
    }
    stagger(e: Enemy, amount: number) {
        if (e.kind !== 'boss' || this.time < e.staggerLocked)
            return;
        if (Math.floor(this.time) !== e.staggerWindow) {
            e.staggerWindow = Math.floor(this.time);
            e.staggerAdded = 0;
        }
        const applied = Math.min(amount, 20 - e.staggerAdded);
        e.staggerAdded += applied;
        e.stagger += applied;
        if (e.stagger >= 100) {
            e.stagger = 0;
            e.staggerUntil = this.time + 3;
            e.staggerLocked = this.time + 23;
            this.areas = this.areas.filter(a => a.source !== e.id || a.at <= this.time);
            this.announce('STAGGER — NOW!', 3);
        }
    }
    private primaryHit(e: Enemy) {
        this.primaryAura = this.primaryAura.filter(t => this.time - t < 1);
        if (!this.activeFlex && this.primaryAura.length < 2) {
            this.aura = Math.min(100, this.aura + 1);
            this.primaryAura.push(this.time);
        }
        if (this.inventory.level('let-him-cook')) {
            this.counters.cook = Math.min(5, (this.timers.cookUntil > this.time ? this.counters.cook : 0) + 1);
            this.timers.cookUntil = this.time + 3;
        }
        if (this.inventory.level('homie-check') && this.time >= (this.timers.homie ?? 0)) {
            this.counters.homie = (this.counters.homie ?? 0) + 1;
            if (this.counters.homie === 8) {
                this.counters.homie = 0;
                this.heal(this.maxHp * (2 + this.inventory.level('homie-check')) * .01);
                this.timers.homie = this.time + 6;
            }
        }
        if (this.inventory.level('six-to-seven') && this.time >= (this.timers.six ?? 0)) {
            this.counters.six = (this.counters.six ?? 0) + 1;
            if (this.counters.six === 7) {
                this.counters.six = 0;
                this.timers.six = this.time + 2;
                this.addArea({ x: e.x, y: e.y, radius: 90 * this.areaScale, damage: this.power * (.35 + .15 * (this.inventory.level('six-to-seven') - 1)), label: 'SEVEN!' });
            }
        }
    }
    kill(e: Enemy) {
        if (!this.enemies.includes(e))
            return;
        this.enemies = this.enemies.filter(x => x.id !== e.id);
        this.kills++;
        if (e.kind === 'boss') {
            this.bossDefeated = true;
            this.mode = 'won';
            return;
        }
        if (e.kind === 'terminal') {
            this.counters.terminals = (this.counters.terminals ?? 0) + 1;
            if (this.counters.terminals % 2 === 0)
                this.timers.terminalsInterrupt = this.time + 4;
            return;
        }
        if (ENEMIES[e.kind].boss) {
            this.eventsDefeated.push(e.kind);
            if (!this.activeFlex)
                this.aura = Math.min(100, this.aura + 10);
            this.announce(ENEMIES[e.kind].name + ' defeated');
        }
        if (!this.counters['add:' + e.id])
            this.drops.push({ x: e.x, y: e.y, id: this.nextId++, xp: e.elite ? 60 : ENEMIES[e.kind].xp });
        if (e.kind === 'hype-bot' && this.boss)
            this.timers.bossExposed = this.time + 3;
        if (e.kind === 'copium-puffer')
            this.addArea({ x: e.x, y: e.y, radius: 80, damage: 12, hostile: true, at: this.time + 1, end: this.time + 4, nextTick: this.time + 1, label: 'COPIUM', source: e.id });
    }
    hurt(raw: number, source: Enemy | undefined, contact = false, hazard = false) {
        if (this.mode !== 'playing' || this.hp <= 0 || raw <= 0)
            return;
        if (contact && this.time - this.lastContact < .25)
            return;
        if (this.activeFlex && this.characterId === 'cool-kid' && source && !ENEMIES[source.kind].boss && !hazard)
            return;
        let mitigation = 1 - (1 - this.hero.resistance) * (1 - .03 * this.inventory.level('thick-skin'));
        mitigation = Math.min(.6, mitigation);
        let damage = raw * (1 - mitigation);
        if (source?.weakenUntil && source.weakenUntil > this.time)
            damage *= 1 - source.weaken;
        if (this.activeFlex && this.characterId === 'cool-kid' && source && ENEMIES[source.kind].boss && !hazard)
            damage *= .5;
        if (contact)
            this.lastContact = this.time;
        for (const s of Object.values(this.shields)) {
            if (s.until <= this.time)
                continue;
            const block = Math.min(damage, s.amount);
            damage -= block;
            s.amount -= block;
            this.protection += block;
        }
        const before = this.hp;
        this.hp = Math.max(0, this.hp - damage);
        this.damageTaken += damage;
        this.timers.hurtUntil = this.time + .18;
        if (this.characterId === 'alpha' && this.time >= (this.timers.certified ?? 0) && source) {
            this.counters.certified = 1;
            this.timers.certified = this.time + 4;
        }
        if (this.hp <= 0) {
            this.mode = 'lost';
            return;
        }
        if (this.inventory.level('so-back') && before >= this.maxHp * .3 && this.hp < this.maxHp * .3 && this.time >= (this.timers.soBack ?? 0)) {
            this.addShield('so-back', this.maxHp * .1, 3);
            this.timers.soBack = this.time + 45;
            this.counters.healTicks = 5;
            this.timers.healTick = this.time + 1;
        }
        if (this.inventory.level('too-sigma') && before >= this.maxHp * .25 && this.hp < this.maxHp * .25 && this.time >= (this.timers.tooSigma ?? 0)) {
            this.addShield('too-sigma', this.maxHp * .25, 5);
            this.timers.tooSigma = this.time + 60;
        }
    }
    update(dt: number, input: Input = { x: 0, y: 0 }) {
        if (this.mode !== 'playing')
            return;
        // Small deterministic steps prevent tunnelling and preserve timer boundaries after a slow frame.
        let left = Math.max(0, Math.min(dt, .25));
        while (left > 1e-8 && this.mode === 'playing') {
            const step = Math.min(left, 1 / 60);
            this.step(step, input);
            left -= step;
        }
    }
    private step(dt: number, input: Input) {
        this.time += dt;
        if (input.flex)
            this.activateFlex();
        this.moving = Math.hypot(input.x, input.y) > .05;
        if (this.moving) {
            this.movementFacing = Math.atan2(input.y, input.x);
            if (!this.movedSince)
                this.movedSince = this.time;
            this.stoppedSince = 0;
        }
        else {
            if (!this.stoppedSince)
                this.stoppedSince = this.time;
            if (this.time - this.stoppedSince >= 1)
                this.movedSince = 0;
        }
        const speed = this.hero.speed * (1 + Math.min(.6, .05 * this.inventory.level('caught-4k'))) * (this.activeFlex && this.characterId === 'cool-kid' ? 1.25 : 1);
        const length = Math.max(1, Math.hypot(input.x, input.y));
        this.pos = move(this.pos, input.x / length * speed * dt, input.y / length * speed * dt);
        const target = this.target();
        if (input.manual && input.aim)
            this.facing = direction(this.pos, input.aim);
        else if (target)
            this.facing = direction(this.pos, target);
        else if (this.moving)
            this.facing = Math.atan2(input.y, input.x);
        if (target) {
            if (this.lockTarget !== target.id) {
                this.lockTarget = target.id;
                this.lockSince = this.time;
            }
            this.lockLost = this.time;
        }
        else if (this.time - this.lockLost > 1) {
            this.lockTarget = 0;
            this.lockSince = this.time;
        }
        if (this.activeFlex && this.characterId === 'sigma' && !this.enemies.some(e => e.id === this.flexTarget))
            this.flexTarget = this.target(600)?.id ?? 0;
        if (!this.activeFlex)
            this.aura = Math.min(100, this.aura + .5 * dt);
        this.timeline();
        if (this.mode !== 'playing')
            return;
        this.periodic();
        this.flexDamage();
        updateWeapons(this, input);
        updateEnemies(this, dt);
        this.resolveShots(dt);
        this.resolveAreas();
        for (const drop of [...this.drops])
            if (distance(drop, this.pos) < 38) {
                this.drops = this.drops.filter(d => d.id !== drop.id);
                this.gainXp(drop.xp);
            }
        this.effects = this.effects.filter(e => e.until > this.time);
        this.openPending();
    }
    private timeline() {
        const newWave = Math.min(5, Math.floor(this.time / 180) + 1);
        while (this.wave < newWave) {
            this.wave++;
            this.gainXp([80, 120, 160, 200][this.wave - 2]);
            this.announce(WAVES[this.wave - 1].name.toUpperCase());
            if (this.wave === 4)
                this.openLegendary();
            if (this.wave === 5 && !this.inventory.legendarySpent) {
                this.legendaryReminder = true;
                this.openLegendary();
            }
        }
        while (this.eventIndex < EVENTS.length && this.time >= EVENTS[this.eventIndex].at) {
            const event = EVENTS[this.eventIndex++];
            if (this.time < BOSS_START) {
                this.spawn(event.kind);
                this.announce(ENEMIES[event.kind].name.toUpperCase());
            }
        }
        if (this.time >= 870 && !this.counters.finalWarning) {
            this.counters.finalWarning = 1;
            this.announce('BIG HATER ARRIVES IN 30s', 6);
        }
        if (this.time >= BOSS_START && !this.counters.bossSpawned) {
            this.counters.bossSpawned = 1;
            for (const drop of this.drops)
                this.gainXp(drop.xp);
            this.drops = [];
            this.enemies = [];
            this.shots = [];
            this.areas = [];
            this.spawn('boss', { x: 724, y: 445 });
            this.announce('BIG HATER — 3:00 TO BERSERK', 6);
        }
        if (this.boss) {
            for (const seconds of [60, 30, 10, 0]) {
                const key = 'enrage' + seconds;
                if (this.time >= 1080 - seconds && !this.counters[key]) {
                    this.counters[key] = 1;
                    this.announce(seconds ? `BERSERK IN ${seconds}s` : 'FULL HATER MODE', 5);
                }
            }
            if (this.time >= 1200 && !this.counters.lastStand) {
                this.counters.lastStand = 1;
                this.announce('LAST STAND — KEEP FIGHTING', 5);
            }
            return;
        }
        if (this.time >= this.nextSpawn && this.time < BOSS_START) {
            const wave = WAVES[this.wave - 1];
            this.nextSpawn = this.time + 1 / (.8 * wave.density * (1 + .1 * (this.time % 180) / 180));
            if (this.enemies.length < 100) {
                const pool = (Object.keys(ENEMIES) as EnemyKind[]).filter(k => !ENEMIES[k].boss && k !== 'terminal' && ENEMIES[k].wave <= this.wave && (k !== 'hater' || this.time >= 90));
                this.spawn(pool[Math.floor(this.random() * pool.length)], undefined, this.wave >= 3 && this.enemies.filter(e => e.elite).length < 2 && this.random() < .07);
            }
        }
    }
    private periodic() {
        const combat = this.enemies.some(e => e.born <= this.time);
        if (this.inventory.level('w-wifi') && combat && this.time >= this.timers['w-wifi']) {
            this.timers['w-wifi'] = this.time + 12;
            this.timers.wifiUntil = this.time + 4;
            this.timers.wifiX = this.pos.x;
            this.timers.wifiY = this.pos.y;
        }
        if (this.inventory.level('big-chad') && combat && this.time >= this.timers['big-chad']) {
            this.timers['big-chad'] = this.time + 10;
            this.addShield('big-chad', this.maxHp * (.05 + .02 * (this.inventory.level('big-chad') - 1)), 4);
        }
        if (this.inventory.level('no-u') && combat && this.time >= this.timers['no-u']) {
            this.timers['no-u'] = this.time + 15;
            for (const e of [...this.enemies])
                if (distance(e, this.pos) <= 200) {
                    this.hitEnemy(e, .3 * this.power);
                    e.weaken = ENEMIES[e.kind].boss ? .1 : .2;
                    e.weakenUntil = this.time + (ENEMIES[e.kind].boss ? 2 : 4);
                }
            this.effect('attack', this.pos, 'NO U', 200);
        }
        if (this.counters.healTicks > 0 && this.time >= this.timers.healTick) {
            this.counters.healTicks--;
            this.timers.healTick += 1;
            this.heal(this.maxHp * (.1 + .05 * (this.inventory.level('so-back') - 1)) / 5);
        }
    }
    private flexDamage() {
        if (!this.activeFlex)
            return;
        if (this.characterId === 'alpha' && this.time >= this.timers.flexStart + 2 * this.counters.flexSlams && this.counters.flexSlams < 3) {
            this.counters.flexSlams++;
            this.addArea({ ...this.pos, radius: 150, damage: .4 * this.power, label: 'ALPHA HOLD' });
        }
        if (this.characterId === 'cool-kid')
            for (const e of [...this.enemies])
                if (distance(e, this.pos) <= e.radius + 26 && this.time >= (this.timers['rampage' + e.id] ?? 0)) {
                    this.timers['rampage' + e.id] = this.time + .5;
                    let amount = .35 * this.power;
                    if (ENEMIES[e.kind].boss) {
                        amount = Math.min(amount, Math.max(0, 3.5 * this.power - this.counters.flexBossDamage));
                        this.counters.flexBossDamage += amount;
                    }
                    this.hitEnemy(e, amount);
                }
    }
    private resolveShots(dt: number) {
        for (const shot of [...this.shots]) {
            const old = { x: shot.x, y: shot.y };
            shot.x += Math.cos(shot.angle) * shot.speed * dt;
            shot.y += Math.sin(shot.angle) * shot.speed * dt;
            shot.remaining -= shot.speed * dt;
            if (shot.remaining <= 0 || !clearLine(old, shot)) {
                this.shots = this.shots.filter(s => s.id !== shot.id);
                continue;
            }
            if (shot.hostile) {
                if (distance(shot, this.pos) <= 16 + shot.radius) {
                    this.hurt(shot.damage, this.enemies.find(e => e.id === shot.source));
                    this.shots = this.shots.filter(s => s.id !== shot.id);
                }
                continue;
            }
            for (const e of [...this.enemies])
                if (!shot.hit.includes(e.id) && e.born <= this.time && distance(shot, e) <= e.radius + shot.radius) {
                    shot.hit.push(e.id);
                    this.hitEnemy(e, shot.damage, shot.weapon, shot.activation, shot.primary);
                    if (shot.hit.length >= shot.pierce) {
                        this.shots = this.shots.filter(s => s.id !== shot.id);
                        break;
                    }
                }
        }
    }
    private inside(a: Area, p: Point, r = 0): boolean {
        const d = distance(a, p), angle = Math.abs(angleDelta(direction(a, p), a.angle));
        if (a.shape === 'cone')
            return d <= a.radius + r && angle <= a.arc / 2;
        if (a.shape === 'line') {
            const along = d * Math.cos(angle), side = d * Math.sin(angle);
            return along >= -r && along <= a.radius + r && Math.abs(side) <= a.width / 2 + r;
        }
        if (a.shape === 'ring') {
            const radius = 80 + 200 * Math.min(1, (this.time - a.at) / 1.5);
            return Math.abs(d - radius) <= 12.5 + r && angle > (a.gap ?? 70) * Math.PI / 360;
        }
        return d <= a.radius + r;
    }
    private resolveAreas() {
        for (const a of [...this.areas]) {
            if (this.time < a.at || this.time < a.nextTick)
                continue;
            if (a.hostile) {
                if (!a.hit.includes(-1) && this.inside(a, this.pos, 16) && clearLine(a, this.pos)) {
                    this.hurt(a.damage, this.enemies.find(e => e.id === a.source), false, a.end - a.at > 1.6);
                    a.hit.push(-1);
                }
                if (a.end - a.at > 1.6 && a.shape !== 'ring') {
                    a.nextTick = this.time + 1;
                    a.hit = [];
                }
            }
            else
                for (const e of [...this.enemies])
                    if (e.born <= this.time && !a.hit.includes(e.id) && this.inside(a, e, e.radius) && clearLine(a, e)) {
                        a.hit.push(e.id);
                        this.hitEnemy(e, a.damage, a.weapon, a.activation, a.primary);
                        if (a.weapon === 'ban-hammer') {
                            this.stagger(e, 15);
                            if (!ENEMIES[e.kind].boss) {
                                const dir = direction(this.pos, e);
                                Object.assign(e, move(e, Math.cos(dir) * 40, Math.sin(dir) * 40, e.radius));
                            }
                        }
                        if (a.weapon === 'touch-grass') {
                            const enhanced = a.label === 'GRASS LEGEND';
                            e.slow = Math.max(e.slowUntil > this.time ? e.slow : 0, enhanced ? .25 : .15);
                            e.slowUntil = this.time + (enhanced ? 2 : 1.5);
                        }
                        if (a.weapon === 'cope-shield') {
                            this.addShield('cope-shield', this.maxHp * .04, 2);
                            if (a.label === 'SHIELD LEGEND')
                                this.addShield('unbothered', this.maxHp * .05, 3);
                        }
                        if (a.weapon === 'personal-space') {
                            e.weaken = .08;
                            e.weakenUntil = this.time + 2;
                        }
                    }
        }
        this.areas = this.areas.filter(a => a.end > this.time);
    }
}
// Runtime guards for persisted hero choices; unreleased IDs remain preserved in the save.
export const isDemoHero = (value: unknown): value is DemoHero => HEROES.some(h => h.id === value);
export function choiceSummary(choice: Choice): string {
    if (!choice.item)
        return choice.kind === 'heal' ? 'Recover 8% HP' : 'Shield 8% HP for 6s';
    const item = choice.item, w = weaponById(item.id);
    return `${item.rarity.toUpperCase()} · ${item.level}/${CAPS[item.rarity]}${w ? ` · ${(w.interval * (1 - .05 * (item.level - 1))).toFixed(2)}s` : ''}`;
}
