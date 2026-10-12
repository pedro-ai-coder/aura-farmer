import {test,expect,type Page} from '@playwright/test';
import type {ArenaScene} from '../../src/game/scenes/ArenaScene';
declare global{interface Window{__game:Phaser.Game}}
async function boot(page:Page):Promise<void>{
 await page.route('**/src/main.ts',async route=>{
   const response=await route.fetch();
   await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(','window.__game = new Phaser.Game(')});
 });
 await page.goto('/');
 await expect(page.locator('[data-menu="play"]')).toBeVisible();
}
test('single FLEX HUD without Focus, legal manual charging and playable new heroes',async({page})=>{
 await boot(page);
 await page.locator('[data-menu="play"]').click();
 await expect(page.locator('[data-character="cool-kid"]')).toBeEnabled();
 await expect(page.locator('[data-character="nerd"]')).toBeEnabled();
 await page.locator('[data-character="cool-kid"]').click();
 await expect(page.locator('.meta-character[data-character="cool-kid"] img')).toHaveAttribute('src',/^data:image/);
 await page.locator('[data-menu="start"]').click();
 await expect(page.locator('#meta-shell')).toBeHidden();
 await expect(page.locator('[data-game-action="focus"]')).toHaveCount(0);
 await expect(page.locator('#flex-ultimate-hud')).toContainText('GIGA CHAD RAMPAGE');
 await page.evaluate(()=>{
   const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
   a.aura.change(100,a.clock);
 });
 await expect(page.locator('#flex-ultimate-hud')).toContainText('FLEX READY');
 await page.keyboard.press('e');
 await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.flex.state)).toBe('active');
 await expect(page.locator('#flex-ultimate-hud')).toContainText('GIGA CHAD RAMPAGE');
 const data=await page.evaluate(()=>{
   const scene=window.__game.scene.scenes[0] as ArenaScene;
   const a=scene.arena;
   return {hero:a.characterId,aura:a.aura.value,art:scene.children.list
     .filter(o=>o.type==='Image').map(o=>(o as Phaser.GameObjects.Image).texture.key)
     .find(k=>k.startsWith('as-cool-kid-flex'))};
 });
 expect(data.hero).toBe('cool-kid');expect(data.aura).toBe(0);
 expect(data.art).toContain('as-cool-kid-flex');
});
test('Essence pickup visibly affects Sigma/Rizz/Alpha affinity, new Nerd supports Overclock',async({page})=>{
 await boot(page);
 await page.locator('[data-menu="play"]').click();
 await page.locator('[data-character="nerd"]').click();
 await page.locator('[data-menu="start"]').click();
 await page.evaluate(()=>{
   const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
   a.essenceDrops=[{...a.pos,affinity:'rizz'}];a.update(1);
 });
 await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.flexVariant)).toBe('rizz');
 await page.evaluate(()=>{
   const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
   a.essenceDrops=[{...a.pos,affinity:'sigma'},{...a.pos,affinity:'sigma'}];
   a.update(1);a.aura.change(100,a.clock);
 });
 await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.flexVariant)).toBe('sigma');
 await page.keyboard.press('e');
 await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.flex.state)).toBe('active');
 await expect(page.locator('#flex-ultimate-hud')).toContainText('SIGMA KID OVERCLOCK');
});
test('mobile single FLEX button is disabled while farming and enabled when ready',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page);
 await page.locator('[data-menu="play"]').click();await page.locator('[data-menu="start"]').click();
 await expect(page.locator('[data-game-action="focus"]')).toHaveCount(0);
 const flex=page.locator('[data-game-action="flex"]');
 await expect(flex).toBeDisabled();
 await page.evaluate(()=>{const a=(window.__game.scene.scenes[0] as ArenaScene).arena;a.aura.change(100,a.clock);});
 await expect(flex).toBeEnabled();
 await flex.tap();
 await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.flex.state)).toBe('active');
 await expect(flex).toBeDisabled();
});
