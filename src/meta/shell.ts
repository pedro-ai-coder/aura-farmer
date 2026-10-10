import type Phaser from 'phaser';
import type { ArenaScene } from '../game/scenes/ArenaScene';
import { CHARACTERS, getCharacter, type CharacterId } from '../game/data/characters';
import { ACHIEVEMENTS, personalBest, readProfile, recordRun, newProfile, writeProfile, type AchievementId, type ProfileV1, type RunResult } from './profile';

type Screen = 'home'|'characters'|'achievements'|'leaderboards'|'settings'|'pause'|'exit'|'reset'|'results'|null;
export class GameShell {
  private profile: ProfileV1 = readProfile();
  private root = document.querySelector<HTMLElement>('#meta-shell')!;
  private menuButton = document.querySelector<HTMLButtonElement>('#menu-open')!;
  private screen: Screen = 'home';
  private lastResult?: RunResult;
  private awarded: AchievementId[] = [];
  private newCharacters: CharacterId[] = [];
  private statusMessage = '';
  private previousMode = 'intro';
  private readonly scene: ArenaScene;

  constructor(game: Phaser.Game) {
    this.scene = game.scene.getScene('ArenaScene') as ArenaScene;
    this.root.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-menu]');
      if (button) this.handle(button.dataset.menu ?? '', button.dataset.character);
    });
    this.menuButton.addEventListener('click', () => {
      if (this.screen === null) { this.scene.setPaused(true); this.screen='pause'; this.render(); }
    });
    window.addEventListener('aura:run-finished', (event: Event) => {
      this.finish((event as CustomEvent<RunResult>).detail);
    });
    window.addEventListener('aura:mode', (event: Event) => {
      const mode = (event as CustomEvent<string>).detail;
      if (mode === 'playing' && ['intro','dead','win'].includes(this.previousMode)) {
        this.screen = null; this.render();
      }
      this.previousMode = mode;
    });
    document.documentElement.classList.toggle('reduce-game-motion',this.profile.settings.reduceMotion);
    this.render();
  }

  private get unlocked(): Set<CharacterId> { return new Set(this.profile.unlockedCharacters); }
  private finish(result: RunResult): void {
    if (this.lastResult?.id === result.id) return;
    const recorded = recordRun(this.profile,result);
    this.profile = recorded.profile; this.awarded=recorded.gained;
    this.newCharacters=recorded.unlocked; this.lastResult=result;
    this.statusMessage=writeProfile(this.profile)?'':'Saving unavailable; progress is temporary.';
    this.screen='results'; this.render();
  }
  private save(): void {
    this.statusMessage=writeProfile(this.profile)?'':'Progress could not be saved on this device.';
  }
  private start(): void {
    if (!this.unlocked.has(this.profile.selectedCharacterId)) return;
    this.scene.setPaused(false);
    this.scene.startRun(this.profile.selectedCharacterId);
    this.lastResult=undefined; this.screen=null; this.render();
  }
  private handle(action: string, character?: string): void {
    if (action === 'home') { this.scene.setPaused(false); this.screen='home'; this.render(); return; }
    if (['characters','achievements','leaderboards','settings'].includes(action)) {
      this.screen=action as Screen; this.render(); return;
    }
    if (action==='fullscreen') { document.querySelector<HTMLButtonElement>('#fullscreen-toggle')?.click();return; }
    if (action==='choose' && character) {
      const c=CHARACTERS.find(x=>x.id===character);
      if (!c || !this.unlocked.has(c.id)) return;
      this.profile.selectedCharacterId=c.id; this.save(); this.render();return;
    }
    if (action==='play') {this.screen='characters';this.render();return;}
    if (action==='start'||action==='retry') {this.start();return;}
    if (action==='resume') {this.scene.setPaused(false);this.screen=null;this.render();return;}
    if (action==='exit'||action==='reset') {this.screen=action;this.render();return;}
    if (action==='confirm-exit') {this.scene.setPaused(false);this.scene.resetToIntro();this.screen='home';this.render();return;}
    if (action==='confirm-reset') {this.profile=newProfile();this.save();this.screen='settings';this.render();return;}
    if (action==='reduce-motion') {
      this.profile.settings.reduceMotion=!this.profile.settings.reduceMotion;
      document.documentElement.classList.toggle('reduce-game-motion',this.profile.settings.reduceMotion);
      this.save();this.render();
    }
  }
  private button(action:string,label:string,style=''):string {
    return `<button type="button" class="meta-button ${style}" data-menu="${action}">${label}</button>`;
  }
  private header(label:string):string {
    return `<header class="meta-header"><span>AURA <b>FARMER</b></span><small>${label}</small></header>`;
  }
  private inner():string {
    switch(this.screen) {
      case 'home': {
        const c=getCharacter(this.profile.selectedCharacterId);
        return this.header('NO AURA? SKILL ISSUE.')+`<h1>MAIN CHARACTER ENERGY</h1>
          <p class="meta-sub">Welcome back. Progress saves on this device.</p>
          <div class="meta-feature"><span class="meta-avatar" style="--avatar:${c.cssColor}">★</span>
          <div><strong>${c.name}</strong><small>${c.role} · ${this.profile.runHistory.length} runs</small></div></div>
          <div class="meta-menu">${this.button('play','▶ PLAY CLASSIC','primary')}
          ${this.button('characters','CHARACTERS')}${this.button('achievements','ACHIEVEMENTS')}
          ${this.button('leaderboards','LEADERBOARDS')}${this.button('settings','SETTINGS')}
          ${this.button('fullscreen','⛶ FULL SCREEN','mobile-meta')}</div>
          <p class="meta-foot">GUEST · OFFLINE SAVE · NO LOGIN REQUIRED</p>`;
      }
      case 'characters': {
        const selected=this.profile.selectedCharacterId;
        const cards=CHARACTERS.map(c=>{
          const unlocked=this.unlocked.has(c.id);
          return `<button type="button" class="meta-character ${selected===c.id?'selected':''}" data-menu="choose"
            data-character="${c.id}" ${unlocked?'':'disabled'} aria-pressed="${selected===c.id}" style="--avatar:${c.cssColor}">
            <span class="meta-avatar">★</span><strong>${c.name}</strong>
            <small>${c.role} · ${c.difficulty}</small>
            <span class="meta-character-description">${unlocked?c.passive:'🔒 '+c.unlockedBy}</span></button>`;
        }).join('');
        return this.header('CHOOSE YOUR FARMER')+`<div class="meta-grid characters">${cards}</div>
          <p class="meta-sub">${getCharacter(selected).description} · ${getCharacter(selected).weapon}</p>
          <div class="meta-actions">${this.button('home','BACK')}${this.button('start','START RUN →','primary')}</div>`;
      }
      case 'achievements': return this.header('ACHIEVEMENTS')+
        `<p class="meta-sub">${this.profile.achievements.length}/${ACHIEVEMENTS.length} unlocked · Saved on this device</p>
        <div class="meta-achievements">`+ACHIEVEMENTS.map(a=>`<div class="meta-achievement">
        <span>${this.profile.achievements.includes(a.id)?'🏆':'◇'}</span><div><strong>${a.name}</strong>
        <small>${a.description}</small></div></div>`).join('')+
        `</div><div class="meta-actions">${this.button('home','BACK')}</div>`;
      case 'leaderboards': {
        const best=personalBest(this.profile);
        const history=[...this.profile.runHistory].sort((a,b)=>b.score-a.score).slice(0,8);
        return this.header('LEADERBOARDS')+`<h2>LOCAL PERSONAL BESTS</h2>
        <p class="meta-sub">Offline scores are unverified. Public global rankings require server validation.</p>
        <div class="meta-leaderboard"><div class="meta-row"><b>#</b><b>CHARACTER</b><b>SCORE</b></div>`+
        history.map((r,i)=>`<div class="meta-row"><span>${i+1}</span><span>${getCharacter(r.characterId).name}</span><strong>${r.score}</strong></div>`).join('')+
        `</div><p class="meta-sub">Personal best: ${best?.score??0} · Online rankings: COMING SOON</p>
        <div class="meta-actions">${this.button('home','BACK')}</div>`;
      }
      case 'settings': return this.header('SETTINGS')+`
        <p class="meta-sub">Progress is saved locally. Clearing browser data can erase it.</p>
        <div class="meta-actions">${this.button('reduce-motion',this.profile.settings.reduceMotion?'✓ REDUCED MOTION':'REDUCE MOTION')}
        ${this.button('reset','RESET LOCAL PROGRESS')}</div>
        <div class="meta-actions">${this.button('home','BACK')}</div>`;
      case 'pause': return this.header('PAUSED')+`<h1>TAKE AN AURA BREAK</h1>
        <p class="meta-sub">Combat is paused.</p><div class="meta-actions">
        ${this.button('resume','RESUME','primary')}${this.button('exit','QUIT RUN')}</div>`;
      case 'exit': return this.header('QUIT RUN?')+`<h1>YOUR RUN WILL BE LOST</h1>
        <div class="meta-actions">${this.button('resume','KEEP PLAYING','primary')}
        ${this.button('confirm-exit','QUIT TO HOME')}</div>`;
      case 'reset': return this.header('DELETE LOCAL PROGRESS?')+`<p>All achievements and unlocks on this device will be deleted.</p>
        <div class="meta-actions">${this.button('settings','CANCEL','primary')}
        ${this.button('confirm-reset','DELETE SAVE')}</div>`;
      case 'results': {
        const r=this.lastResult;
        if(!r) return this.header('RESULTS');
        const earned=this.awarded.map(id=>ACHIEVEMENTS.find(a=>a.id===id)?.name).join(', ');
        return this.header(r.won?'GOD AURA!':'GAME OVER')+
        `<h1>${r.won?'BIG HATER DEFEATED!':'SKILL ISSUE. RUN IT BACK.'}</h1>
        <p class="meta-sub">${getCharacter(r.characterId).name} · WAVE ${r.wave}/5 · SCORE ${r.score}</p>
        <div class="meta-stat-grid"><div>KILLS <b>${r.kills}</b></div><div>LEVEL <b>${r.level}</b></div>
        <div>FLEX WINS <b>${r.flexSuccesses}</b></div><div>XP <b>${r.xpCollected}</b></div>
        <div>MAX AURA <b>${r.maxAura}</b></div><div>TIME <b>${Math.floor(r.durationMs/1000)}s</b></div></div>
        ${earned?`<p class="meta-rewards">🏆 New achievements: ${earned}</p>`:''}
        ${this.newCharacters.length?`<p class="meta-rewards">NEW CHARACTER: ${this.newCharacters.map(id=>getCharacter(id).name).join(', ')}</p>`:''}
        <div class="meta-actions">${this.button('home','HOME')}${this.button('retry','RETRY','primary')}</div>`;
      }
      default:return '';
    }
  }
  private render():void {
    this.root.hidden=this.screen===null;
    this.menuButton.hidden=this.screen!==null;
    if(this.screen===null){this.root.innerHTML='';return;}
    this.root.innerHTML=`<div class="meta-panel">${this.inner()}${this.statusMessage?`<p role="status" class="meta-warning">${this.statusMessage}</p>`:''}</div>`;
  }
}
export function setupGameShell(game:Phaser.Game):void {new GameShell(game);}
