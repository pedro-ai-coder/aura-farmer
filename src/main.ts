import Phaser from 'phaser';
import { ArenaScene } from './game/scenes/ArenaScene';
import './styles/main.css';
import './styles/identity.css';
import './styles/identity-v2.css';
import './styles/gateA.css';
import { isGateA } from './game/render/gateAArena';
import { setupSpotlights } from './meta/spotlight';
import { setupMobileFullscreen } from './game/input/mobileFullscreen';
import { setupGameShell } from './meta/shell';

setupMobileFullscreen();
if(isGateA()){
  document.documentElement.classList.add('gate-a-mode');
  const label=document.querySelector<HTMLElement>('.masthead .tag:last-child');
  if(label) label.textContent='GATE A · PLAYABLE PREVIEW';
  const loadingStage=document.querySelector<HTMLElement>('#af-loading-stage');
  if(loadingStage)loadingStage.textContent='Preparing the Aura Arena…';
  const tip=document.querySelector<HTMLElement>('.af-loading-inner small');
  if(tip)tip.textContent='TIP ◆ FLEX at the right moment to gain Aura.';
  const title=document.querySelector<HTMLElement>('#af-loading .af-loading-inner strong');
  if(title)title.textContent='STYLE IS POWER';
}
// Two branded art treatments for genuine startup asset loading, not a timed fake loader.
const bootLoading=document.querySelector<HTMLElement>('#af-loading');
if(bootLoading && !isGateA() && Math.random()>.5){
  bootLoading.dataset.variant='witherroot';
  const stage=document.querySelector<HTMLElement>('#af-loading-stage');
  if(stage) stage.textContent='Holding back the Witherroot…';
  const tip=bootLoading.querySelector<HTMLElement>('.af-loading-inner small');
  if(tip) tip.textContent='TIP ✦ Strong enemies signal danger before they strike.';
}

const game = new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 600,
  parent: 'game',
  backgroundColor: '#172638',
  render: { pixelArt: false, antialias: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [ArenaScene],
});

setupGameShell(game);
setupSpotlights();
