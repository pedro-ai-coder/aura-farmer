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
test('new Aura Arena is production default, not the old garden event',async({page})=>{
 await openGame(page,'/');
 await expect(page.locator('html')).toHaveClass(/aura-final/);
 await expect(page.locator('.af-home-event')).toContainText('FIVE WAVES');
 await expect(page.locator('.af-home-event')).not.toContainText('WITHERROOT');
 const loaded=await page.evaluate(()=>{
  const scene=window.__game.scene.scenes[0] as ArenaScene;
  return ['af-arena','af-xp','af-shot','af-hostile','af-enemy-boss-idle-0','af-enemy-beta-attack-4',
    'af-fx-hit-0','af-fx-burst-6','ga-sigma-idle-0','gb-alpha-idle-0','gb2-ohio-idle-0']
    .every(key=>scene.textures.exists(key));
 });
 expect(loaded).toBe(true);
});
test('legacy art can still be compared by using the legacy URL',async({page})=>{
 await openGame(page,'/?visual=legacy');
 await expect(page.locator('html')).not.toHaveClass(/aura-final/);
 expect(await page.evaluate(()=>{
  const scene=window.__game.scene.scenes[0] as ArenaScene;
  return !scene.textures.exists('af-arena')&&scene.textures.exists('px-floor');
 })).toBe(true);
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
  const keys=s.children.list.filter(o=>o.type==='Image').map(o=>(o as Phaser.GameObjects.Image).texture.key);
  return ['npc','hater','beta','boss'].every(t=>keys.some(k=>k.startsWith('af-enemy-'+t+'-'))) && keys.includes('af-xp');
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
 await expect(page.locator('.meta-character[data-character="sigma"] img')).toHaveAttribute('src',/^data:image/);
});
