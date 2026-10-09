import type { BuffDefinition } from '../data/buffs';
import type { Controls, Mode } from '../core/arena';

type TouchAction = 'flex' | 'focus' | 'confirm' | 'choice0' | 'choice1' | 'choice2';

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
  private upgradeActions = document.querySelector<HTMLElement>('#touch-upgrade-actions')!;
  private confirmButton = document.querySelector<HTMLButtonElement>('#touch-confirm')!;
  private upgradeButtons = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-game-action^="choice"]'));
  private pointerId: number | null = null;
  private x = 0;
  private y = 0;
  private pressed = new Set<TouchAction>();
  private displayState = '';

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
    return { x: this.x, y: this.y, flex: actions.has('flex'), focus: actions.has('focus'), confirm: actions.has('confirm'), choice };
  }

  setMode(mode: Mode, choices: BuffDefinition[]): void {
    const key = `${mode}:${mode === 'upgrades' ? choices.map(c => c.id).join(',') : ''}`;
    if (this.displayState === key) return;
    this.displayState = key;

    this.stickBox.hidden = mode !== 'playing';
    this.playActions.hidden = mode !== 'playing';
    this.upgradeActions.hidden = mode !== 'upgrades';
    this.confirmActions.hidden = mode === 'playing' || mode === 'upgrades';
    if (mode !== 'playing') this.resetStick();

    this.confirmButton.textContent = mode === 'intro' ? 'PLAY' : mode === 'between' ? 'NEXT WAVE' : mode === 'dead' ? 'RETRY' : 'PLAY AGAIN';

    this.upgradeButtons.forEach((button, i) => {
      const buff = choices[i];
      button.hidden = !buff;
      if (buff) button.textContent = `${i + 1}. ${buff.name}`;
    });
  }
}

export const touchControls = new TouchControls();
