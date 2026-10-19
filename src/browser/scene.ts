import Phaser from 'phaser';
import heroFrames from './hero-frames.json';
import flexFrames from './hero-flex-frames.json';
import rearFrames from './hero-rear-frames.json';
import enemyAnimationFrames from './enemy-frames.json';
import { EnemyAnimator } from './enemy-animation';
import { installEnemyTextures } from './enemy-textures';
import { enemyTelegraph } from './enemy-telegraph';
import { HeroAnimator } from './hero-animation';
import { heroFrameTexture, installHeroFrameMattes } from './hero-frame-mattes';
import { HEROES } from '../game/catalog/content';
import { ENEMIES } from '../game/catalog/enemies';
import { COVER, WORLD } from '../game/simulation/world';
import type { Run } from '../game/simulation/run';
import type { Area } from '../game/simulation/types';
const ROOT = '/assets/cartoon/option-a-v1/';
/** Rendering consumes state only; visual animation never advances gameplay or RNG. */
export class BrowserScene extends Phaser.Scene {
    run?: Run;
    tick?: (dt: number) => void;
    onReady?: () => void;
    private actors = new Map<number, Phaser.GameObjects.Image>();
    private heroAnimator = new HeroAnimator();
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
        for (const cover of COVER)
            this.add.image(cover.x, cover.y, 'enemy-atlas', 14).setDisplaySize(80, 80).setOrigin(.5, .85).setDepth(cover.y);
        this.ground = this.add.graphics().setDepth(0);
        this.fx = this.add.graphics().setDepth(2000);
        this.heroImage = this.add.image(724, 610, 'sigma').setName('hero').setOrigin(.5, .9).setDisplaySize(90, 75);
        for (let i = 0; i < 24; i++)
            this.labels.push(this.add.text(0, 0, '', { fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#fff7da', stroke: '#253449', strokeThickness: 4 }).setDepth(2200).setOrigin(.5));
        this.ready = true;
        this.onReady?.();
    }
    update(_time: number, delta: number) { this.tick?.(Math.min(delta / 1000, .1)); if (this.run)
        this.draw(this.run, delta / 1000);
    else {
        this.heroImage?.setVisible(false);
        this.ground?.clear();
        this.fx?.clear();
        for (const image of this.actors.values())
            image.destroy();
        this.actors.clear();
        this.enemyAnimator.reset();
        for (const label of this.labels)
            label.setVisible(false);
    } }
    private draw(r: Run, delta: number) {
        const g = this.ground, f = this.fx;
        g.clear();
        f.clear();
        // Healing station indicator is a world-space object, not a HUD overlay.
        const station = r.safeSpot;
        const cooldown = Math.max(0, r.safeSpotReadyAt - r.time);
        const ready = cooldown <= 0;
        g.fillStyle(ready ? 0x3fe2ad : 0x465b73, .19);
        g.fillCircle(station.x, station.y, station.radius);
        g.lineStyle(4, ready ? 0x5cf0b4 : 0x8394aa, .9);
        g.strokeCircle(station.x, station.y, station.radius);
        g.fillStyle(0x24364a, .95);
        g.fillRoundedRect(station.x - 43, station.y - 26, 86, 52, 10);
        g.lineStyle(3, ready ? 0x5cf0b4 : 0x8394aa, 1);
        g.strokeRoundedRect(station.x - 43, station.y - 26, 86, 52, 10);
        g.fillStyle(ready ? 0x5cf0b4 : 0x9ba9b7);
        g.fillRect(station.x - 5, station.y - 16, 10, 32);
        g.fillRect(station.x - 16, station.y - 5, 32, 10);
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
        const enemyPoses = this.enemyAnimator.sample(r, delta);
        const visible = new Set(enemyPoses.map(p => p.enemy.id));
        for (const [id, image] of this.actors) if (!visible.has(id)) {
            image.destroy(); this.actors.delete(id);
        }
        for (const e of r.enemies) if (e.born > r.time) {
            g.lineStyle(3, 0xe57461, .9); g.strokeCircle(e.x, e.y, 26);
            g.strokeLineShape(new Phaser.Geom.Line(e.x - 12, e.y - 12, e.x + 12, e.y + 12));
        }
        for (const p of enemyPoses) {
            const e = p.enemy;
            let image = this.actors.get(e.id);
            if (!image) {
                image = this.add.image(e.x, e.y, p.sheet, p.frame).setName(`enemy-${e.id}`);
                this.actors.set(e.id, image);
            }
            image.setTexture(p.sheet, p.frame).setPosition(e.x, e.y).setOrigin(p.originX, p.originY)
                .setScale(e.kind === 'terminal' ? e.radius * 3.1 / image.frame.height : p.scale).setFlipX(p.flip).setDepth(e.y).setAlpha(p.alpha).setData('pose', p.state);
            image.clearTint();
            if (p.state === 'death') continue;
            g.fillStyle(0x253449, .2); g.fillEllipse(e.x, e.y + 3, e.radius * 2.1, e.radius * .65);
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
        const art = heroFrameTexture(r.characterId, pose.sheet, pose.frame);
        // A fixed scale preserves body proportions across attacks, hurt and death.
        this.heroImage.setVisible(true).setTexture(art.key, art.frame)
            .setPosition(r.pos.x, r.pos.y).setOrigin(.5, 1).setScale(pose.scale)
            .setFlipX(pose.flip).setDepth(r.pos.y).setAlpha(1).setData('pose', pose);
        g.fillStyle(0x253449, .23);
        g.fillEllipse(r.pos.x, r.pos.y + 4, 40, 13);
        if (r.shield > 0) {
            g.lineStyle(4, 0x73c8ce, .9);
            g.strokeCircle(r.pos.x, r.pos.y - 15, 39);
        }
        if (r.activeFlex) {
            g.lineStyle(4, 0xf8c45f, .85);
            g.strokeCircle(r.pos.x, r.pos.y, 45);
        }
        if (r.timers.wifiUntil > r.time) {
            g.fillStyle(0x6eaab0, .13);
            g.fillCircle(r.timers.wifiX, r.timers.wifiY, 160);
            g.lineStyle(3, 0x6eaab0, .6);
            g.strokeCircle(r.timers.wifiX, r.timers.wifiY, 160);
        }
        for (const d of r.drops) {
            if (d.kind === 'snack' || d.kind === 'magnet') {
                const magnet = d.kind === 'magnet';
                const color = magnet ? 0x9c79fa : 0x79e4a3;
                g.fillStyle(0x253449, .95);
                g.fillCircle(d.x, d.y, 17);
                g.lineStyle(3, color, 1);
                g.strokeCircle(d.x, d.y, 15);
                if (magnet) {
                    g.lineStyle(5, 0xffe4a4, 1);
                    g.beginPath();
                    g.arc(d.x, d.y, 9, 0, Math.PI, false);
                    g.strokePath();
                    g.fillStyle(0xffe4a4);
                    g.fillRect(d.x - 11, d.y - 1, 5, 6);
                    g.fillRect(d.x + 6, d.y - 1, 5, 6);
                } else {
                    g.fillStyle(color);
                    g.fillRect(d.x - 3, d.y - 10, 6, 20);
                    g.fillRect(d.x - 10, d.y - 3, 20, 6);
                }
                continue;
            }
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
        for (const a of r.areas)
            this.drawArea(a, r, g);
        for (const s of r.shots) {
            f.lineStyle(s.weapon === 'no-cap' ? 12 : s.hostile ? 7 : 5, s.hostile ? 0xd83e4b : 0xf8c45f, 1);
            f.lineBetween(s.x - Math.cos(s.angle) * 16, s.y - Math.sin(s.angle) * 16, s.x, s.y);
            f.fillStyle(s.hostile ? 0xff7280 : 0xfff7cf);
            f.fillCircle(s.x, s.y, s.hostile ? 5 : 3);
        }
        for (const label of this.labels)
            label.setVisible(false);
        (r.reduceMotion ? [] : r.effects.slice(-24)).forEach((e, i) => { const life = Math.max(0, (e.until - r.time) / .55); if (e.text)
            this.labels[i].setPosition(e.x, e.y - 35 - (1 - life) * 24).setText(e.text).setAlpha(life).setVisible(true); if (e.kind !== 'hit') {
            f.lineStyle(2, e.kind === 'heal' ? 0x81d4ae : 0xf8c45f, life * .8);
            f.strokeCircle(e.x, e.y, e.radius * (1.2 - life * .2));
        } });
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
