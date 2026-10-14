import { test, expect } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';

test('identity skin renders a single functional hero menu and real loader completes', async ({page})=>{
  await page.goto('/');
  await expect(page.locator('#af-loading')).toBeHidden();
  await expect(page.locator('.af-home-layout')).toBeVisible();
  await expect(page.locator('h1')).toContainText('FARM AURA. BEAT THE HATERS.');
  await expect(page.locator('.af-home-event')).toContainText('FIVE WAVES');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('[data-menu="choose"]')).toHaveCount(8);
  await expect(page.locator('.af-home-layout')).toHaveCount(0);
});

test('visual event banners react to real gameplay signal without covering navigation',async({page})=>{
  await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(','window.__game = new Phaser.Game(')});
  });
  await page.goto('/');
  await expect(page.locator('#af-loading')).toBeHidden();
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#menu-open')).toBeVisible();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('aura:wave',{detail:5})));
  const spotlight=page.locator('#af-spotlight');
  await expect(spotlight).toBeVisible();
  await expect(spotlight).toContainText('THE BIG HATER');
  expect(await spotlight.getAttribute('data-variant')).toBe('boss');
  expect(await spotlight.evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
  await page.evaluate(()=>{
    const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
    a.aura.change(100,a.clock);
  });
  await expect(page.locator('#flex-ultimate-hud')).toContainText('FLEX READY');
  await page.keyboard.press('e');
  await expect(spotlight).toBeVisible();
  await expect(spotlight).toContainText('ULTIMATE ACTIVATED');
  await expect(spotlight).toContainText('SIGMA LOCK-IN');
  await expect(spotlight).toHaveAttribute('data-variant','aura');
  await expect(spotlight).toHaveCSS('pointer-events','none');
  await page.locator('#menu-open').click();
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
});
