import Phaser from 'phaser';
import { Arena } from '../core/arena';
import { GAME } from '../core/constants';
import { BUFFS } from '../data/buffs';
import { xpToNextLevel } from '../core/progression';
import { touchControls } from '../input/touchControls';
import { ART, PixelWorld } from '../render/pixelArt';
import { preloadCartoonArt, isCartoonArt } from '../render/cartoonArt';
import { drawRuinAlley } from '../render/ruinAlleyArt';
import { drawVariantWorld } from '../render/worldVariantsArt';
import { selectedWorldFromQuery } from '../core/worldSelection';
import { drawHudChrome, drawHudMeter } from '../render/hudArt';
import { isGateA, drawGateAHudChrome, drawGateAHudMeter } from '../render/gateAArena';
import { isFinalArt } from '../render/finalArt';
import type { CharacterId } from '../data/characters';
import { runResult } from '../../meta/profile';

export class ArenaScene extends Phaser.Scene {
  readonly arena = new Arena(Math.random, 'sigma', isCartoonArt() ? selectedWorldFromQuery(window.location.search) : null);
  private g!: Phaser.GameObjects.Graphics;
  private worldFx!: Phaser.GameObjects.Graphics;
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
  private notifiedWave = 0;
  private notifiedBurstEnd = 0;
  private pendingKeys = new Set<string>();
  private lastWaveUi = '';

  constructor() { super('ArenaScene'); }

  preload(): void {
    preloadCartoonArt(this);
    const loading=document.querySelector<HTMLElement>('#af-loading');
    const track=loading?.querySelector<HTMLElement>('[role="progressbar"]');
    const fill=document.querySelector<HTMLElement>('#af-loading-fill');
    this.load.on('progress',(fraction:number)=>{
      const value=Math.round(fraction*100);
      if(fill) fill.style.width=value+'%';
      track?.setAttribute('aria-valuenow',String(value));
    });
    this.load.once('complete',()=>{ if(loading) loading.hidden=true; });
    // Original static PNG sprite sheets shipped with the application.
    // Keep px-* runtime textures available as an explicit fallback.
    for (const [key, frame] of [
      ['sigma', 48], ['sigma-b1',48], ['alpha-b2',48], ['rizzler-b3',48], ['npc', 48], ['hater', 48],
      ['beta', 64], ['boss', 128], ['items', 16], ['icons', 16],
      ['alpha',48], ['rizzler',48], ['ohio',48], ['fanum',48], ['six-seven',48],
    ] as const) {
      this.load.spritesheet('spr-' + key, 'assets/pixel/' + key + '.png', {
        frameWidth: frame, frameHeight: frame,
      });
    }
  }

