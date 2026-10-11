import Phaser from 'phaser';
import { ArenaScene } from './game/scenes/ArenaScene';
import './styles/main.css';
import './styles/identity.css';
import { setupSpotlights } from './meta/spotlight';
import { setupMobileFullscreen } from './game/input/mobileFullscreen';
import { setupGameShell } from './meta/shell';

setupMobileFullscreen();

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
