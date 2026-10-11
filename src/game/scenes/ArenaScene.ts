import Phaser from 'phaser';
import { Arena } from '../core/arena';
import { GAME } from '../core/constants';
import { BUFFS } from '../data/buffs';
import { xpToNextLevel } from '../core/progression';
import { touchControls } from '../input/touchControls';
import { ART, PixelWorld } from '../render/pixelArt';
import type { CharacterId } from '../data/characters';
import { runResult } from '../../meta/profile';

export class ArenaScene extends Phaser.Scene {
  readonly arena = new Arena();
  private g!: Phaser.GameObjects.Graphics;
  private modalBg!: Phaser.GameObjects.Graphics;
  private pixelWorld!: PixelWorld;
  private buffIcons: Phaser.GameObjects.Image[] = [];
  private hud: Phaser.GameObjects.Text[] = [];
  private status!: Phaser.GameObjects.Text;
  private overlay!: Phaser.GameObjects.Text;
  private feedback!: Phaser.GameObjects.Text;
  private debug!: Phaser.GameObjects.Text;
  private keyboard!: Record<string, Phaser.Input.Keyboard.Key>;
  private debugVisible = false;
  private paused = false;
  private notifiedMode = 'intro';
  private reportedRun = false;
  private pendingKeys = new Set<string>();

  constructor() { super('ArenaScene'); }

  preload(): void {
    // Original static PNG sprite sheets shipped with the application.
    // Keep px-* runtime textures available as an explicit fallback.
    for (const [key, frame] of [
      ['sigma', 48], ['sigma-b1',48], ['npc', 48], ['hater', 48],
      ['beta', 64], ['boss', 128], ['items', 16], ['icons', 16],
      ['alpha',48], ['rizzler',48], ['ohio',48], ['fanum',48], ['six-seven',48],
    ] as const) {
      this.load.spritesheet('spr-' + key, 'assets/pixel/' + key + '.png', {
        frameWidth: frame, frameHeight: frame,
      });
    }
  }

