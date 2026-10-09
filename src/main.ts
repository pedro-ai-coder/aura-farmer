import Phaser from 'phaser';
import { ArenaScene } from './game/scenes/ArenaScene';
import './styles/main.css';

new Phaser.Game({
  type: Phaser.AUTO,
  width: 960,
  height: 600,
  parent: 'game',
  backgroundColor: '#241c40',
  render: { pixelArt: false, antialias: true },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [ArenaScene],
});
