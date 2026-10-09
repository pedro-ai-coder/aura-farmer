import Phaser from 'phaser';
import { Arena } from '../core/arena';
import { GAME } from '../core/constants';
import { xpToNextLevel } from '../core/progression';
import { ENEMIES } from '../data/enemies';

export class ArenaScene extends Phaser.Scene {
  readonly arena = new Arena();
  private g!: Phaser.GameObjects.Graphics;
  private hud: Phaser.GameObjects.Text[] = [];
  private status!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Text;
  private feedback!: Phaser.GameObjects.Text;
  private debug!: Phaser.GameObjects.Text;
  private keyboard!: Record<string, Phaser.Input.Keyboard.Key>;
  private debugVisible = false;
  private pendingKeys = new Set<string>();

  constructor() { super('ArenaScene'); }

  create(): void {
    this.g = this.add.graphics();
    this.hud = [24, 245, 565, 745].map(x => this.label(x, 12, 16));
    this.status = this.label(24, 62, 12);
    this.overlay = this.label(480, 300, 20).setOrigin(.5).setAlign('center').setWordWrapWidth(650).setLineSpacing(12).setDepth(5);
    this.feedback = this.label(480, 559, 15).setOrigin(.5).setDepth(3);
    this.debug = this.label(940, 111, 12).setOrigin(1, 0).setDepth(3);
    this.keyboard = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ONE,TWO,THREE,ENTER,F3') as Record<string, Phaser.Input.Keyboard.Key>;
    for (const [name, key] of Object.entries(this.keyboard)) {
      key.on('down', () => this.pendingKeys.add(name));
    }
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearKeys, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(Phaser.Core.Events.BLUR, this.clearKeys, this));
  }

  update(_time: number, delta: number): void {
    // Preserve short taps even when down/up both arrive between rendered frames.
    const pressed = new Set(this.pendingKeys);
    this.pendingKeys.clear();
    const just = (key: string) => pressed.has(key);
    // Consume every edge every frame so menu inputs cannot leak into a later state.
    const one = just('ONE'), two = just('TWO'), three = just('THREE');
    if (just('F3')) this.debugVisible = !this.debugVisible;
    this.arena.update(delta, {
      x: Number(this.keyboard.D.isDown || this.keyboard.RIGHT.isDown) - Number(this.keyboard.A.isDown || this.keyboard.LEFT.isDown),
      y: Number(this.keyboard.S.isDown || this.keyboard.DOWN.isDown) - Number(this.keyboard.W.isDown || this.keyboard.UP.isDown),
      flex: just('E'), focus: just('SPACE'), confirm: just('ENTER'),
      choice: one ? 0 : two ? 1 : three ? 2 : undefined,
    });
    this.draw();
  }

  private clearKeys(): void { this.pendingKeys.clear(); }

  private label(x: number, y: number, size: number): Phaser.GameObjects.Text {
    return this.add.text(x, y, '', { fontFamily: 'Arial, sans-serif', fontSize: size, fontStyle: 'bold', color: '#fff6e8' }).setDepth(2);
  }

  private bar(x: number, y: number, width: number, value: number, color: number): void {
    this.g.fillStyle(0x130f26).fillRoundedRect(x, y, width, 10, 5);
    if (value > 0) this.g.fillStyle(color).fillRoundedRect(x, y, Math.max(5, width * Phaser.Math.Clamp(value, 0, 1)), 10, 5);
  }

  private draw(): void {
    const a = this.arena, g = this.g, stats = a.stats;
    g.clear();
    g.fillGradientStyle(0x211b37, 0x211b37, 0x312349, 0x312349).fillRect(0, 0, 960, 600);
    g.fillStyle(0x3b2c53).fillRoundedRect(12, 91, 936, 497, 20);
    g.lineStyle(1, 0x725585, .16);
    for (let x = 40; x < 940; x += 40) g.lineBetween(x, 100, x, 580);
    for (let y = 100; y < 580; y += 40) g.lineBetween(20, y, 940, y);
    g.lineStyle(2, 0x9772b5, .5).strokeRoundedRect(12, 91, 936, 497, 20);
    for (const drop of a.drops) {
      g.fillStyle(0x7cf7c6).fillTriangle(drop.x, drop.y - 7, drop.x - 5, drop.y + 4, drop.x + 5, drop.y + 4);
    }
    for (const enemy of a.enemies) {
      const s = ENEMIES[enemy.type], r = s.radius, x = enemy.x, y = enemy.y;
      g.fillStyle(0x160f29, .3).fillEllipse(x, y + r, r * 2, r * .65);
      g.fillStyle(s.color).fillRoundedRect(x - r, y - r, r * 2, r * 2, r * .6);
      g.lineStyle(3, 0x1b1429).strokeRoundedRect(x - r, y - r, r * 2, r * 2, r * .6);
      g.fillStyle(0x271a38).fillCircle(x - r * .35, y - 2, 3).fillCircle(x + r * .35, y - 2, 3);
      g.lineStyle(2, 0x271a38).lineBetween(x - r * .3, y + r * .4, x + r * .3, y + r * .4);
      if (enemy.type === 'hater') g.fillStyle(0xffffff).fillTriangle(x - 9, y - r + 1, x + 9, y - r + 1, x, y - r - 9);
      if (enemy.type === 'boss') {
        g.fillStyle(0xffd16b).fillTriangle(x - 24, y - r, x + 24, y - r, x, y - r - 24);
        this.bar(x - 45, y - r - 12, 90, enemy.hp / s.hp, 0xff729f);
      }
    }
    for (const shot of a.shots) {
      g.fillStyle(shot.hostile ? 0xff769b : 0xffe08b).fillCircle(shot.x, shot.y, shot.hostile ? 6 : 4);
    }
    const charging = a.flex.state === 'charging', burst = a.clock < a.aura.burstUntil;
    if (a.clock < a.focusUntil) {
      g.lineStyle(3, 0x9bdfff, .5).strokeCircle(a.pos.x, a.pos.y, 90);
      g.lineStyle(2, 0x9bdfff, .2).strokeCircle(a.pos.x, a.pos.y, 105);
    }
    if (charging) {
      g.fillStyle(0xffd574, .08).fillCircle(a.pos.x, a.pos.y, GAME.flexRadius);
      g.lineStyle(2, 0xffd574, .7).strokeCircle(a.pos.x, a.pos.y, GAME.flexRadius);
      g.lineStyle(5, 0xffe69f).beginPath().arc(a.pos.x, a.pos.y, 28, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * a.flex.progress(a.clock)).strokePath();
    }
    if (a.clock < a.jawUntil) g.lineStyle(6, 0xaaf1cf, .7).strokeCircle(a.pos.x, a.pos.y, 95);
    if (a.buffs['ohio-orbiter']) {
      g.lineStyle(1, 0xa48cff, .3).strokeCircle(a.pos.x, a.pos.y, 76);
      g.fillStyle(charging ? 0x746789 : 0xb398ff).fillCircle(a.orb.x, a.orb.y, 12);
    }
    if (burst) g.lineStyle(4, 0xffe283, .7).strokeCircle(a.pos.x, a.pos.y, 34);
    g.fillStyle(0x160f29, .4).fillEllipse(a.pos.x, a.pos.y + 20, 44, 14);
    g.fillStyle(charging ? 0xffd574 : a.clock - a.lastDamageAt < 180 && a.clock > 0 ? 0xff8694 : 0xb49afa)
      .fillRoundedRect(a.pos.x - 18, a.pos.y - 21, 36, 42, 13);
    g.lineStyle(3, 0xefe1ff).strokeRoundedRect(a.pos.x - 18, a.pos.y - 21, 36, 42, 13);
    // Sunglasses and a tiny grin: original procedural cartoon character.
    g.fillStyle(0x21172f).fillRoundedRect(a.pos.x - 14, a.pos.y - 9, 28, 10, 3);
    g.lineStyle(2, 0xffffff).lineBetween(a.pos.x + 1, a.pos.y + 9, a.pos.x + 10, a.pos.y + 6);

    this.hud[0].setText(`HP ${Math.ceil(a.hp)}/${stats.maxHp}`);
    this.hud[1].setText(`AURA ${a.aura.value}/100 · ${a.aura.rank}`);
    this.hud[2].setText(`LVL ${a.xp.level}`);
    this.hud[3].setText(`WAVE ${a.wave}/5 · ${Math.max(0, Math.ceil((GAME.waveDurationMs - a.waveClock) / 1000))}s`);
    this.bar(24, 40, 180, a.hp / stats.maxHp, 0xff82a2);
    this.bar(245, 40, 270, a.aura.value / 100, burst ? 0xffd574 : 0xb79aff);
    this.bar(565, 40, 140, a.xp.xp / xpToNextLevel(a.xp.level), 0x7cf7c6);
    this.bar(745, 40, 190, 1 - a.waveClock / GAME.waveDurationMs, 0x9bdfff);
    const flex = charging ? `A CARREGAR · ${a.nearby}/3` : a.flex.isReady(a.clock) ? `PRONTO · ${a.nearby}/3 perto` : `${a.flex.secondsUntilReady(a.clock)}s`;
    const focus = a.clock < a.focusUntil ? 'ATIVO' : a.clock >= a.focusReady ? 'PRONTO' : `${Math.ceil((a.focusReady - a.clock) / 1000)}s`;
    this.status.setText(`E FLEX: ${flex}       ESPAÇO FOCUS: ${focus}       ${burst ? `BURST ${Math.ceil((a.aura.burstUntil - a.clock) / 1000)}s · +20% dano` : `${a.kills} eliminações · recolhe os cristais verdes`}`);
    this.feedback.setVisible(a.mode === 'playing').setText(a.clock < a.feedbackUntil ? a.feedback : a.wave === 5 && !a.bossDefeated && a.waveClock >= GAME.waveDurationMs ? 'Derrota o BIG HATER para terminar!' : '');
    this.debug.setText(this.debugVisible ? `${Math.round(this.game.loop.actualFps)} FPS\n${a.enemies.length} inimigos / ${a.shots.length} projéteis\n${a.clock.toFixed(0)} ms · ${a.mode}` : '');
    let message = '';
    if (a.mode === 'intro') message = 'AURA FARMER\nNO AURA? SKILL ISSUE.\n\nWASD / setas para mover · disparo automático\nE: FLEX perto de 3 inimigos · ESPAÇO: abrandar\nRecolhe XP, escolhe upgrades e derrota o BIG HATER.\n\nENTER para começar';
    if (a.mode === 'upgrades') message = `LEVEL UP · ESCOLHE O TEU BUFF\nSimulação em pausa · ${a.pendingUpgrades} escolha(s)\n\n${a.choices.map((b, i) => `[${i + 1}] ${b.name} · ${a.buffs[b.id] + 1}/${b.maxStacks}\n${b.description}`).join('\n\n')}`;
    if (a.mode === 'between') message = `WAVE ${a.wave} COMPLETE\n\n${a.kills} eliminações · Nível ${a.xp.level}\n+20 HP na próxima vaga\n\nENTER para continuar`;
    if (a.mode === 'dead') message = `YOU ARE COOKED\n\nVaga ${a.wave}/5 · ${a.kills} eliminações\n\nENTER para tentar novamente`;
    if (a.mode === 'win') message = `GOD AURA — VITÓRIA!\n\nBIG HATER derrotado · 5 vagas completas\n${a.kills} eliminações · Nível ${a.xp.level}\n\nENTER para jogar outra vez`;
    if (message) {
      g.fillStyle(0x100b20, .78).fillRect(0, 91, 960, 509);
      g.fillStyle(0x241a3b, .98).fillRoundedRect(110, 118, 740, 438, 22);
      g.lineStyle(2, 0xb899eb).strokeRoundedRect(110, 118, 740, 438, 22);
    }
    this.overlay.setPosition(480, 337).setFontSize(a.mode === 'upgrades' ? 18 : 20).setText(message);
  }
}
