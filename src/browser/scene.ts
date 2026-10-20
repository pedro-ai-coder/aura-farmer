import Phaser from 'phaser';
import heroFrames from './hero-frames.json';
import flexFrames from './hero-flex-frames.json';
import rearFrames from './hero-rear-frames.json';
import enemyAnimationFrames from './enemy-frames.json';
import { EnemyAnimator } from './enemy-animation';
import { installEnemyTextures } from './enemy-textures';
import { enemyTelegraph } from './enemy-telegraph';
import { HeroAnimator } from './hero-animation';
import { HeroMotionAnimator } from './hero-motion';
import { RenderFrameMeter } from './render-frame-meter';
import { heroFrameTexture, installHeroFrameMattes } from './hero-frame-mattes';
import { drawWeaponProjectile, drawWeaponAreaAccent, drawSpecialDrop, drawHeroProtection } from './combat-vfx';
import { HEROES } from '../game/catalog/content';
import { ENEMIES } from '../game/catalog/enemies';
import { COVER, WORLD } from '../game/simulation/world';
import { drawCoverContacts, actorContactTexture } from './environment-vfx';
import { inRenderView, areaInRenderView } from './scene-visibility';
import type { Run } from '../game/simulation/run';
import type { Area } from '../game/simulation/types';
const ROOT = '/assets/cartoon/option-a-v1/';
/** Rendering consumes state only; visual animation never advances gameplay or RNG. */
export class BrowserScene extends Phaser.Scene {
    run?: Run;
    tick?: (dt: number) => void;
    onReady?: () => void;
    private actors = new Map<number, Phaser.GameObjects.Image>();
    private actorShadows = new Map<number, { image: Phaser.GameObjects.Image; radius: number }>();
    private heroShadow!: Phaser.GameObjects.Image;
    private stationBase!: Phaser.GameObjects.Graphics;
    private stationCache?: { run: Run; ready: boolean; x: number; y: number };
    private idleCleared = false;
    private visibleActorIds = new Set<number>();
    private frameMeter?: RenderFrameMeter;
    private heroAnimator = new HeroAnimator();
    private heroMotionAnimator = new HeroMotionAnimator();
    private enemyAnimator = new EnemyAnimator();
    private heroImage!: Phaser.GameObjects.Image;
    private ground!: Phaser.GameObjects.Graphics;
    private fx!: Phaser.GameObjects.Graphics;
    private labels: Phaser.GameObjects.Text[] = [];
    ready = false;
    constructor() { super('browser'); }
    preload() {
        this.load.image('ruin', ROOT + 'maps/ruin-alley.png');
        for (const hero of HEROES) {
            this.load.image(hero.id, ROOT + `characters/${hero.id}.png`);
            this.load.image(hero.id + '-atlas', `/assets/runtime/${hero.id}-atlas.png`);
            if (hero.id !== 'sigma') this.load.image(hero.id + '-rear-v2', `/assets/runtime/${hero.id}-rear-v2.png`);
        }
        this.load.image('cool-kid-flex-v2', '/assets/runtime/cool-kid-flex-v2.png');
        this.load.image('npc', ROOT + 'enemies/phone-guy.png');
        this.load.image('hater', ROOT + 'enemies/hater.png');
        this.load.image('boss', ROOT + 'enemies/big-hater.png');
        this.load.image('enemy-atlas', '/assets/runtime/enemies.png');
        for (const sheet of new Set(Object.values(enemyAnimationFrames).map(d => d.source)))
            this.load.image(sheet, `/assets/runtime/${sheet}.png`);
        this.load.on('progress', (p: number) => { const el = document.querySelector<HTMLProgressElement>('#loading-progress'); if (el)
            el.value = p; });
        this.load.on('loaderror', () => { const el = document.querySelector('#loading-text'); if (el)
            el.textContent = 'An asset failed to load. Refresh to retry.'; });
    }
    create() {
        this.add.image(0, 0, 'ruin').setOrigin(0).setDisplaySize(WORLD.width, WORLD.height).setDepth(-10);
        for (const hero of HEROES) {
            const texture = this.textures.get(hero.id + '-atlas');
            // Explicit bounds: generated sheets are not uniform grids.
            heroFrames[hero.id].forEach(([x, y, width, height], frame) => {
                texture.add(frame, 0, x, y, width, height);
            });
        }
        for (const id of ['alpha', 'cool-kid'] as const) {
            const texture = this.textures.get(id + '-rear-v2');
            rearFrames[id].forEach(([x, y, w, h], i) => texture.add(i, 0, x, y, w, h));
        }
        flexFrames.forEach(([x, y, w, h], i) => this.textures.get('cool-kid-flex-v2').add(i, 0, x, y, w, h));
        // Remove stray pixels from seven overlapping approved atlas rectangles,
        // without altering master PNGs or the size/pivot of any runtime frame.
        installHeroFrameMattes(this.textures);
        const texture = this.textures.get('enemy-atlas'), source = texture.getSourceImage() as HTMLImageElement;
        for (let row = 0; row < 4; row++)
            for (let col = 0; col < 4; col++)
                texture.add(row * 4 + col, 0, Math.round(col * source.width / 4), Math.round(row * source.height / 4), Math.floor(source.width / 4), Math.floor(source.height / 4));
        installEnemyTextures(this.textures);
        // A cached layer below actors, grounded precisely at the two real
        // cover collision centers. Static artwork never obstructs play.
        const environment = this.add.graphics().setName('alley-cover-contact').setDepth(-5);
        drawCoverContacts(environment);
        for (const cover of COVER)
            this.add.image(cover.x, cover.y, 'enemy-atlas', 14).setDisplaySize(80, 80).setOrigin(.5, .85).setDepth(cover.y);
        this.ground = this.add.graphics().setDepth(0);
        // Safe Spot base and actor contacts are cached, not rebuilt by Graphics
        // for every frame. Depth .1 keeps visual feet below all hero/enemy art.
        this.stationBase = this.add.graphics().setDepth(-1);
        const contact = actorContactTexture(this.textures, 20);
        this.heroShadow = this.add.image(724, 610, contact.key)
            .setName('hero-contact').setOrigin(contact.originX, contact.originY)
            .setDepth(.1).setVisible(false);
        this.fx = this.add.graphics().setDepth(2000);
        this.heroImage = this.add.image(724, 610, 'sigma').setName('hero').setOrigin(.5, .9).setDisplaySize(90, 75);
        for (let i = 0; i < 24; i++)
            this.labels.push(this.add.text(0, 0, '', { fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#fff7da', stroke: '#253449', strokeThickness: 4 }).setDepth(2200).setOrigin(.5));
        // Opt-in diagnostic on the PR preview: no overlay or sampling cost in regular play.
        if (new URLSearchParams(window.location.search).has('fps'))
            this.frameMeter = new RenderFrameMeter();
        this.ready = true;
        this.onReady?.();
    }
    update(_time: number, delta: number) {
        // Instrument only on explicit ?fps=1. Avoid performance.now calls and
        // extra allocations when diagnostics are disabled.
        const meter = this.frameMeter;
        const started = meter ? performance.now() : 0;
        this.tick?.(Math.min(delta / 1000, .1));
        const afterSimulation = meter ? performance.now() : 0;
        if (this.run) {
            this.idleCleared = false;
            this.draw(this.run, delta / 1000);
        } else if (!this.idleCleared) {
            // Menus should not rebuild an empty Graphics buffer every RAF.
            this.idleCleared = true;
            this.stationBase.setVisible(false);
            this.heroShadow.setVisible(false);
            this.heroImage?.setVisible(false);
            this.ground?.clear();
            this.fx?.clear();
            for (const image of this.actors.values())
                image.destroy();
            this.actors.clear();
            for (const shadow of this.actorShadows.values()) shadow.image.destroy();
            this.actorShadows.clear();
            this.enemyAnimator.reset();
            for (const label of this.labels)
                label.setVisible(false);
        }
        if (meter) {
            const run = this.run;
            meter.sample(started, afterSimulation - started,
                performance.now() - afterSimulation, {
                    enemies: run?.enemies.length ?? 0,
                    shots: run?.shots.length ?? 0,
                    areas: run?.areas.length ?? 0,
                    drops: run?.drops.length ?? 0,
                    effects: run?.effects.length ?? 0,
                });
        }
    }
    private draw(r: Run, delta: number) {
        const g = this.ground, f = this.fx;
        g.clear();
        f.clear();
        // Healing station indicator is a world-space object, not a HUD overlay.
        const station = r.safeSpot;
        const cooldown = Math.max(0, r.safeSpotReadyAt - r.time);
        const ready = cooldown <= 0;
        const stationBase = this.stationBase;
        const cached = this.stationCache;
        if (!cached || cached.run !== r || cached.ready !== ready ||
            cached.x !== station.x || cached.y !== station.y) {
            stationBase.clear();
            this.stationCache = { run: r, ready, x: station.x, y: station.y };
            stationBase.fillStyle(ready ? 0x3fe2ad : 0x465b73, .19);
            stationBase.fillCircle(station.x, station.y, station.radius);
            stationBase.lineStyle(4, ready ? 0x5cf0b4 : 0x8394aa, .9);
            stationBase.strokeCircle(station.x, station.y, station.radius);
            stationBase.fillStyle(0x24364a, .95);
            stationBase.fillRoundedRect(station.x - 43, station.y - 26, 86, 52, 10);
            stationBase.lineStyle(3, ready ? 0x5cf0b4 : 0x8394aa, 1);
            stationBase.strokeRoundedRect(station.x - 43, station.y - 26, 86, 52, 10);
            stationBase.fillStyle(ready ? 0x5cf0b4 : 0x9ba9b7);
            stationBase.fillRect(station.x - 5, station.y - 16, 10, 32);
            stationBase.fillRect(station.x - 16, station.y - 5, 32, 10);
        }
        stationBase.setVisible(true);
        if (ready && r.safeSpotCharge > 0) {
            g.lineStyle(5, 0xffd06e, 1);
            g.beginPath();
            g.arc(station.x, station.y, 52, -Math.PI / 2, -Math.PI / 2 + Math.PI * r.safeSpotCharge);
            g.strokePath();
        }
        if (!ready) {
            g.lineStyle(5, 0xffd06e, .95);
            g.beginPath();
            g.arc(station.x, station.y, 52, -Math.PI / 2, -Math.PI / 2 + 2 * Math.PI * (1 - cooldown / 90));
            g.strokePath();
        }
        // Drawing only: world-space camera view never changes the simulation.
        const view = this.cameras.main.worldView;
        // Keep edge-intersecting danger cues even if their centers are outside.
        for (const a of r.areas) {
            if (!areaInRenderView(view, a)) continue;
            this.drawArea(a, r, g);
            if (!a.hostile) drawWeaponAreaAccent(g, a, r.reduceMotion);
        }
        const enemyPoses = this.enemyAnimator.sample(r, delta);
        // Reuse the same ID set instead of allocating one every rendered frame.
        const visible = this.visibleActorIds;
        visible.clear();
        for (const pose of enemyPoses) visible.add(pose.enemy.id);
        for (const [id, image] of this.actors) if (!visible.has(id)) {
            image.destroy(); this.actors.delete(id);
            const shadow = this.actorShadows.get(id);
            if (shadow) { shadow.image.destroy(); this.actorShadows.delete(id); }
        }
        for (const e of r.enemies) if (e.born > r.time &&
            inRenderView(view, e.x, e.y, 32)) {
            g.lineStyle(3, 0xe57461, .9); g.strokeCircle(e.x, e.y, 26);
            g.lineBetween(e.x - 12, e.y - 12, e.x + 12, e.y + 12);
        }
        for (const p of enemyPoses) {
            const e = p.enemy;
            // Include the full sprite, HP bar, shield and locked telegraph.
            const visibleHere = inRenderView(view, e.x, e.y, e.radius * 3.5 + 48);
            let image = this.actors.get(e.id);
            if (!visibleHere) {
                image?.setVisible(false);
                this.actorShadows.get(e.id)?.image.setVisible(false);
                continue;
            }
            if (!image) {
                image = this.add.image(e.x, e.y, p.sheet, p.frame).setName(`enemy-${e.id}`);
                this.actors.set(e.id, image);
            }
            image.setVisible(true);
            // Rebinding the same texture/frame for every enemy on every RAF
            // is unnecessary; only do it when the authored pose changes.
            if (image.texture.key !== p.sheet || String(image.frame.name) !== String(p.frame))
                image.setTexture(p.sheet, p.frame);
            image.setPosition(e.x, e.y).setOrigin(p.originX, p.originY)
                .setScale(e.kind === 'terminal' ? e.radius * 3.1 / image.frame.height : p.scale).setFlipX(p.flip).setDepth(e.y).setAlpha(p.alpha);
            if (image.getData('pose') !== p.state) image.setData('pose', p.state);
            // Contact ellipse is a cached texture, not two Graphics polygons
            // re-tessellated for every living enemy on every frame.
            let contact = this.actorShadows.get(e.id);
            if (!contact || contact.radius !== e.radius) {
                contact?.image.destroy();
                const spec = actorContactTexture(this.textures, e.radius);
                const shadow = this.add.image(e.x, e.y, spec.key)
                    .setName(`contact-${e.id}`)
                    .setOrigin(spec.originX, spec.originY).setDepth(.1);
                contact = { image: shadow, radius: e.radius };
                this.actorShadows.set(e.id, contact);
            }
            contact.image.setPosition(e.x, e.y).setVisible(p.state !== 'death');
            if (p.state === 'death') continue;
            if (e.elite) { g.lineStyle(3, 0xf8c45f, 1); g.strokeCircle(e.x, e.y, e.radius + 6); }
            // An attack pose and its aim are already scheduled by the combat
            // simulation. Draw only a small local marker for that *existing*
            // telegraph, not another independent warning or attack.
            const cue = enemyTelegraph(p, r.time);
            if (cue) {
                const ink = 0x253449, color = cue.kind === 'impact' ? 0xe57461 : 0xf8c45f;
                const radius = cue.radius;
                g.lineStyle(5, ink, .8);
                g.strokeCircle(e.x, e.y, radius);
                g.lineStyle(3, color, .95);
                if (r.reduceMotion || cue.kind === 'impact')
                    g.strokeCircle(e.x, e.y, radius);
                else {
                    g.beginPath();
                    g.arc(e.x, e.y, radius, -Math.PI / 2,
                        -Math.PI / 2 + Math.PI * 2 * Math.max(.08, cue.progress));
                    g.strokePath();
                }
                // Chevron sits just outside the enemy silhouette and points
                // down the locked line of attack, even when the player moves.
                const ux = Math.cos(cue.angle), uy = Math.sin(cue.angle);
                const ox = e.x + ux * (radius + 9), oy = e.y + uy * (radius + 9);
                const wing = cue.boss ? 8 : 6;
                g.lineStyle(3, ink, 1);
                g.strokeTriangle(ox + ux * 8, oy + uy * 8,
                    ox - ux * 5 - uy * wing, oy - uy * 5 + ux * wing,
                    ox - ux * 5 + uy * wing, oy - uy * 5 - ux * wing);
                g.lineStyle(2, color, 1);
                g.strokeTriangle(ox + ux * 8, oy + uy * 8,
                    ox - ux * 5 - uy * wing, oy - uy * 5 + ux * wing,
                    ox - ux * 5 + uy * wing, oy - uy * 5 - ux * wing);
            }
            if (e.kind === 'boss' && r.berserk) {
                // World-space berserk identity, not full-screen red flashing.
                g.lineStyle(3, 0xe57461, .8);
                g.strokeCircle(e.x, e.y, e.radius + 8);
            }
            const size = ENEMIES[e.kind].boss ? e.radius * 2.6 : e.radius * 3.1;
            if (e.hp < e.maxHp) {
                f.fillStyle(0x253449, .9); f.fillRect(e.x - 22, e.y - size - 7, 44, 5);
                f.fillStyle(0xe57461); f.fillRect(e.x - 22, e.y - size - 7, 44 * Math.max(0, e.hp / e.maxHp), 5);
            }
            if (e.shield > 0 && e.shieldUntil > r.time) { g.lineStyle(2, 0x6eaab0, .8); g.strokeCircle(e.x, e.y, e.radius + 3); }
        }
        const pose = this.heroAnimator.sample(r, delta);
        const motion = this.heroMotionAnimator.sample(r, pose, delta);
        const art = heroFrameTexture(r.characterId, pose.sheet, pose.frame);
        // Approved Option A PNGs, with presentation-only secondary motion.
        // Run still owns the exact world position, hitbox and combat timing.
        if (this.heroImage.texture.key !== art.key ||
            (art.frame !== undefined && String(this.heroImage.frame.name) !== String(art.frame)))
            this.heroImage.setTexture(art.key, art.frame);
        this.heroImage.setVisible(true)
            .setPosition(r.pos.x + motion.shiftX, r.pos.y - motion.lift).setOrigin(.5, 1)
            .setScale(pose.scale * motion.scaleX, pose.scale * motion.scaleY)
            .setRotation(motion.rotation).setFlipX(pose.flip)
            .setDepth(r.pos.y).setAlpha(1).setData('pose', pose).setData('motion', motion);
        this.heroShadow.setPosition(r.pos.x, r.pos.y).setVisible(true);
        drawHeroProtection(g, r);
        if (r.timers.wifiUntil > r.time) {
            g.fillStyle(0x6eaab0, .13);
            g.fillCircle(r.timers.wifiX, r.timers.wifiY, 160);
            g.lineStyle(3, 0x6eaab0, .6);
            g.strokeCircle(r.timers.wifiX, r.timers.wifiY, 160);
        }
        for (const d of r.drops) {
            if (!inRenderView(view, d.x, d.y, 30)) continue;
            if (drawSpecialDrop(g, d)) continue;
            // Bright diamond silhouette and dark halo remain legible on sandy ground.
            g.fillStyle(0x253449, .9);
            g.fillCircle(d.x, d.y, 11);
            g.lineStyle(2, 0xfff6df, .95);
            g.strokeCircle(d.x, d.y, 10);
            g.fillStyle(0x3ee6d2);
            g.fillTriangle(d.x, d.y - 9, d.x - 8, d.y, d.x + 8, d.y);
            g.fillTriangle(d.x - 8, d.y, d.x + 8, d.y, d.x, d.y + 10);
            g.fillStyle(0xffffff, .95);
            g.fillCircle(d.x - 2, d.y - 3, 2);
        }
        for (const shot of r.shots) {
            // A scheduled secondary shot is invisible until its actual spawn.
            if (shot.at !== undefined && shot.at > r.time) continue;
            if (!inRenderView(view, shot.x, shot.y, shot.radius + 34)) continue;
            drawWeaponProjectile(f, shot);
        }
        for (const label of this.labels)
            label.setVisible(false);
        // Avoid allocating slice(-24) (or an empty array) every frame.
        if (!r.reduceMotion) {
            const effects = r.effects;
            let slot = 0;
            for (let i = Math.max(0, effects.length - 24); i < effects.length; i++, slot++) {
                const e = effects[i];
                if (!inRenderView(view, e.x, e.y, e.radius + 72)) continue;
                const life = Math.max(0, (e.until - r.time) / .55);
                if (e.text) {
                    const label = this.labels[slot];
                    label.setPosition(e.x, e.y - 35 - (1 - life) * 24);
                    if (label.text !== e.text) label.setText(e.text);
                    label.setAlpha(life).setVisible(true);
                }
                if (e.kind !== 'hit') {
                    f.lineStyle(2, e.kind === 'heal' ? 0x81d4ae : 0xf8c45f, life * .8);
                    f.strokeCircle(e.x, e.y, e.radius * (1.2 - life * .2));
                }
            }
        }
    }
    private drawArea(a: Area, r: Run, g: Phaser.GameObjects.Graphics) {
        const warm = r.time < a.at, color = a.hostile ? 0xd94d40 : 0xf8c45f;
        g.lineStyle(a.hostile ? 4 : 2, color, warm ? .9 : .6);
        g.fillStyle(color, warm ? .12 : .28);
        if (a.shape === 'circle') {
            g.fillCircle(a.x, a.y, a.radius);
            g.strokeCircle(a.x, a.y, a.radius);
        }
        if (a.shape === 'cone') {
            g.beginPath();
            g.moveTo(a.x, a.y);
            g.arc(a.x, a.y, a.radius, a.angle - a.arc / 2, a.angle + a.arc / 2);
            g.closePath();
            g.fillPath();
            g.strokePath();
        }
        if (a.shape === 'line') {
            const c = Math.cos(a.angle), s = Math.sin(a.angle), w = a.width / 2;
            g.fillPoints([{ x: a.x - s * w, y: a.y + c * w }, { x: a.x + s * w, y: a.y - c * w }, { x: a.x + c * a.radius + s * w, y: a.y + s * a.radius - c * w }, { x: a.x + c * a.radius - s * w, y: a.y + s * a.radius + c * w }], true);
            g.lineBetween(a.x, a.y, a.x + c * a.radius, a.y + s * a.radius);
        }
        if (a.shape === 'ring') {
            const radius = warm ? 80 : 80 + 200 * Math.min(1, (r.time - a.at) / 1.5);
            g.lineStyle(warm ? 4 : 25, color, .75);
            g.beginPath();
            g.arc(a.x, a.y, radius, a.angle + 35 * Math.PI / 180, a.angle + Math.PI * 2 - 35 * Math.PI / 180);
            g.strokePath();
        }
        if (a.hostile && warm) {
            g.lineStyle(3, 0x253449, 1);
            g.lineBetween(a.x, a.y - 12, a.x, a.y + 2);
            g.fillStyle(0x253449);
            g.fillCircle(a.x, a.y + 8, 2);
        }
    }
}
