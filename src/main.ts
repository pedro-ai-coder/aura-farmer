import Phaser from 'phaser';
import { ArenaScene } from './game/scenes/ArenaScene';
import './styles/main.css';
import './styles/identity.css';
import { setupSpotlights } from './meta/spotlight';
import { setupMobileFullscreen } from './game/input/mobileFullscreen';
import { setupGameShell } from './meta/shell';

setupMobileFullscreen();
// Two branded art treatments for genuine startup asset loading, not a timed fake loader.
const bootLoading=document.querySelector<HTMLElement>('#af-loading');
if(bootLoading && Math.random()>.5){
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
  backgroundColor: '#241c40',
  render: { pixelArt: false, antialias: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [ArenaScene],
});

setupGameShell(game);
setupSpotlights();