  create(): void {
    this.pixelWorld = new PixelWorld(this);
    this.g = this.add.graphics().setDepth(0);
    this.modalBg = this.add.graphics().setDepth(4);
    if (this.textures.exists('spr-icons')) {
      this.buffIcons = Array.from({ length: 16 }, () =>
        this.add.image(0,0,'spr-icons',0).setDepth(3).setScale(1.5).setVisible(false));
    }
    this.hud = [24, 245, 565, 745].map(x => this.label(x, 12, 16));
    this.status = this.label(24, 62, 12);
    this.overlay = this.label(480, 300, 20).setOrigin(.5).setAlign('center').setWordWrapWidth(650).setLineSpacing(12).setDepth(5);
    this.feedback = this.label(480, 559, 15).setOrigin(.5).setDepth(3);
    this.debug = this.label(940, 111, 12).setOrigin(1, 0).setDepth(3);
    for (const t of [...this.hud, this.status, this.feedback, this.debug]) t.setColor('#302747');
    this.overlay.setDepth(5).setColor('#fff8e7');
    this.keyboard = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,SPACE,ONE,TWO,THREE,ENTER,F3') as Record<string, Phaser.Input.Keyboard.Key>;
    for (const [name, key] of Object.entries(this.keyboard)) {
      key.on('down', () => this.pendingKeys.add(name));
    }
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearKeys, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(Phaser.Core.Events.BLUR, this.clearKeys, this));
  }

  setPaused(value: boolean): void { this.paused = value; if (value) touchControls.clear(); }
  startRun(characterId: CharacterId): void { this.arena.start(characterId); this.reportedRun = false; this.paused = false; }
  resetToIntro(): void { this.arena.start(); this.arena.mode = 'intro'; this.reportedRun=false; this.paused=false; }

  update(_time: number, delta: number): void {
    if (this.paused) { touchControls.clear(); return; }
    // Preserve short taps even when down/up both arrive between rendered frames.
    const pressed = new Set(this.pendingKeys);
    this.pendingKeys.clear();
    const just = (key: string) => pressed.has(key);
    // Consume every edge every frame so menu inputs cannot leak into a later state.
    const one = just('ONE'), two = just('TWO'), three = just('THREE');
    if (just('F3')) this.debugVisible = !this.debugVisible;
    const touch = touchControls.consume();
    this.arena.update(delta, {
      x: Phaser.Math.Clamp(Number(this.keyboard.D.isDown || this.keyboard.RIGHT.isDown) - Number(this.keyboard.A.isDown || this.keyboard.LEFT.isDown) + (touch.x ?? 0), -1, 1),
      y: Phaser.Math.Clamp(Number(this.keyboard.S.isDown || this.keyboard.DOWN.isDown) - Number(this.keyboard.W.isDown || this.keyboard.UP.isDown) + (touch.y ?? 0), -1, 1),
      flex: just('E') || touch.flex,
      focus: just('SPACE') || touch.focus,
      confirm: just('ENTER') || touch.confirm,
      choice: one ? 0 : two ? 1 : three ? 2 : touch.choice,
    });
    this.draw();
    this.pixelWorld.sync(this.arena);
    if (this.notifiedMode !== this.arena.mode) {
      this.notifiedMode = this.arena.mode;
      window.dispatchEvent(new CustomEvent('aura:mode', {detail:this.arena.mode}));
    }
    if (this.arena.mode === 'playing') this.reportedRun=false;
    if ((this.arena.mode === 'dead' || this.arena.mode === 'win') && !this.reportedRun) {
      this.reportedRun = true;
      window.dispatchEvent(new CustomEvent('aura:run-finished', {detail:runResult(this.arena)}));
    }
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
    // Layered arcade HUD panels with legible dark text on Cloud Cream.
    for (const [x,w] of [[18,199],[238,288],[555,164],[735,211]]) {
      g.fillStyle(0x302747,.15).fillRoundedRect(x+2,6,w,53,9);
      g.fillStyle(0xfff8e7,.97).fillRoundedRect(x,4,w,53,8);
      g.lineStyle(2,0x76609e,.82).strokeRoundedRect(x,4,w,53,8);
      g.fillStyle(0xc6b6e5,.45).fillRect(x+9,33,w-18,2);
    }
    g.fillStyle(0x302747,.93).fillRoundedRect(18,59,924,20,5);
    g.lineStyle(1,0x76609e,.92).strokeRoundedRect(18,59,924,20,5);
    // The light Lavender Pop arena and all character/projectile textures are
    // cached once; Phaser Graphics only draws warnings, HUD and combat FX.
    const charging = a.flex.state === 'charging', burst = a.clock < a.aura.burstUntil;
    if (a.clock < a.effects.rizzPulseUntil) g.lineStyle(3, 0xff9edc, .7).strokeCircle(a.pos.x, a.pos.y, 145);
    if (a.clock < a.effects.invulnerableUntil) g.lineStyle(3, 0xafffea, .8).strokeCircle(a.pos.x, a.pos.y, 27);
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
    if (a.buffs['ohio-orbiter']) g.lineStyle(1, 0x8b5bd8, .45).strokeCircle(a.pos.x, a.pos.y, 76);
    if (burst) {
      g.lineStyle(5, ART.aura, .84).strokeCircle(a.pos.x, a.pos.y, 37 + 5 * Math.sin(a.clock / 145));
      g.lineStyle(2, 0xfff8e7, .72).strokeCircle(a.pos.x, a.pos.y, 45);
    }
    // A small golden risk burst while holding FLEX; game logic is unchanged.
    if (charging) {
      const p = a.flex.progress(a.clock);
      for (let i=0;i<4;i++) {
        const angle = i * Math.PI/2 + a.clock/500;
        g.fillStyle(ART.aura, .6+p*.4).fillRect(a.pos.x+Math.cos(angle)*31-3,a.pos.y+Math.sin(angle)*31-3,6,6);
      }
    }

    this.hud[0].setText(`HP ${Math.ceil(a.hp)}/${stats.maxHp}`);
    this.hud[1].setText(`AURA ${a.aura.value}/100 · ${a.aura.rank}`);
    this.hud[2].setText(`LVL ${a.xp.level}`);
    this.hud[3].setText(`WAVE ${a.wave}/5 · ${Math.max(0, Math.ceil((GAME.waveDurationMs - a.waveClock) / 1000))}s`);
    this.bar(24, 40, 180, a.hp / stats.maxHp, ART.hostile);
    this.bar(245, 40, 270, a.aura.value / 100, burst ? ART.aura : ART.hoodie);
    this.bar(565, 40, 140, a.xp.xp / xpToNextLevel(a.xp.level), ART.xp);
    this.bar(745, 40, 190, 1 - a.waveClock / GAME.waveDurationMs, 0x2cb4c7);
    // Consistent segmented bars make HP, Aura and wave time readable at a glance.
    for (const [x,w,n] of [[24,180,5],[245,270,5],[565,140,5],[745,190,5]]) {
      g.lineStyle(1,0xfff8e7,.64);
      for(let j=1;j<n;j++) g.lineBetween(x+w*j/n,40,x+w*j/n,50);
    }
    const flex = charging ? `CHARGING · ${a.nearby}/3` : a.flex.isReady(a.clock) ? `READY · ${a.nearby}/3 nearby` : `${a.flex.secondsUntilReady(a.clock)}s`;
    const focus = a.clock < a.focusUntil ? 'ACTIVE' : a.clock >= a.focusReady ? 'READY' : `${Math.ceil((a.focusReady - a.clock) / 1000)}s`;
    this.status.setColor('#fff8e7').setText(`E FLEX: ${flex}       SPACE FOCUS: ${focus}       ${burst ? `BURST ${Math.ceil((a.aura.burstUntil - a.clock) / 1000)}s · +20% damage` : `${a.kills} kills · collect green XP crystals`}`);
    this.feedback.setVisible(a.mode === 'playing').setText(a.clock < a.feedbackUntil ? a.feedback : a.wave === 5 && !a.bossDefeated && a.waveClock >= GAME.waveDurationMs ? 'Defeat the BIG HATER to finish!' : '');
    this.debug.setText(this.debugVisible ? `${Math.round(this.game.loop.actualFps)} FPS\n${a.enemies.length} enemies / ${a.shots.length} projectiles\n${a.clock.toFixed(0)} ms · ${a.mode}` : '');
    let message = '';
    if (a.mode === 'intro') message = touchControls.visible
      ? 'AURA FARMER\nNO AURA? SKILL ISSUE.\n\nDrag the joystick to move · auto-attack\nTap FLEX near 3 enemies · FOCUS slows enemies\nCollect XP, upgrade, and defeat the BIG HATER.\n\nTap PLAY below to start'
      : 'AURA FARMER\nNO AURA? SKILL ISSUE.\n\nWASD / arrow keys to move · auto-attack\nE: FLEX with 3 nearby enemies · SPACE: slow enemies\nCollect XP, choose upgrades, and defeat the BIG HATER.\n\nPress ENTER to start';
    if (a.mode === 'upgrades') message = `LEVEL UP · CHOOSE YOUR BUFF\nGame paused · ${a.pendingUpgrades} upgrade(s) left\n\n${a.choices.map((b, i) => `[${i + 1}] ${b.name} · ${a.buffs[b.id] + 1}/${b.maxStacks}\n${b.description}`).join('\n\n')}`;
    if (a.mode === 'between') message = `WAVE ${a.wave} COMPLETE\n\n${a.kills} kills · Level ${a.xp.level}\n+20 HP next wave\n\nPress ENTER to continue`;
    if (a.mode === 'dead') message = `YOU ARE COOKED\n\nWave ${a.wave}/5 · ${a.kills} kills\n\nPress ENTER to try again`;
    if (a.mode === 'win') message = `GOD AURA — VICTORY!\n\nBIG HATER defeated · 5 waves cleared\n${a.kills} kills · Level ${a.xp.level}\n\nPress ENTER to play again`;
    this.buffIcons.forEach(icon => icon.setVisible(false));
    for (const [i,buff] of BUFFS.filter(b => a.buffs[b.id] > 0).slice(0,this.buffIcons.length).entries()) {
      const image = this.buffIcons[i];
      image.setTexture('spr-icons', BUFFS.findIndex(b => b.id === buff.id));
      image.setPosition(30 + 29*i, 108).setVisible(true);
    }
    this.modalBg.clear();
    if (message) {
      this.modalBg.fillStyle(0x302747, .72).fillRect(0, 82, 960, 518);
      this.modalBg.fillStyle(0x44345f, .98).fillRoundedRect(110, 118, 740, 438, 18);
      this.modalBg.lineStyle(3, 0xffcc51).strokeRoundedRect(110, 118, 740, 438, 18);
    }
    if (touchControls.visible) {
      if (a.mode === 'upgrades') message += '\n\nTap a buff button below.';
      if (a.mode === 'between' || a.mode === 'dead' || a.mode === 'win') {
        message = message.replace(/Press ENTER[^\n]*/g, 'Use the button below to continue');
      }
    }
    touchControls.setMode(a.mode, a.choices);
    this.overlay.setPosition(480, 337).setFontSize(a.mode === 'upgrades' ? 18 : 20).setText(message);
  }
}
