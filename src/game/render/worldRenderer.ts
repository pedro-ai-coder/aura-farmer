import Phaser from 'phaser';
import type { Arena } from '../core/arena';
import type { EnemyType } from '../data/enemies';
import { ENEMIES } from '../data/enemies';
import { createEffects, effectKey } from './effectsArt';
import { cartoonHeroKey, cartoonEnemyKey } from './cartoonArt';
export const ART = { aura: 0xffcc51 } as const;
export class WorldRenderer {
    private previousHP = -1;
    private previousAuraBursts = 0;
    private auraFxAt = -1;
    private healFxAt = -1;
    private bossFxAt = -1;
    private wasBoss = false;
    private largeFx: Phaser.GameObjects.Image[] = [];
    private hitFx: Array<{
        x: number;
        y: number;
        since: number;
    }> = [];
    private impactSprites: Phaser.GameObjects.Image[] = [];
    private player: Phaser.GameObjects.Image;
    private enemies = new Map<number, Phaser.GameObjects.Image>();
    private drops: Phaser.GameObjects.Image[] = [];
    private shots: Phaser.GameObjects.Image[] = [];
    private orbiter: Phaser.GameObjects.Image;
    private shadowLayer: Phaser.GameObjects.Graphics;
    private actionLayer: Phaser.GameObjects.Graphics;
    private previousEnemies = new Map<number, {
        x: number;
        y: number;
        hp: number;
        type: EnemyType;
    }>();
    private hitFlashes = new Map<number, number>();
    private impacts: Array<{
        x: number;
        y: number;
        until: number;
        type: EnemyType;
    }> = [];
    private facingRight = true;
    private lastX = 480;
    private lastY = 330;
    private lastClock = 0;
    private lastCharacter = 'sigma';
    constructor(private scene: Phaser.Scene) {
        createEffects(scene);
        this.shadowLayer = scene.add.graphics().setDepth(.65);
        this.actionLayer = scene.add.graphics().setDepth(1.65);
        this.player = scene.add.image(480, 330, cartoonHeroKey('sigma')).setDepth(1.2);
        this.orbiter = scene.add.image(480, 330, 'af-shot').setDepth(1.1).setVisible(false);
        const restore = () => {
            if (!scene.sys.isActive())
                return;
            createEffects(scene);
            for (const key of scene.textures.getTextureKeys()) {
                const texture = scene.textures.get(key);
                if (texture instanceof Phaser.Textures.CanvasTexture)
                    texture.refresh();
            }
        };
        document.addEventListener('fullscreenchange', restore);
        scene.game.canvas.addEventListener('webglcontextrestored', restore);
        scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
            document.removeEventListener('fullscreenchange', restore);
            scene.game.canvas.removeEventListener('webglcontextrestored', restore);
        });
    }
    /** Validate both key and sheet frame; a missing Phaser texture must never
     * become a black/green placeholder in the playable arena. */
    private safeTexture(img: Phaser.GameObjects.Image, key: string, fallback: string, frame?: string | number): void {
        const valid = (k: string, f?: string | number): boolean => this.scene.textures.exists(k) && this.scene.textures.get(k).has(String(f ?? '__BASE'));
        const target = valid(key, frame) ? key : valid(fallback) ? fallback : null;
        if (!target) {
            img.setVisible(false);
            return;
        }
        const targetFrame = target === key ? String(frame ?? '__BASE') : '__BASE';
        // Phaser setTexture rebinds geometry and emits events. Hundreds of
        // unmodified actors/particles should not do this on every render frame.
        if (img.texture.key !== target || String(img.frame.name) !== targetFrame) {
            if (target === key)
                img.setTexture(target, frame);
            else
                img.setTexture(target);
        }
        if (!img.visible)
            img.setVisible(true);
    }
    sync(a: Arena): void {
        const moveX = a.pos.x - this.lastX;
        if (Math.abs(moveX) > .18)
            this.facingRight = moveX > 0;
        const playerMoving = Math.hypot(moveX, a.pos.y - this.lastY) > .18;
        this.lastX = a.pos.x;
        this.lastY = a.pos.y;
        if (a.characterId !== this.lastCharacter || a.clock < this.lastClock) {
            this.previousHP = a.hp;
            this.previousAuraBursts = a.auraBursts;
            this.auraFxAt = -1;
            this.healFxAt = -1;
            this.bossFxAt = -1;
            this.wasBoss = false;
            this.hitFx = [];
        }
        this.lastClock = a.clock;
        this.lastCharacter = a.characterId;
        this.safeTexture(this.player, cartoonHeroKey(a.characterId), cartoonHeroKey(a.characterId));
        this.player.setPosition(a.pos.x, a.pos.y).setFlipX(!this.facingRight)
            .setTint(a.flexActive ?
            (a.flex.variant === 'alpha' ? 0xffe59a : a.flex.variant === 'sigma' ? 0xa5f5ff : 0xf5b8ff) :
            0xffffff);
        {
            this.player.setDisplaySize(55, 55);
            this.player.setRotation(a.flexActive ? 0 : playerMoving ? Math.sin(a.clock / 140) * .055 : Math.sin(a.clock / 320) * .018);
        }
        if (a.clock > 180 && a.clock - a.lastDamageAt < 115)
            this.player.setTintFill(0xffe7f0);
        this.shadowLayer.clear();
        this.actionLayer.clear();
        {
            if (this.previousHP >= 0 && a.hp > this.previousHP + 1)
                this.healFxAt = a.clock;
            if (a.auraBursts > this.previousAuraBursts)
                this.auraFxAt = a.clock;
            this.previousHP = a.hp;
            this.previousAuraBursts = a.auraBursts;
            const bossNow = a.enemies.some(e => e.type === 'boss');
            if (bossNow && !this.wasBoss)
                this.bossFxAt = a.clock;
            this.wasBoss = bossNow;
        }
        if (a.mode === 'playing' || a.mode === 'upgrades' || a.mode === 'between') {
            this.shadowLayer.fillStyle(0x302747, .23).fillEllipse(a.pos.x, a.pos.y + 17, 33, 9);
            this.shadowLayer.fillStyle(0xffcc51, .17).fillEllipse(a.pos.x, a.pos.y + 17, 19, 5);
        }
        const alive = new Set<number>();
        for (const enemy of a.enemies) {
            alive.add(enemy.id);
            let img = this.enemies.get(enemy.id);
            if (!img) {
                img = this.scene.add.image(enemy.x, enemy.y, cartoonEnemyKey(enemy.type)).setDepth(1);
                this.enemies.set(enemy.id, img);
            }
            const previous = this.previousEnemies.get(enemy.id);
            const hitNow = !!previous && enemy.hp < previous.hp;
            if (hitNow) {
                this.hitFlashes.set(enemy.id, a.clock + 105);
                if (this.hitFx.length < 24)
                    this.hitFx.push({ x: enemy.x, y: enemy.y, since: a.clock });
            }
            this.safeTexture(img, cartoonEnemyKey(enemy.type), cartoonEnemyKey(enemy.type));
            const size = enemy.type === 'boss' ? 140 : enemy.type === 'beta' ? 65 : 53;
            img.setDisplaySize(size, size);
            img.setRotation(Math.sin((a.clock + enemy.id * 91) / 290) * (enemy.type === 'boss' ? .018 : .045));
            if (previous && Math.abs(enemy.x - previous.x) > 0.15)
                img.setFlipX(enemy.x > previous.x);
            img.setPosition(enemy.x, enemy.y);
            if ((this.hitFlashes.get(enemy.id) ?? 0) > a.clock)
                img.setTintFill(0xfff2e7);
            else
                img.clearTint();
            this.previousEnemies.set(enemy.id, { x: enemy.x, y: enemy.y, hp: enemy.hp, type: enemy.type });
            const boss = enemy.type === 'boss';
            this.shadowLayer.fillStyle(0x302747, boss ? .32 : .20)
                .fillEllipse(enemy.x, enemy.y + (boss ? 31 : enemy.type === 'beta' ? 19 : 13), boss ? 88 : enemy.type === 'beta' ? 42 : 29, boss ? 16 : 9);
            if (boss) {
                const w = 112, x = enemy.x - w / 2, y = Math.max(111, enemy.y - 65), health = Phaser.Math.Clamp(enemy.hp / ENEMIES.boss.hp, 0, 1);
                this.actionLayer.fillStyle(0x302747, .94).fillRoundedRect(x - 2, y - 2, w + 4, 13, 4);
                this.actionLayer.fillStyle(0xffebdb, 1).fillRect(x, y, w, 9);
                this.actionLayer.fillStyle(0xea568a, 1).fillRect(x, y, Math.max(0, w * health), 9);
                this.actionLayer.fillStyle(0xffcc51, 1).fillRect(x + 1, y + 1, Math.max(0, (w - 2) * health), 2);
            }
            if (enemy.type === 'hater' && enemy.nextShot - a.clock > 0 && enemy.nextShot - a.clock < 360) {
                this.actionLayer.lineStyle(2, 0xe75154, .6).strokeCircle(enemy.x, enemy.y, 27 + (enemy.nextShot - a.clock) / 40);
            }
        }
        for (const [id, img] of this.enemies)
            if (!alive.has(id)) {
                const last = this.previousEnemies.get(id);
                if (last && a.mode === 'playing' && this.impacts.length < 24)
                    this.impacts.push({ x: last.x, y: last.y, until: a.clock + 310, type: last.type });
                img.destroy();
                this.enemies.delete(id);
                this.previousEnemies.delete(id);
                this.hitFlashes.delete(id);
            }
        this.impacts = this.impacts.filter(fx => fx.until > a.clock);
        {
            this.hitFx = this.hitFx.filter(hit => a.clock - hit.since < 190);
            const count = Math.min(24, this.hitFx.length + this.impacts.length);
            while (this.impactSprites.length < count)
                this.impactSprites.push(this.scene.add.image(0, 0, 'af-fx-hit-0').setDepth(1.7));
            this.impactSprites.forEach((img, i) => {
                const hit = this.hitFx[i];
                const death = hit ? undefined : this.impacts[i - this.hitFx.length];
                img.setVisible(!!(hit || death));
                if (hit || death) {
                    this.safeTexture(img, effectKey(hit ? 'hit' : 'death', hit ? a.clock - hit.since : 310 - (death!.until - a.clock), hit ? 190 : 310), 'af-shot');
                    img.setPosition((hit || death)!.x, (hit || death)!.y);
                }
            });
        }
        {
            while (this.largeFx.length < 3)
                this.largeFx.push(this.scene.add.image(0, 0, 'af-fx-burst-0').setDepth(1.74));
            const boss = a.enemies.find(e => e.type === 'boss');
            const details = [
                { at: this.auraFxAt, kind: 'burst' as const, ttl: 560, x: a.pos.x, y: a.pos.y },
                { at: this.healFxAt, kind: 'heal' as const, ttl: 440, x: a.pos.x, y: a.pos.y - 7 },
                { at: this.bossFxAt, kind: 'boss_warn' as const, ttl: 580, x: boss?.x ?? 480, y: boss?.y ?? 330 }
            ];
            this.largeFx.forEach((img, i) => {
                const d = details[i], time = a.clock - d.at;
                img.setVisible(d.at >= 0 && time >= 0 && time < d.ttl);
                if (img.visible) {
                    this.safeTexture(img, effectKey(d.kind, time, d.ttl), 'af-shot');
                    img.setPosition(d.x, d.y);
                }
            });
        }
        while (this.shots.length < a.shots.length)
            this.shots.push(this.scene.add.image(0, 0, 'af-shot').setDepth(1.4));
        this.shots.forEach((img, i) => {
            const shot = a.shots[i];
            img.setVisible(!!shot);
            if (shot) {
                this.safeTexture(img, shot.hostile ? 'af-hostile' : 'af-shot', shot.hostile ? 'af-hostile' : 'af-shot');
                img.setPosition(shot.x, shot.y);
            }
        });
        while (this.drops.length < a.drops.length)
            this.drops.push(this.scene.add.image(0, 0, 'af-xp').setDepth(.8));
        this.drops.forEach((img, i) => {
            const drop = a.drops[i];
            img.setVisible(!!drop);
            if (drop) {
                this.safeTexture(img, 'af-xp', 'af-xp');
                img.setPosition(drop.x, drop.y - 2 - Math.sin(a.clock / 230 + i) * 2);
                img.setRotation(Math.sin(a.clock / 460 + i) * .10);
            }
        });
        // Reusable, low-noise projectile trails: never allocate a GameObject per shot.
        if (a.mode === 'playing') {
            for (let i = 0; i < a.shots.length && i < 64; i++) {
                const shot = a.shots[i], angle = Math.atan2(shot.vy, shot.vx);
                this.actionLayer.fillStyle(shot.hostile ? 0xe75154 : 0xffcc51, .36)
                    .fillRect(shot.x - Math.cos(angle) * 11 - 2, shot.y - Math.sin(angle) * 11 - 2, 4, 4);
                this.actionLayer.fillStyle(shot.hostile ? 0xf5bac5 : 0xfff8e7, .58)
                    .fillRect(shot.x - Math.cos(angle) * 5 - 1, shot.y - Math.sin(angle) * 5 - 1, 3, 3);
            }
        }
        if (a.buffs['ohio-orbiter']) {
            this.safeTexture(this.orbiter, 'af-shot', 'af-shot');
        }
        this.orbiter.setVisible(a.buffs['ohio-orbiter'] > 0 && this.orbiter.texture.key !== '__MISSING');
        if (a.buffs['ohio-orbiter'])
            this.orbiter.setPosition(a.orb.x, a.orb.y);
    }
}