  create(): void {
    document.querySelector<HTMLElement>('.play-layout')?.setAttribute('data-map',this.arena.world?.id ?? 'classic');
    if(this.arena.world){
      if(this.arena.world.id==='ruin-alley')drawRuinAlley(this,this.arena.world);
      else drawVariantWorld(this,this.arena.world);
      this.cameras.main.setBounds(0,0,this.arena.world.width,this.arena.world.height);
    }
    this.pixelWorld = new PixelWorld(this,this.arena.world);
    this.worldFx = this.add.graphics().setDepth(1.65);
    this.g = this.add.graphics().setDepth(1.8).setScrollFactor(0);
    this.modalBg = this.add.graphics().setDepth(4).setScrollFactor(0);
    if (this.textures.exists('spr-icons')) {
      this.buffIcons = Array.from({ length: 16 }, () =>
        this.add.image(0,0,'spr-icons',0).setDepth(3).setScrollFactor(0).setScale(1.5).setVisible(false));
    }
    this.hud = [66, 274, 591, 780].map(x => this.label(x, 14, 15));
    this.status = this.label(44, 65, 12);
    this.overlay = this.label(480, 300, 20).setOrigin(.5).setAlign('center').setWordWrapWidth(650).setLineSpacing(12).setDepth(5);
    this.feedback = this.label(480, 559, 15).setOrigin(.5).setDepth(3);
    this.debug = this.label(940, 111, 12).setOrigin(1, 0).setDepth(3);
    for (const t of [...this.hud, this.status, this.feedback, this.debug]) t.setColor('#fff8e7');
    this.overlay.setDepth(5).setColor('#fff8e7');
    this.keyboard = this.input.keyboard!.addKeys('W,A,S,D,UP,DOWN,LEFT,RIGHT,E,ONE,TWO,THREE,ENTER,F3') as Record<string, Phaser.Input.Keyboard.Key>;
    for (const [name, key] of Object.entries(this.keyboard)) {
      key.on('down', () => this.pendingKeys.add(name));
    }
    this.game.events.on(Phaser.Core.Events.BLUR, this.clearKeys, this);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.game.events.off(Phaser.Core.Events.BLUR, this.clearKeys, this));
  }

  setPaused(value: boolean): void {
    this.paused = value;
    if (value) {
      // A key pressed just before pause must never fire on resume.
      // Likewise a held joystick must not keep moving behind a menu.
      touchControls.clear();
      this.clearKeys();
    }
  }
  startRun(characterId: CharacterId): void {
    this.arena.start(characterId);
    this.reportedRun=false;this.paused=false;
    // Spotlight event counters belong to a run, not the entire Phaser Scene.
    this.notifiedBurstEnd=0;
    this.notifiedWave=0;
    this.lastWaveUi='';
  }
  resetToIntro(): void { this.arena.start(); this.arena.mode = 'intro'; this.reportedRun=false; this.paused=false; }

  update(_time: number, delta: number): void {
    if (this.paused) { touchControls.clear(); this.clearKeys(); return; }
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
      confirm: just('ENTER') || touch.confirm,
      choice: one ? 0 : two ? 1 : three ? 2 : touch.choice,
    });
    if(this.arena.world) {
      const map=this.arena.world;
      this.cameras.main.setScroll(
        Phaser.Math.Clamp(this.arena.pos.x-GAME.width/2,0,map.width-GAME.width),
        Phaser.Math.Clamp(this.arena.pos.y-GAME.height/2,0,map.height-GAME.height));
    }
    this.draw();
    this.pixelWorld.sync(this.arena);
    if(this.arena.mode==='playing' && this.notifiedWave!==this.arena.wave){
      this.notifiedWave=this.arena.wave;
      window.dispatchEvent(new CustomEvent('aura:wave',{detail:this.arena.wave}));
    }
    if(this.arena.mode==='playing' && this.arena.auraBursts>this.notifiedBurstEnd){
      this.notifiedBurstEnd=this.arena.auraBursts;
      window.dispatchEvent(new CustomEvent('aura:burst',{detail:this.arena.flexName}));
    }
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
    return this.add.text(x, y, '', { fontFamily: 'Arial, sans-serif', fontSize: size, fontStyle: 'bold', color: '#fff6e8' }).setDepth(2).setScrollFactor(0);
  }

  private draw(): void {
    const a = this.arena, g = this.g, fx = this.worldFx, stats = a.stats;
    g.clear();fx.clear();
    if(isGateA() || isFinalArt()) drawGateAHudChrome(g);
    else drawHudChrome(g);
    // The light Lavender Pop arena and all character/projectile textures are
    // cached once; Phaser Graphics only draws warnings, HUD and combat FX.
    const charging = a.flexActive, burst = a.flexActive;
    if (a.clock < a.effects.rizzPulseUntil) fx.lineStyle(3, 0xff9edc, .7).strokeCircle(a.pos.x, a.pos.y, 145);
    if (a.clock < a.effects.invulnerableUntil) fx.lineStyle(3, 0xafffea, .8).strokeCircle(a.pos.x, a.pos.y, 27);
    if(burst&&(a.characterId==='cool-kid'||a.characterId==='alpha')){
      fx.lineStyle(5,0xffcc55,.95).strokeCircle(a.pos.x,a.pos.y,32+Math.sin(a.clock/90)*3);
      fx.lineStyle(3,0xfff3c6,.9).strokeCircle(a.pos.x,a.pos.y,45);
    }
    if(burst&&a.flexVariant==='sigma'){
      fx.lineStyle(2,0x79eaf8,.65).strokeCircle(a.pos.x,a.pos.y,56);
      fx.lineStyle(2,0xc3ffff,.7).strokeCircle(a.pos.x,a.pos.y,62);
    }
    if(burst&&a.characterId==='rizzler')fx.lineStyle(3,0xeb9afa,.7).strokeCircle(a.pos.x,a.pos.y,220);
    if(charging){
      fx.lineStyle(4,0xffd574,.85).strokeCircle(a.pos.x,a.pos.y,35);
    }
    if (a.clock < a.jawUntil) fx.lineStyle(6, 0xaaf1cf, .7).strokeCircle(a.pos.x, a.pos.y,
      90+Math.max(0,a.buffs['mewing-jaw']-1)*10);
    if(a.clock<a.rizzBlastUntil){
      fx.fillStyle(0xb760e5,.10).fillCircle(a.pos.x,a.pos.y,a.rizzBlastRadius);
      fx.lineStyle(5,0xe6a8fa,.85).strokeCircle(a.pos.x,a.pos.y,a.rizzBlastRadius);
    }
    if (a.buffs['ohio-orbiter']) fx.lineStyle(1, 0x8b5bd8, .45).strokeCircle(a.pos.x, a.pos.y, 76);
    if (burst) {
      fx.lineStyle(5, ART.aura, .84).strokeCircle(a.pos.x, a.pos.y, 37 + 5 * Math.sin(a.clock / 145));
      fx.lineStyle(2, 0xfff8e7, .72).strokeCircle(a.pos.x, a.pos.y, 45);
    }
    // Readable orbiting sparks identify the five-second FLEX window.
    if (charging) {
      const p = 1-a.flex.progress(a.clock);
      for (let i=0;i<4;i++) {
        const angle = i * Math.PI/2 + a.clock/500;
        fx.fillStyle(ART.aura, .6+p*.4).fillRect(a.pos.x+Math.cos(angle)*31-3,a.pos.y+Math.sin(angle)*31-3,6,6);
      }
    }

    this.hud[0].setText(`HP ${Math.ceil(a.hp)}/${stats.maxHp}`);
    this.hud[1].setText(`AURA ${a.aura.value}/100 · ${a.flex.state==='ready'?'FLEX READY':a.flexActive?'FLEX ACTIVE':a.aura.rank}`);
    this.hud[2].setText(`LVL ${a.xp.level}`);
    this.hud[3].setText(`WAVE ${a.wave}/5 · ${Math.max(0, Math.ceil((GAME.waveDurationMs - a.waveClock) / 1000))}s`);
    const meter=isGateA() || isFinalArt() ? drawGateAHudMeter : drawHudMeter;
    meter(g,66,139,a.hp / stats.maxHp,0xff697a);
    meter(g,274,241,a.aura.value / 100,a.flex.state==='ready'?0xffd15d:0xc48bfa);
    meter(g,591,111,a.xp.xp / xpToNextLevel(a.xp.level),0x36cd94);
    meter(g,780,153,1 - a.waveClock / GAME.waveDurationMs,0x57c7ee);
    touchControls.setLoadoutHUD(a.mode,a.buffs);
    const flex=charging?`${a.flexName} · ${(a.flex.remaining(a.clock)/1000).toFixed(1)}s`:
      a.flex.isReady()?`FLEX READY · PRESS E · ${a.flexName}`:
      `FARM AURA ${a.aura.value}/100 · ${a.flexName}`;
    this.status.setColor(a.flex.isReady()?'#ffdb6d':'#fff8e7')
      .setText(`${a.kills} KILLS · ${a.world ? a.world.name + ' · ' : ''}${a.loadout.weapons.length}/3 WEAPONS · ${a.loadout.passives.length}/5 PASSIVES · ${flex}`);
    touchControls.setFlexHUD(a.mode,a.aura.value,a.flex.state,a.flexName,a.flex.remaining(a.clock),a.flexVariant);
    this.feedback.setVisible(a.mode === 'playing').setText(a.clock < a.feedbackUntil ? a.feedback : a.wave === 5 && !a.bossDefeated && a.waveClock >= GAME.waveDurationMs ? 'Defeat the BIG HATER to finish!' : '');
    this.debug.setText(this.debugVisible ? `${Math.round(this.game.loop.actualFps)} FPS\n${a.enemies.length} enemies / ${a.shots.length} projectiles\n${a.clock.toFixed(0)} ms · ${a.mode}` : '');
    let message = '';
    if (a.mode === 'intro') message = touchControls.visible
      ? 'AURA FARMER\nNO AURA? SKILL ISSUE.\n\nDrag joystick · auto-attack\nFarm Aura, then tap FLEX READY for your ultimate.\nCollect XP, evolve builds, defeat BIG HATER.\n\nTap PLAY below to start'
      : 'AURA FARMER\nNO AURA? SKILL ISSUE.\n\nWASD / arrows to move · auto-attack\nFarm Aura to 100 · E activates your FLEX Ultimate\nCollect XP, evolve builds, defeat BIG HATER.\n\nPress ENTER to start';
    // Level Up is presented entirely by the HTML dialog, never a second Phaser modal.
    // Between-wave celebration belongs to the single responsive HTML layer.
    if (a.mode === 'dead') message = `YOU ARE COOKED\n\nWave ${a.wave}/5 · ${a.kills} kills\n\nPress ENTER to try again`;
    if (a.mode === 'win') message = `GOD AURA — VICTORY!\n\nBIG HATER defeated · 5 waves cleared\n${a.kills} kills · Level ${a.xp.level}\n\nPress ENTER to play again`;
    // The HTML GameShell owns HOME, PAUSE and RESULTS. Do not display an
    // additional Phaser modal underneath it, especially on narrow phones.
    if (document.querySelector<HTMLElement>('#meta-shell')?.hidden === false) {
      message = '';
    }
    this.buffIcons.forEach(icon => icon.setVisible(false));
    for (const [i,buff] of BUFFS.filter((b,index) => index<16 && a.buffs[b.id] > 0).slice(0,this.buffIcons.length).entries()) {
      const image = this.buffIcons[i];
      image.setTexture('spr-icons', BUFFS.findIndex(b => b.id === buff.id));
      image.setPosition(isGateA() ? 33 + 28*i : 30 + 29*i, isGateA() ? 120 : 108).setVisible(true);
    }
    this.modalBg.clear();
    if (message) {
      this.modalBg.fillStyle(0x0c1425, .72).fillRect(0, 82, 960, 518);
      this.modalBg.fillStyle(0x132841, .98).fillRoundedRect(110, 118, 740, 438, 18);
      this.modalBg.lineStyle(3, 0xe9ac54).strokeRoundedRect(110, 118, 740, 438, 18);
    }
    if (touchControls.visible) {
      if (a.mode === 'between' || a.mode === 'dead' || a.mode === 'win') {
        message = message.replace(/Press ENTER[^\n]*/g, 'Use the button below to continue');
      }
    }
    touchControls.setMode(a.mode, a.choices, a.buffs, a.pendingUpgrades);
    if(a.mode==='between'){
      const key=`${a.wave}:${a.kills}:${a.xp.level}`;
      if(key!==this.lastWaveUi){
        this.lastWaveUi=key;
        document.querySelector<HTMLElement>('#wave-title')!.textContent=`WAVE ${a.wave} COMPLETE`;
        document.querySelector<HTMLElement>('#wave-stats')!.textContent=`${a.kills} kills · Level ${a.xp.level}`;
      }
    }
    this.overlay.setPosition(480, 337).setFontSize(a.mode === 'upgrades' ? 18 : 20).setText(message);
  }
}
