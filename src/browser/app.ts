import Phaser from 'phaser';
import { CAPS, HEROES, WAVES, heroById, passiveById, weaponById, xpRequired, type DemoHero } from '../game/catalog/content';
import { ENEMIES } from '../game/catalog/enemies';
import { itemInterval, itemPower, type Choice, type Item } from '../game/simulation/inventory';
import { Run, choiceSummary, isDemoHero } from '../game/simulation/run';
import { WORLD } from '../game/simulation/world';
import { BrowserScene } from './scene';
import { AudioCues } from './audio';
import { readSave, writeSave, recordResult, type Save, type StorageLike } from './save';
const time = (seconds: number) => `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`;
const portrait = (id: DemoHero) => `/assets/cartoon/option-a-v1/characters/${id}.png`;
const itemName = (i: Item) => weaponById(i.id)?.name ?? passiveById(i.id)?.name ?? i.id;
export class BrowserApp {
    run?: Run;
    save: Save;
    readonly scene = new BrowserScene();
    readonly audio = new AudioCues();
    readonly game: Phaser.Game;
    private keys = new Set<string>();
    private touchDirection = { x: 0, y: 0 };
    private touchPointer: number | null = null;
    private aim = { x: 724, y: 500 };
    private manual = false;
    private selectedChoice = -1;
    private hudMarkup = '';
    private screen = '';
    private lastHud = 0;
    private runId = '';
    private recorded = false;
    private saveFailed = false;
    private notice = '';
    private modal = document.querySelector<HTMLElement>('#modal')!;
    private hud = document.querySelector<HTMLElement>('#hud')!;
    private storage: StorageLike;
    constructor() {
        try {
            this.storage = localStorage;
        }
        catch {
            this.storage = { getItem: () => null, setItem: () => { throw new Error('Storage disabled'); } };
        }
        this.save = readSave(this.storage);
        this.audio.enabled = this.save.settings.sound;
        this.scene.tick = dt => this.tick(dt);
        this.scene.onReady = () => { document.querySelector('#loading')?.remove(); this.alignHud(); this.render(true); };
        this.game = new Phaser.Game({ type: Phaser.AUTO, parent: 'game', width: WORLD.width, height: WORLD.height, backgroundColor: '#253449', render: { antialias: true }, scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH }, scene: [this.scene] });
        this.game.scale.on('resize', () => requestAnimationFrame(() => this.alignHud()));
        new ResizeObserver(() => this.alignHud()).observe(document.querySelector('#game')!);
        document.addEventListener('keydown', e => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLSelectElement)
                return;
            const key = e.key.toLowerCase();
            if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(key))
                e.preventDefault();
            if (this.run?.mode === 'playing' && !this.notice) this.keys.add(key);
            if (e.repeat)
                return;
            if (this.notice) {
                if (key === 'escape') {
                    this.notice = '';
                    this.render(true);
                }
                return;
            }
            if (key === 'escape' && this.run) {
                if (this.run.mode === 'paused')
                    this.run.resume();
                else
                    this.run.pause();
                this.render(true);
            }
            if (key === 'e' && this.run?.mode === 'playing' && this.run.activateFlex())
                this.audio.play('flex');
            if (key === 'a' && !this.run)
                return;
            if (key === 'm' && this.run?.mode === 'playing') {
                this.manual = !this.manual;
                this.render(true);
            }
            if (key === 'b' && this.run?.mode === 'playing') {
                this.run.pause();
                this.render(true);
            }
            if (this.run && ['upgrade', 'legendary'].includes(this.run.mode) && /^[1-6]$/.test(key))
                this.selectChoice(Number(key) - 1);
        });
        document.addEventListener('keyup', e => this.keys.delete(e.key.toLowerCase()));
        window.addEventListener('blur', () => { this.keys.clear(); this.run?.pause(); this.render(true); });
        document.addEventListener('visibilitychange', () => { if (document.hidden) {
            this.keys.clear();
            this.run?.pause();
            this.render(true);
        } });
        document.querySelector('#game')!.addEventListener('pointermove', event => {
            const e = event as PointerEvent, canvas = document.querySelector('canvas');
            if (!canvas)
                return;
            const b = canvas.getBoundingClientRect();
            this.aim = { x: (e.clientX - b.x) / b.width * WORLD.width, y: (e.clientY - b.y) / b.height * WORLD.height };
        });
        document.addEventListener('click', e => { const target = (e.target as HTMLElement).closest<HTMLElement>('[data-action]'); if (target)
            this.action(target.dataset.action!, target.dataset.value); });
        const zone = document.createElement('div');
        zone.id = 'touch-zone';
        zone.setAttribute('aria-label', 'Touch movement area');
        zone.innerHTML = '<div id="touch-joystick"><div class="touch-joystick-knob"></div></div>';
        document.querySelector('#app')!.append(zone);
        const joystick = zone.firstElementChild as HTMLElement;
        const knob = joystick.firstElementChild as HTMLElement;
        let origin = { x: 0, y: 0 };
        const resetTouch = () => {
            this.touchPointer = null;
            this.touchDirection = { x: 0, y: 0 };
            joystick.style.display = 'none';
            knob.style.transform = '';
        };
        const updateTouch = (event: PointerEvent) => {
            const radius = 44;
            const dx = event.clientX - origin.x, dy = event.clientY - origin.y;
            const distance = Math.hypot(dx, dy);
            const scale = Math.min(1, radius / (distance || 1));
            this.touchDirection = { x: dx * scale / radius, y: dy * scale / radius };
            knob.style.transform = `translate(${dx * scale}px, ${dy * scale}px)`;
        };
        zone.addEventListener('pointerdown', event => {
            if (this.touchPointer !== null || this.run?.mode !== 'playing') return;
            this.touchPointer = event.pointerId;
            origin = { x: event.clientX, y: event.clientY };
            const bounds = zone.getBoundingClientRect();
            joystick.style.left = `${event.clientX - bounds.left}px`;
            joystick.style.top = `${event.clientY - bounds.top}px`;
            joystick.style.display = 'flex';
            zone.setPointerCapture(event.pointerId);
            updateTouch(event);
            event.preventDefault();
        });
        zone.addEventListener('pointermove', event => {
            if (event.pointerId === this.touchPointer) updateTouch(event);
        });
        const release = (event: PointerEvent) => {
            if (event.pointerId === this.touchPointer) resetTouch();
        };
        zone.addEventListener('pointerup', release);
        zone.addEventListener('pointercancel', release);
        zone.addEventListener('lostpointercapture', release);
        window.addEventListener('blur', resetTouch);
        document.addEventListener('visibilitychange', () => { if (document.hidden) resetTouch(); });
        const orientationHint = document.createElement('div');
        orientationHint.id = 'orientation-hint';
        orientationHint.setAttribute('role', 'status');
        orientationHint.innerHTML = '<p>Rotate your phone for a better game view.</p><button type="button" data-action="fullscreen">TRY FULLSCREEN</button>';
        document.querySelector('#app')!.append(orientationHint);
        const updateOrientation = () => {
            const mobile = matchMedia('(pointer: coarse)').matches;
            const portrait = innerHeight > innerWidth;
            const spacious = innerWidth >= 850 && innerHeight >= 650;
            document.querySelector('#app')!.classList.toggle('needs-landscape', mobile && portrait && !spacious);
        };
        window.addEventListener('resize', updateOrientation);
        window.addEventListener('orientationchange', updateOrientation);
        updateOrientation();
        this.render(true);
    }
    private alignHud() {
        const canvas = this.game?.canvas;
        if (!canvas) return;
        const bounds = canvas.getBoundingClientRect();
        const stage = document.querySelector('#app')!.getBoundingClientRect();
        Object.assign(this.hud.style, {
            left: `${bounds.left - stage.left}px`, top: `${bounds.top - stage.top}px`,
            width: `${bounds.width}px`, height: `${bounds.height}px`, right: 'auto', bottom: 'auto',
        });
    }
    start(hero: DemoHero = this.save.selected) {
        this.audio.unlock();
        this.run = new Run(hero);
        this.scene.run = this.run;
        this.run.reduceMotion = this.save.settings.reducedMotion;
        this.runId = crypto.randomUUID();
        this.recorded = false;
        this.notice = '';
        this.selectedChoice = -1;
        this.keys.clear();
        this.save.selected = hero;
        this.persist();
        this.render(true);
    }
    private persist() { this.saveFailed = !writeSave(this.storage, this.save); }
    private action(action: string, value?: string) {
        if (this.notice && action !== 'cancel-exit' && action !== 'confirm-exit') return;
        if (action === 'hero' && isDemoHero(value)) {
            this.save.selected = value;
            this.persist();
            this.render(true);
        }
        if (action === 'start' && this.scene.ready) {
            this.start();
            if (matchMedia('(pointer: coarse)').matches && !document.fullscreenElement) this.action('fullscreen');
        }
        if (action === 'resume') {
            this.run?.resume();
            this.render(true);
        }
        if (action === 'pause') {
            this.run?.pause();
            this.render(true);
        }
        if (action === 'aim') {
            this.manual = !this.manual;
            this.render(true);
        }
        if (action === 'flex' && this.run?.activateFlex()) {
            this.audio.play('flex');
            this.render(true);
        }
        if (action === 'choice')
            this.selectChoice(Number(value));
        if (action === 'confirm') {
            const replace = document.querySelector<HTMLSelectElement>('#replace')?.value;
            if (this.run?.choose(this.selectedChoice, replace)) {
                this.selectedChoice = -1;
                this.audio.play('upgrade');
                this.render(true);
            }
        }
        if (action === 'defer') {
            this.run?.deferLegendary();
            this.selectedChoice = -1;
            this.render(true);
        }
        if (action === 'legendary') {
            this.run?.openLegendary();
            this.render(true);
        }
        if (action === 'retry')
            this.start(this.run?.characterId);
        if (action === 'home') {
            this.run = undefined;
            this.scene.run = undefined;
            this.keys.clear();
            this.render(true);
        }
        if (action === 'exit') {
            this.run?.pause();
            this.notice = 'exit';
            this.render(true);
        }
        if (action === 'cancel-exit') {
            this.notice = '';
            this.render(true);
        }
        if (action === 'confirm-exit') {
            this.notice = '';
            this.action('home');
        }
        if (action === 'sound') {
            this.save.settings.sound = !this.save.settings.sound;
            this.audio.enabled = this.save.settings.sound;
            this.audio.unlock();
            this.persist();
            this.render(true);
        }
        if (action === 'motion') {
            this.save.settings.reducedMotion = !this.save.settings.reducedMotion;
            if (this.run)
                this.run.reduceMotion = this.save.settings.reducedMotion;
            this.persist();
            this.render(true);
        }
        if (action === 'fullscreen') {
            const stage = document.querySelector<HTMLElement>('#app')!;
            if (document.fullscreenElement) {
                void document.exitFullscreen();
            } else {
                void stage.requestFullscreen().then(async () => {
                    try {
                        const orientation = screen.orientation as ScreenOrientation & { lock?: (mode: string) => Promise<void> };
                        await orientation.lock?.('landscape');
                    } catch { /* Unsupported or denied: rotation hint remains available. */ }
                }).catch(() => { /* Fullscreen requires browser permission. */ });
            }
        }
    }
    private selectChoice(index: number) { if (this.run && this.run.choices[index]) {
        this.selectedChoice = index;
        this.render(true);
    } }
    private tick(dt: number) {
        if (this.run) {
            const before = this.run.mode, previousMessage = this.run.message, wasBerserk = this.run.berserk;
            this.run.update(dt, { x: Math.max(-1, Math.min(1, Number(this.keys.has('d') || this.keys.has('arrowright')) - Number(this.keys.has('a') || this.keys.has('arrowleft')) + this.touchDirection.x)), y: Math.max(-1, Math.min(1, Number(this.keys.has('s') || this.keys.has('arrowdown')) - Number(this.keys.has('w') || this.keys.has('arrowup')) + this.touchDirection.y)), aim: this.aim, manual: this.manual });
            if (!wasBerserk && this.run.berserk) this.audio.play('berserk');
            else if (this.run.message !== previousMessage) this.audio.play('warning');
            if (this.run.mode !== before) {
                this.keys.clear();
                this.selectedChoice = -1;
                this.render(true);
            }
            if (['won', 'lost'].includes(this.run.mode) && !this.recorded) {
                this.recorded = true;
                this.save = recordResult(this.save, this.run, this.runId);
                this.persist();
                this.render(true);
            }
        }
        this.lastHud += dt;
        if (this.lastHud >= .1) {
            this.lastHud = 0;
            this.render();
        }
    }
    private render(force = false) {
        const r = this.run, screen = this.notice || r?.mode || 'home';
        document.querySelector('#app')!.setAttribute('data-screen', screen);
        if (r)
            this.renderHud(r);
        else {
            this.hud.innerHTML = '';
            this.hudMarkup = '';
        }
        if (!force && screen === this.screen)
            return;
        if (screen !== this.screen) { this.keys.clear(); this.touchDirection = { x: 0, y: 0 }; this.touchPointer = null; const knob = document.querySelector<HTMLElement>('.touch-joystick-knob'); if (knob) knob.style.transform = ''; const joystick = document.querySelector<HTMLElement>('#touch-joystick'); if (joystick) joystick.style.display = 'none'; }
        this.screen = screen;
        this.modal.hidden = screen === 'playing';
        if (screen === 'home')
            this.modal.innerHTML = this.home();
        else if (screen === 'exit')
            this.modal.innerHTML = `<section class="panel compact"><p class="eyebrow">LEAVE THIS RUN?</p><h2>Your build stays here.</h2><p>Completed results remain saved. This unfinished run will be lost.</p><div class="actions"><button data-action="cancel-exit">KEEP PLAYING</button><button class="secondary" data-action="confirm-exit">LEAVE RUN</button></div></section>`;
        else if (r && screen === 'paused')
            this.modal.innerHTML = `<section class="panel pause"><p class="eyebrow">CLOCK PAUSED · ${time(r.time)}</p><h2>Take a breather.</h2>${this.build(r)}<div class="settings"><button class="small secondary" data-action="sound">Sound: ${this.save.settings.sound ? 'ON' : 'OFF'}</button><button class="small secondary" data-action="motion">Reduced effects: ${this.save.settings.reducedMotion ? 'ON' : 'OFF'}</button></div><div class="actions"><button data-action="resume">BACK TO THE FARM</button><button class="secondary" data-action="exit">LEAVE RUN</button></div></section>`;
        else if (r && (screen === 'upgrade' || screen === 'legendary'))
            this.modal.innerHTML = this.offers(r);
        else if (r && (screen === 'won' || screen === 'lost'))
            this.modal.innerHTML = `<section class="panel results"><p class="eyebrow">${screen === 'won' ? 'BIG HATER DEFEATED' : 'THE FEED GOT YOU'}</p><h2>${screen === 'won' ? 'Absolute cinema.' : 'Run it back.'}</h2><img class="result-hero" src="${portrait(r.characterId)}" alt="${r.hero.name}"><p>${r.hero.name} · ${time(r.time)} · Wave ${r.wave} · Level ${r.level}</p><div class="stats"><span><b>${r.kills}</b>RIVALS</span><span><b>${r.xpCollected}</b>XP COLLECTED</span><span><b>${r.flexCount}</b>FLEXES</span><span><b>${Math.round(r.healing + r.protection)}</b>HEAL / SHIELD</span></div><p class="save-note">${this.saveFailed ? 'Saving unavailable — progress is temporary.' : 'Result saved on this device. Run equipment resets.'}</p><div class="actions"><button data-action="retry">ONE MORE RUN</button><button class="secondary" data-action="home">HOME</button></div></section>`;
        if (force && screen !== 'playing') {
            const focusTarget = this.modal.querySelector<HTMLElement>('[aria-pressed="true"],button:not(:disabled)');
            requestAnimationFrame(() => { if (this.modal.contains(focusTarget)) focusTarget?.focus({ preventScroll: true }); });
        }
    }
    private home() { const selected = heroById(this.save.selected); return `<section class="panel home"><div class="home-copy"><p class="eyebrow">RUIN ALLEY · SOLO BROWSER DEMO</p><h1>AURA<br><em>FARMER</em></h1><h2>Grow your legend.</h2><p>Fifteen minutes. Five waves.<br>One very big hater.</p><div class="run-contract"><span>3 WEAPONS</span><span>5 PASSIVES</span><span>YOUR OWN FLEX</span></div><p class="local-progress">${this.save.runs} runs · ${this.save.wins} wins · ${this.save.xp} lifetime XP</p></div><div class="hero-select"><p class="eyebrow">CHOOSE YOUR ENERGY</p><div class="heroes">${HEROES.map(h => `<button class="hero-card ${h.id === selected.id ? 'selected' : ''}" data-action="hero" data-value="${h.id}" aria-pressed="${h.id === selected.id}"><img src="${portrait(h.id)}" alt="${h.name}"><strong>${h.name}</strong><small>${h.role.toUpperCase()}</small></button>`).join('')}</div><h3>${selected.flex}</h3><p class="hero-description">${selected.description}</p><button class="start" data-action="start" ${this.scene.ready ? '' : 'disabled'}>ENTER RUIN ALLEY <span>→</span></button><p class="controls">WASD / arrows to move · E to FLEX<br>M toggles auto / mouse aim · Esc pauses</p></div><footer><span>${this.saveFailed ? 'Storage unavailable — temporary progress' : 'Local save · No login · No purchases'}</span><div><button class="small secondary" data-action="sound">Sound ${this.save.settings.sound ? 'ON' : 'OFF'}</button><button class="small secondary" data-action="motion">Effects ${this.save.settings.reducedMotion ? 'LOW' : 'FULL'}</button><button class="small secondary" data-action="fullscreen">FULLSCREEN</button></div></footer></section>`; }
    private renderHud(r: Run) {
        const boss = r.boss, event = r.enemies.find(e => ENEMIES[e.kind].boss), ready = r.aura >= 100 && !r.activeFlex && r.time >= r.flexCooldown;
        const markup = `<div class="hud-top" aria-label="Combat status"><div class="meter hp"><span>${r.hero.name} <b>${Math.ceil(r.hp)} / ${Math.ceil(r.maxHp)}${r.shield ? ' +' + Math.ceil(r.shield) : ''}</b></span><progress max="${r.maxHp}" value="${r.hp}"></progress></div><div class="meter xp"><span>LEVEL ${r.level}<b>${Math.floor(r.xp)} / ${xpRequired(r.level)} XP</b></span><progress max="${xpRequired(r.level)}" value="${r.xp}"></progress></div><div class="wave"><b>${time(r.time)}</b><span>${boss ? 'FINAL BOSS' : `WAVE ${r.wave} · ${WAVES[r.wave - 1].name.toUpperCase()}`}</span></div><button class="small secondary" data-action="pause">Ⅱ MENU</button></div>${event ? `<div class="boss-meter"><span>${ENEMIES[event.kind].name.toUpperCase()} <b>${boss ? r.berserk ? 'FULL HATER MODE · REGEN + RESISTANCE' : 'BERSERK IN ' + time(Math.max(0, 1080 - r.time)) : Math.ceil(event.hp) + ' HP'}</b></span><progress max="${event.maxHp}" value="${event.hp}"></progress>${boss ? `<small>STAGGER ${Math.floor(boss.stagger)}/100${boss.staggerUntil > r.time ? ' · EXPOSED' : ''}</small>` : ''}</div>` : ''}<div class="announcement" role="status" aria-live="polite">${r.time < r.messageUntil ? r.message : ''}</div><div class="hud-bottom" aria-label="Combat actions"><button class="build-chip secondary" data-action="pause">${r.inventory.weapons.length}/3 WEAPONS · ${r.inventory.passives.length}/5 PASSIVES <small>BUILD [B]</small></button><button class="flex ${ready ? 'ready' : ''}" data-action="flex" aria-keyshortcuts="E" aria-label="${ready ? 'Activate ' + r.hero.flex : r.activeFlex ? 'Flex active' : 'Flex charging'}" ${ready ? '' : 'disabled'}><span>${r.activeFlex ? 'FLEX ACTIVE' : ready ? 'FLEX READY [E]' : 'FARM AURA'}</span><strong>${r.hero.flex}</strong><progress max="100" value="${Math.floor(r.aura)}"></progress><small>${r.activeFlex ? time(r.flexUntil - r.time) : Math.floor(r.aura) + '/100 AURA'}</small></button><div class="hud-right"><button class="small secondary" data-action="aim">${this.manual ? 'MOUSE AIM' : 'AUTO AIM'} [M]</button>${r.time >= 540 && r.time < 895 && !r.inventory.legendarySpent ? '<button class="small legendary-button" data-action="legendary">CHOOSE LEGENDARY</button>' : ''}<span>${r.kills} RIVALS DOWN</span></div></div>`;
        if (this.hudMarkup !== markup) {
            this.hudMarkup = markup;
            this.hud.innerHTML = markup;
        }
    }
    private build(r: Run) {
        const equipment = (items: Item[], kind: 'weapon' | 'passive', limit: number) => {
            const slots = Array.from({ length: limit }, (_, slot) => {
                const item = items[slot];
                return item
                    ? `<li class="equipment-slot ${item.rarity}"><span class="slot-number">${slot + 1}</span><div><strong>${itemName(item)}</strong><small>${item.rarity.toUpperCase()} · LV ${item.level}/${CAPS[item.rarity]}${kind === 'weapon' ? ' · ' + itemInterval(item, r.frequency).toFixed(2) + 's' : ''}</small></div></li>`
                    : `<li class="equipment-slot empty"><span class="slot-number">${slot + 1}</span><div><strong>Empty slot</strong><small>Choose a ${kind} on level up</small></div></li>`;
            }).join('');
            return `<section class="equipment-group" aria-label="${kind === 'weapon' ? 'Equipped weapons' : 'Equipped passives'}"><h3>${kind === 'weapon' ? 'WEAPONS' : 'PASSIVES'} <span>${items.length}/${limit} SLOTS</span></h3><ol class="equipment-slots">${slots}</ol></section>`;
        };
        return `<div class="build">${equipment(r.inventory.weapons, 'weapon', 3)}${equipment(r.inventory.passives, 'passive', 5)}</div>`;
    }
    private card(offer: Choice, index: number) {
        const item = offer.item, def = item ? (weaponById(item.id) ?? passiveById(item.id)) : undefined;
        const old = item ? (this.run!.inventory.weapons.find(i => i.id === item.id) ?? this.run!.inventory.passives.find(i => i.id === item.id)) : undefined;
        let comparison = old ? `LV ${old.level} ${old.rarity} → LV ${item!.level} ${item!.rarity}` : offer.action === 'replace' ? 'Choose which slot to replace' : 'Uses one ' + offer.kind + ' slot';
        if (item && weaponById(item.id)) {
            const damage = (i: Item) => Math.round(weaponById(i.id)!.damage * this.run!.power * itemPower(i));
            comparison += `<br>${old ? damage(old) + ' → ' : ''}${damage(item)} base damage · ${old ? itemInterval(old, this.run!.frequency).toFixed(2) + ' → ' : ''}${itemInterval(item, this.run!.frequency).toFixed(2)}s`;
        }
        return `<button class="choice ${item?.rarity ?? 'common'} ${this.selectedChoice === index ? 'selected' : ''}" data-action="choice" data-value="${index}" aria-pressed="${this.selectedChoice === index}"><span class="choice-top">${index + 1} · ${offer.action.toUpperCase()} <span>${offer.kind.toUpperCase()}</span></span><span class="icon">${def?.icon ?? '♥'}</span><h3>${item?.rarity === 'legendary' && weaponById(item.id) ? weaponById(item.id)!.legendary : def?.name ?? 'Catch your breath'}</h3><p>${def?.description ?? choiceSummary(offer)}</p><small>${choiceSummary(offer)}</small><span class="comparison">${item ? comparison : 'No slot used'}</span></button>`;
    }
    private offers(r: Run) {
        const legendary = r.mode === 'legendary', choice = r.choices[this.selectedChoice];
        let replacement = '';
        if (choice?.item) {
            const list = choice.kind === 'weapon' ? r.inventory.weapons : r.inventory.passives, full = list.length === (choice.kind === 'weapon' ? 3 : 5), equipped = list.some(i => i.id === choice.item!.id);
            if (full && !equipped)
                replacement = `<label class="replacement">Replace <select id="replace">${list.map(i => `<option value="${i.id}">${itemName(i)} · ${i.rarity} LV ${i.level}</option>`).join('')}</select><span>The selected item is removed. This cannot be undone.</span></label>`;
        }
        return `<section class="panel upgrades ${legendary ? 'legendary-offer' : ''}"><header><p class="eyebrow">${legendary ? 'ONE LEGENDARY PER RUN' : 'LEVEL ' + r.level + ' · ' + r.pending + ' CHOICE' + (r.pending === 1 ? '' : 'S') + ' PENDING'}</p><h2>${legendary ? 'Make it legendary.' : 'Pick your next move.'}</h2><p>${legendary ? 'Three buffs. Three weapons. One decision.' : 'Clock paused. Only gear compatible with your type.'}</p></header><div class="choices">${r.choices.map((c, i) => this.card(c, i)).join('')}</div><div class="offer-footer">${replacement}<div class="actions"><button data-action="confirm" ${choice ? '' : 'disabled'}>${replacement ? 'REPLACE & EQUIP' : 'CONFIRM CHOICE'}</button>${legendary ? '<button class="secondary" data-action="defer">DECIDE LATER</button>' : ''}</div>${legendary ? '<small>The same offer returns at 12:00. Available until 14:55. No rerolls.</small>' : ''}</div></section>`;
    }
}
