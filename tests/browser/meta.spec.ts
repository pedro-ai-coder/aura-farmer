import { test, expect, type Page } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';

declare global {interface Window {__game: Phaser.Game}}
async function load(page:Page):Promise<void> {
  await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch({maxRetries:2});
    await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(')});
  });
  await page.goto('/');
  await expect(page.locator('#meta-shell')).toBeVisible();
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => {
    const scene=window.__game.scene.scenes[0];
    return ['sigma','alpha','rizzler','ohio','fanum','six-seven'].every(id => scene.textures.exists('spr-'+id));
  })).toBe(true);
}
test('new home, character selection, run results, local save and leaderboard survive refresh',async({page})=>{
  await load(page);
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('[data-menu="choose"]')).toHaveCount(6);
  await expect(page.locator('[data-character="fanum"]')).toBeDisabled();
  await page.locator('[data-character="alpha"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.characterId)).toBe('alpha');
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.mode)).toBe('playing');
  expect(await page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.hp)).toBe(120);
  await page.evaluate(()=>{
    const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
    a.kills=27;a.xpCollected=62;a.hp=0;a.mode='dead';
  });
  await expect(page.locator('#meta-shell')).toContainText('SCORE');
  await expect(page.locator('#meta-shell')).toContainText('Alpha Chad');
  await page.locator('[data-menu="home"]').click();
  await page.locator('[data-menu="leaderboards"]').click();
  await expect(page.locator('.meta-leaderboard')).toContainText('Alpha Chad');
  await expect(page.locator('#meta-shell')).toContainText('Online rankings: COMING SOON');
  await page.reload();
  await expect(page.locator('#meta-shell')).toContainText('Alpha Chad');
  await expect(page.locator('#meta-shell')).toContainText('1 runs');
  await page.locator('[data-menu="achievements"]').click();
  await expect(page.locator('#meta-shell')).toContainText('First Aura');
  await page.locator('[data-menu="home"]').click();
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('[data-character="alpha"]')).toHaveAttribute('aria-pressed','true');
});
test('pause freezes simulation and returns to game without losing the build',async({page})=>{
  await load(page);
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-character="ohio"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#menu-open')).toBeVisible();
  await page.locator('#menu-open').click();
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
  const startClock=await page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.clock);
  await page.waitForTimeout(300);
  expect(await page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.clock)).toBe(startClock);
  await page.locator('[data-menu="resume"]').click();
  await expect(page.locator('#meta-shell')).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.clock)).toBeGreaterThan(startClock);
  await page.locator('#menu-open').click();
  await page.locator('[data-menu="exit"]').click();
  await expect(page.locator('#meta-shell')).toContainText('YOUR RUN WILL BE LOST');
  await page.locator('[data-menu="confirm-exit"]').click();
  await expect(page.locator('#meta-shell')).toContainText('MAIN CHARACTER ENERGY');
});
test('landscape Android menu and selection fit viewport',async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await load(page);
  await page.locator('[data-menu="play"]').click();
  const panel=await page.locator('.meta-panel').boundingBox();
  expect(panel).toBeTruthy();
  expect(panel!.width).toBeLessThanOrEqual(844);
  expect(panel!.height).toBeLessThanOrEqual(390);
  await page.locator('[data-character="rizzler"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.buffs['rizz-aura'])).toBe(1);
  await expect(page.locator('#menu-open')).toBeVisible();
});
