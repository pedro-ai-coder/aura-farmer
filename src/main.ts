import Phaser from 'phaser';
import './styles/app.css';
import { ArenaScene } from './game/scenes/ArenaScene';
import { setupSpotlights } from './meta/spotlight';
import { setupMobileFullscreen } from './game/input/mobileFullscreen';
import { setupGameShell } from './meta/shell';
setupMobileFullscreen();
document.documentElement.classList.add('cartoon-ui');
{
    document.documentElement.classList.add('game-ui');
    document.documentElement.classList.add('game-theme');
    const label = document.querySelector<HTMLElement>('.masthead .tag:last-child');
    if (label)
        label.textContent = 'AURA FARMER';
    const loadingStage = document.querySelector<HTMLElement>('#af-loading-stage');
    if (loadingStage)
        loadingStage.textContent = 'Drawing the Cartoon Arena…';
    const tip = document.querySelector<HTMLElement>('.af-loading-inner small');
    if (tip)
        tip.textContent = 'TIP ◆ Farm Aura to unlock your FLEX.';
    const title = document.querySelector<HTMLElement>('#af-loading .af-loading-inner strong');
    if (title)
        title.textContent = 'STYLE IS POWER';
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
