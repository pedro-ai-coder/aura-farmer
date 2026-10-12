import {BUFFS,type BuffDefinition,type BuffLevels} from '../data/buffs';
import {equipment,isWeapon,MAX_PASSIVE_SLOTS,MAX_WEAPON_SLOTS} from '../core/equipment';
import type { Controls, Mode } from '../core/arena';
import type { FlexState,FlexVariant } from '../core/flex';

type TouchAction = 'flex' | 'confirm' | 'choice0' | 'choice1' | 'choice2';

/**
 * HTML touch overlay. Inputs are buffered between render frames so a quick tap
 * isn't lost if it starts and ends before Phaser's next update.
 * The simulation (Arena) remains completely input-device independent.
 */
export class TouchControls {
  private stick = document.querySelector<HTMLElement>('#joystick-track')!;
  private thumb = document.querySelector<HTMLElement>('#joystick-thumb')!;
  private stickBox = document.querySelector<HTMLElement>('#touch-stick')!;
  private playActions = document.querySelector<HTMLElement>('#touch-play-actions')!;
  private confirmActions = document.querySelector<HTMLElement>('#touch-confirm-actions')!;
  private upgradeOverlay = document.querySelector<HTMLElement>('#upgrade-overlay')!;
  private waveOverlay = document.querySelector<HTMLElement>('#wave-overlay')!;
  private upgradeSubtitle = document.querySelector<HTMLElement>('#upgrade-subtitle')!;
  private stage = document.querySelector<HTMLElement>('.play-layout')!;
  private confirmButton = document.querySelector<HTMLButtonElement>('#touch-confirm')!;
  private upgradeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-game-action^="choice"]'));
  private pointerId: number | null = null;
  private x = 0;
  private y = 0;
  private pressed = new Set<TouchAction>();
  private displayState = '';
  private flexRoot=document.querySelector<HTMLElement>('#flex-ultimate-hud')!;
  private flexBar=document.querySelector<HTMLElement>('#flex-ultimate-fill')!;
  private flexNameElement=document.querySelector<HTMLElement>('#flex-ultimate-name')!;
  private flexCount=document.querySelector<HTMLElement>('#flex-ultimate-count')!;
  private flexEffect=document.querySelector<HTMLElement>('#flex-ultimate-effect')!;
  private flexButton=document.querySelector<HTMLButtonElement>('[data-game-action="flex"]')!;
  private lastFlexState='';
  private loadoutRoot=document.querySelector<HTMLElement>('#loadout-hud')!;
  private loadoutLast='';

  get visible(): boolean {
    return window.matchMedia('(pointer: coarse), (max-width: 900px)').matches;
  }

  constructor() {
    document.querySelectorAll<HTMLButtonElement>('[data-game-action]').forEach(button => {
      button.addEventListener('click', () => this.pressed.add(button.dataset.gameAction as TouchAction));
    });

    this.stick.addEventListener('pointerdown', event => {
      if (this.pointerId !== null || event.button > 0) return;
      event.preventDefault();
      this.pointerId = event.pointerId;
      this.stick.setPointerCapture(event.pointerId);
      this.moveStick(event.clientX, event.clientY);
    });
    this.stick.addEventListener('pointermove', event => {
      if (event.pointerId === this.pointerId) {
        event.preventDefault();
        this.moveStick(event.clientX, event.clientY);
      }
    });
    const stop = (event: PointerEvent) => {
      if (event.pointerId !== this.pointerId) return;
      this.resetStick();
    };
    this.stick.addEventListener('pointerup', stop);
    this.stick.addEventListener('pointercancel', stop);
    this.stick.addEventListener('lostpointercapture', stop);
    window.addEventListener('blur', () => this.clear());
    window.addEventListener('pagehide', () => this.clear());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.clear();
    });
  }

  private moveStick(clientX: number, clientY: number): void {
    const rect = this.stick.getBoundingClientRect();
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    const length = Math.hypot(dx, dy);
    const radius = Math.min(rect.width, rect.height) * 0.36;
    const scale = length === 0 ? 0 : Math.min(1, length / radius);
    // Small dead zone avoids drift when the player's finger rests at center.
    const strength = Math.max(0, (scale - 0.12) / 0.88);
    this.x = length ? dx / length * strength : 0;
    this.y = length ? dy / length * strength : 0;
    this.thumb.style.transform = `translate(calc(-50% + ${this.x * radius}px), calc(-50% + ${this.y * radius}px))`;
  }

  private resetStick(): void {
    this.pointerId = null;
    this.x = 0;
    this.y = 0;
    this.thumb.style.transform = 'translate(-50%, -50%)';
  }

  clear(): void {
    this.resetStick();
    this.pressed.clear();
  }

  consume(): Controls {
    const actions = this.pressed;
    this.pressed = new Set<TouchAction>();
    const choice = actions.has('choice0') ? 0 : actions.has('choice1') ? 1 : actions.has('choice2') ? 2 : undefined;
    return { x: this.x, y: this.y, flex: actions.has('flex'), confirm: actions.has('confirm'), choice };
  }

  setFlexHUD(mode:Mode,charge:number,state:FlexState,name:string,
    remaining:number,affinity:FlexVariant,effect:string):void{
    const visible=mode==='playing';
    this.flexRoot.hidden=!visible;
    if(!visible){this.lastFlexState='';return;}
    const progress=state==='active'?remaining/5000:charge/100;
    this.flexBar.style.width=Math.max(0,Math.min(100,progress*100)).toFixed(1)+'%';
    this.flexRoot.dataset.state=state;this.flexRoot.dataset.affinity=affinity;
    this.flexNameElement.textContent=name;
    this.flexEffect.textContent=effect;
    this.flexRoot.title=name+' — '+effect;
    this.flexCount.textContent=state==='active'?(remaining/1000).toFixed(1)+'s':
      state==='ready'?'FLEX READY':charge+'/100 AURA';
    const key=state+':'+name+':'+affinity+':'+effect;
    if(key!==this.lastFlexState){
      this.lastFlexState=key;
      this.flexButton.disabled=state!=='ready';
      this.flexButton.dataset.state=state;
      this.flexButton.textContent=state==='ready'?'FLEX!':state==='active'?'ACTIVE':'FLEX';
      this.flexButton.setAttribute('aria-label',state==='ready'?'Activate '+name+': '+effect:
        state==='active'?name+' active':'FLEX charging');
    }
  }
  setLoadoutHUD(mode:Mode,levels:Readonly<BuffLevels>):void{
    this.loadoutRoot.hidden=mode!=='playing';
    if(mode!=='playing'){this.loadoutLast='';return;}
    const loadout=equipment(levels);
    const signature=[...loadout.weapons,...loadout.passives]
      .map(id=>id+':'+levels[id]).join('|');
    if(signature===this.loadoutLast)return;
    this.loadoutLast=signature;
    for(const [category,ids,max] of [
      ['weapons',loadout.weapons,MAX_WEAPON_SLOTS],
      ['passives',loadout.passives,MAX_PASSIVE_SLOTS]
    ] as const){
      const slotRoot=this.loadoutRoot.querySelector<HTMLElement>('[data-loadout="'+category+'"]')!;
      const count=this.loadoutRoot.querySelector<HTMLElement>('[data-loadout-count="'+category+'"]')!;
      count.textContent=ids.length+'/'+max;
      slotRoot.replaceChildren();
      for(let i=0;i<max;i++){
        const id=ids[i];
        const item=document.createElement('div');
        item.className='equipment-slot'+(id?' filled':' empty');
        if(id){
          const buff=BUFFS.find(b=>b.id===id)!;
          item.dataset.equipment=id;
          item.title=buff.name+' LV '+levels[id]+'/'+buff.maxStacks+' · '+buff.description;
          item.setAttribute('aria-label',item.title);
          const art=document.createElement('span');
          art.className='equipment-icon';
          art.textContent={
            'aura-shot':'✦','mewing-jaw':'✊','ohio-orbiter':'◉','six-seven':'67',
            'rizz-blast':'◈',drip:'⬡','thick-skin':'♥',speed:'»',mewing:'✧',
            alpha:'◆',sigma:'✦','locked-in':'↗','touch-grass':'✚',
            'rizz-aura':'◈',delulu:'◇','crash-out':'⚡',mogged:'★',
            'skibidi-bounce':'↝'
          }[id]??'✦';
          const title=document.createElement('span');
          title.className='equipment-name';
          title.textContent=buff.name;
          const lvl=document.createElement('span');
          lvl.className='equipment-level';
          lvl.textContent='LV '+levels[id]+'/'+buff.maxStacks;
          item.append(art,title,lvl);
        }else{
          item.setAttribute('aria-label','Empty '+(category==='weapons'?'weapon':'passive')+' slot');
          item.textContent='+';
        }
        slotRoot.append(item);
      }
    }
  }
  setMode(mode: Mode, choices: BuffDefinition[], stacks: Readonly<Partial<Record<BuffDefinition['id'],number>>> = {}, pendingUpgrades = 1): void {
    const key = `${mode}:${mode === 'upgrades'
      ? choices.map(c => `${c.id}:${stacks[c.id] ?? 0}`).join(',') + ':' + pendingUpgrades : ''}`;
    if (this.displayState === key) return;
    this.displayState = key;

    this.stickBox.hidden = mode !== 'playing';
    this.playActions.hidden = mode !== 'playing';
    this.upgradeOverlay.hidden = mode !== 'upgrades';
    this.waveOverlay.hidden = mode !== 'between';
    this.stage.classList.toggle('is-upgrading',mode === 'upgrades');
    this.stage.classList.toggle('is-between',mode === 'between');
    this.upgradeSubtitle.textContent = pendingUpgrades > 1
      ? `${pendingUpgrades} upgrades remaining · Choose one to continue`
      : 'Choose one upgrade to continue · Or press 1, 2 or 3';
    this.confirmActions.hidden = mode === 'playing' || mode === 'upgrades' || mode === 'between';
    if (mode !== 'playing') this.resetStick();

    this.confirmButton.textContent = mode === 'intro' ? 'PLAY' : mode === 'between' ? 'NEXT WAVE' : mode === 'dead' ? 'RETRY' : 'PLAY AGAIN';

    this.upgradeButtons.forEach((button, i) => {
      const buff = choices[i];
      button.hidden = !buff;
      if (!buff) return;
      const number = document.createElement('span');
      number.className='upgrade-number';
      number.textContent=String(i+1);
      const heading = document.createElement('strong');
      heading.className='upgrade-name';
      heading.textContent=buff.name;
      const rarity = document.createElement('span');
      rarity.className='upgrade-rarity';
      rarity.textContent=(isWeapon(buff.id)?'WEAPON':'PASSIVE')+' · '+buff.rarity;
      const level = document.createElement('span');
      level.className='upgrade-stack';
      level.textContent=`LV ${Math.min(buff.maxStacks,(stacks[buff.id] ?? 0) + 1)}/${buff.maxStacks}`;
      const description = document.createElement('span');
      description.className='upgrade-description';
      description.textContent=buff.description;
      const top = document.createElement('span');
      top.className='upgrade-top';
      top.append(number,rarity);
      const bottom = document.createElement('span');
      bottom.className='upgrade-bottom';
      bottom.append(heading,level);
      // A controlled icon mapping avoids guessing artwork from arbitrary labels.
      const glyphs:Record<string,string>={
        drip:'shield','thick-skin':'heart',delulu:'spirit',alpha:'blade',sigma:'orb',
        speed:'speed','touch-grass':'leaf','mewing':'star','locked-in':'bolt',
        'six-seven':'crown','mewing-jaw':'blade','ohio-orbiter':'orb',
        'crash-out':'bolt','skibidi-bounce':'orb',mogged:'star','rizz-aura':'spirit',
        'aura-shot':'orb','rizz-blast':'spirit'
      };
      const glyph=glyphs[buff.id] ?? 'star';
      const art=document.createElement('span');
      art.className='upgrade-art';
      art.setAttribute('aria-hidden','true');
      art.innerHTML=`<svg viewBox="0 0 24 24"><use href="/assets/identity/ui-icons.svg#${glyph}"></use></svg>`;
      button.replaceChildren(top,art,bottom,description);
      button.dataset.rarity=buff.rarity.toLowerCase();
      button.setAttribute('aria-label',`Choose ${isWeapon(buff.id)?'weapon':'passive'} ${buff.name}, level ${Math.min(buff.maxStacks,(stacks[buff.id] ?? 0) + 1)} of ${buff.maxStacks}, ${buff.description}`);
    });
  }
}

export const touchControls = new TouchControls();
