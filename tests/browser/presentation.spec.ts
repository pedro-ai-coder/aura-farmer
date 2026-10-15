import {test,expect,type Page} from '@playwright/test';
import type {ArenaScene} from '../../src/game/scenes/ArenaScene';
declare global {interface Window {__game:Phaser.Game}}
async function openGame(page:Page,path:string){
 await page.route('**/src/main.ts',async route=>{
  const response=await route.fetch();
  await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(','window.__game = new Phaser.Game(')});
 });
 await page.goto(path);
 await expect(page.locator('[data-menu="play"]')).toBeVisible();
}
test('Current presentation loads actors and effects without retired variants',async({page})=>{
 await openGame(page,'/');
 await expect(page.locator('html')).toHaveClass(/game-theme/);
 await expect(page.locator('html')).toHaveClass(/cartoon-ui/);
 await expect(page.locator('.af-home-event')).toContainText('FIVE WAVES');
 await expect(page.locator('.af-home-event')).not.toContainText('WITHERROOT');
 const loaded=await page.evaluate(()=>{
  const scene=window.__game.scene.scenes[0] as ArenaScene;
  return [...['sigma','alpha','rizzler','ohio','fanum','six-seven','cool-kid','nerd'].map(id=>'ct-hero-'+id),
    ...['npc','hater','beta','boss'].map(id=>'ct-enemy-'+id),
    'af-xp','af-shot','af-hostile',
    'af-fx-hit-0','af-fx-burst-6']
    .every(key=>scene.textures.exists(key));
 });
 expect(loaded).toBe(true);
});
test('retired visual URL switches cannot reactivate old renderers',async({page})=>{
 await openGame(page,'/?visual=legacy&gateA=1&gateB=2');
 await expect(page.locator('html')).toHaveClass(/cartoon-ui/);
 const textures=await page.evaluate(()=>window.__game.scene.scenes[0].textures.getTextureKeys());
 expect(textures.some(k=>/^(px-|spr-|ga-|gb-|gb2-)/.test(k))).toBe(false);
 expect(textures).toContain('ct-hero-sigma');
});
test('combat and fullscreen show NPC Hater Beta boss and XP without missing textures',async({page})=>{
 await page.setViewportSize({width:1180,height:840});
 await openGame(page,'/');
 await page.locator('[data-menu="play"]').click();
 await page.locator('[data-menu="start"]').click();
 await page.evaluate(()=>{
  const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
  a.enemies=[{id:555,type:'npc',x:200,y:255,hp:30,nextHit:Infinity,nextShot:Infinity},
    {id:556,type:'hater',x:680,y:265,hp:30,nextHit:Infinity,nextShot:Infinity},
    {id:557,type:'beta',x:740,y:370,hp:80,nextHit:Infinity,nextShot:Infinity},
    {id:558,type:'boss',x:540,y:390,hp:200,nextHit:Infinity,nextShot:Infinity}];
  a.drops=[{x:300,y:320,xp:2}];
 });
 await expect.poll(()=>page.evaluate(()=>{
  const s=window.__game.scene.scenes[0] as ArenaScene;
  const keys=s.children.list.filter(o=>o.type==='Image' && (o as Phaser.GameObjects.Image).visible)
    .map(o=>(o as Phaser.GameObjects.Image).texture.key);
  const ruinAlleyDrawn=s.children.list.some(o=>o.type==='Graphics' && (o as Phaser.GameObjects.Graphics).depth===-12);
  const xpVisible=keys.includes('af-xp');
  return ['npc','hater','beta','boss'].every(t=>keys.includes('ct-enemy-'+t)) &&
    xpVisible && ruinAlleyDrawn && s.arena.world?.id==='ruin-alley';
 })).toBe(true);
 const bad=()=>page.evaluate(()=>{
  const s=window.__game.scene.scenes[0] as ArenaScene;
  return s.children.list.filter(o=>o.type==='Image').map(o=>o as Phaser.GameObjects.Image)
    .filter(i=>i.visible&&(!s.textures.exists(i.texture.key)||!s.textures.get(i.texture.key).has(i.frame.name)))
    .map(i=>i.texture.key);
 });
 await expect.poll(bad).toEqual([]);
 await page.evaluate(async()=>{await document.querySelector<HTMLElement>('.play-layout')!.requestFullscreen();});
 await expect.poll(bad).toEqual([]);
 await page.evaluate(async()=>{await document.exitFullscreen();});
 await expect.poll(bad).toEqual([]);
});
test('original unlock rules still apply in full visual mode',async({page})=>{
 await openGame(page,'/');
 await page.locator('[data-menu="play"]').click();
 await expect(page.locator('[data-character="fanum"]')).toBeDisabled();
 await expect(page.locator('[data-character="six-seven"]')).toBeDisabled();
 const portrait=page.locator('.meta-character[data-character="sigma"] img');
 await expect(portrait).toHaveAttribute('src','/assets/cartoon/v1/characters/sigma.svg');
 await expect.poll(()=>portrait.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
});
