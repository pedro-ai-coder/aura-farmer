import Phaser from 'phaser';
import heroFrames from './hero-frames.json';
import { heroPose } from './hero-animation';
import { HEROES } from '../game/catalog/content';
import { ENEMIES, type EnemyKind } from '../game/catalog/enemies';
import { COVER, WORLD } from '../game/simulation/world';
import type { Run } from '../game/simulation/run';
import type { Area } from '../game/simulation/types';
const ROOT = '/assets/cartoon/option-a-v1/';
const enemyFrames: Partial<Record<EnemyKind, number>> = { 'reply-goblin': 0, beta: 1, 'ratio-ram': 2, doomscroller: 3, 'hype-bot': 4, 'fanum-leech': 5, 'ping-sniper': 6, 'copium-puffer': 7, 'comment-mod': 8, 'reply-guy': 9, 'mod-supremo': 10, 'ohio-express': 11, 'doomscroll-prime': 12, terminal: 13 };
/** Rendering consumes state only; visual animation never advances gameplay or RNG. */
export class BrowserScene extends Phaser.Scene {
    run?: Run;
    tick?: (dt: number) => void;
    onReady?: () => void;
    private actors = new Map<number, Phaser.GameObjects.Image>();
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
        }
        this.load.image('npc', ROOT + 'enemies/phone-guy.png');
        this.load.image('hater', ROOT + 'enemies/hater.png');
        this.load.image('boss', ROOT + 'enemies/big-hater.png');
        this.load.image('enemy-atlas', '/assets/runtime/enemies.png');
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
        const texture = this.textures.get('enemy-atlas'), source = texture.getSourceImage() as HTMLImageElement;
        for (let row = 0; row < 4; row++)
            for (let col = 0; col < 4; col++)
                texture.add(row * 4 + col, 0, Math.round(col * source.width / 4), Math.round(row * source.height / 4), Math.floor(source.width / 4), Math.floor(source.height / 4));
        for (const cover of COVER)
            this.add.image(cover.x, cover.y, 'enemy-atlas', 14).setDisplaySize(80, 80).setOrigin(.5, .85).setDepth(cover.y);
        this.ground = this.add.graphics().setDepth(0);
        this.fx = this.add.graphics().setDepth(2000);
        this.heroImage = this.add.image(724, 610, 'sigma').setOrigin(.5, .9).setDisplaySize(90, 75);
        for (let i = 0; i < 24; i++)
            this.labels.push(this.add.text(0, 0, '', { fontFamily: 'Arial', fontSize: '18px', fontStyle: 'bold', color: '#fff7da', stroke: '#253449', strokeThickness: 4 }).setDepth(2200).setOrigin(.5));
        this.ready = true;
        this.onReady?.();
    }
    update(_time: number, delta: number) { this.tick?.(Math.min(delta / 1000, .1)); if (this.run)
        this.draw(this.run);
    else {
        this.heroImage?.setVisible(false);
        this.ground?.clear();
        this.fx?.clear();
        for (const image of this.actors.values())
            image.destroy();
        this.actors.clear();
        for (const label of this.labels)
            label.setVisible(false);
    } }
    private draw(r: Run) {
        const g = this.ground, f = this.fx;
        g.clear();
        f.clear();
        const alive = new Set(r.enemies.map(e => e.id));
        for (const [id, image] of this.actors)
            if (!alive.has(id)) {
                image.destroy();
                this.actors.delete(id);
            }
        for (const e of r.enemies) {
            if (e.born > r.time) {
                g.lineStyle(3, 0xe57461, .9);
                g.strokeCircle(e.x, e.y, 26);
                g.strokeLineShape(new Phaser.Geom.Line(e.x - 12, e.y - 12, e.x + 12, e.y + 12));
                continue;
            }
            let image = this.actors.get(e.id);
            if (!image) {
                image = this.add.image(e.x, e.y, enemyFrames[e.kind] !== undefined ? 'enemy-atlas' : e.kind, enemyFrames[e.kind]);
                this.actors.set(e.id, image);
            }
            const size = ENEMIES[e.kind].boss ? e.radius * 2.6 : e.radius * 3.1;
            image.setPosition(e.x, e.y).setOrigin(.5, .88).setDisplaySize(size, size).setDepth(e.y).setAlpha(1);
            if (e.kind === 'boss' && r.berserk)
                image.setTint(0xffb6a3);
            else
                image.clearTint();
            g.fillStyle(0x253449, .2);
            g.fillEllipse(e.x, e.y + 3, e.radius * 2.1, e.radius * .65);
            if (e.elite) {
                g.lineStyle(3, 0xf8c45f, 1);
                g.strokeCircle(e.x, e.y, e.radius + 6);
            }
            if (e.hp < e.maxHp) {
                f.fillStyle(0x253449, .9);
                f.fillRect(e.x - 22, e.y - size * .9 - 7, 44, 5);
                f.fillStyle(0xe57461);
                f.fillRect(e.x - 22, e.y - size * .9 - 7, 44 * Math.max(0, e.hp / e.maxHp), 5);
            }
            if (e.shield > 0 && e.shieldUntil > r.time) {
                g.lineStyle(2, 0x6eaab0, .8);
                g.strokeCircle(e.x, e.y, e.radius + 3);
            }
        }
        const pose = heroPose(r);
        // A fixed scale preserves body proportions across attacks, hurt and death.
        const scale = r.characterId === 'cool-kid' ? .40 : r.characterId === 'alpha' ? .50 : .44;
        this.heroImage.setVisible(true).setTexture(r.characterId + '-atlas', pose.frame)
            .setPosition(r.pos.x, r.pos.y).setOrigin(.5, 1).setScale(scale)
            .setFlipX(pose.flip).setDepth(r.pos.y).setAlpha(1);
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
            g.fillStyle(0x253449);
            g.fillCircle(d.x, d.y, 7);
            g.fillStyle(0x63d4c4);
            g.fillTriangle(d.x, d.y - 6, d.x - 5, d.y + 4, d.x + 5, d.y + 4);
        }
        for (const a of r.areas)
            this.drawArea(a, r, g);
        for (const s of r.shots) {
            f.lineStyle(s.weapon === 'no-cap' ? 12 : s.hostile ? 5 : 4, s.hostile ? 0xe57461 : 0xf8c45f, 1);
            f.lineBetween(s.x - Math.cos(s.angle) * 16, s.y - Math.sin(s.angle) * 16, s.x, s.y);
            f.fillStyle(s.hostile ? 0xfff0e8 : 0xfff7cf);
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
