import { test, expect, type Page } from '@playwright/test';
import type { Arena } from '../../src/game/core/arena';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';

declare global { interface Window { __game: Phaser.Game } }

// Chromium mobile emulation tests pointer and touch UI without a physical phone.
test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

async function state<T>(page: Page, read: (arena: Arena) => T): Promise<T> {
  return page.evaluate(`(${read.toString()})(window.__game.scene.scenes[0].arena)`);
}

async function tap(page: Page, selector: string): Promise<void> {
  const box = await page.locator(selector).boundingBox();
  expect(box, selector).not.toBeNull();
  await page.touchscreen.tap(box!.x + box!.width / 2, box!.y + box!.height / 2);
}

test.beforeEach(async ({ page }) => {
  await page.route('**/src/main.ts', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(') });
  });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeVisible();
  await expect.poll(() => state(page, a => a.mode)).toBe('intro');
});

test('portrait touch controls: start, analog movement, FLEX, FOCUS, upgrade and retry', async ({ page }) => {
  await expect(page.locator('#touch-confirm')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  await tap(page, '#touch-confirm');
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
  await expect(page.locator('#joystick-track')).toBeVisible();
  await expect(page.locator('[data-game-action="flex"]')).toBeVisible();

  const initialX = await state(page, a => a.pos.x);
  const track = (await page.locator('#joystick-track').boundingBox())!;
  const centerX = track.x + track.width / 2, centerY = track.y + track.height / 2;
  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 43, centerY);
  await expect.poll(() => state(page, a => a.pos.x)).toBeGreaterThan(initialX + 3);
  await page.mouse.up();

  await tap(page, '[data-game-action="flex"]');
  await expect.poll(() => state(page, a => a.flex.state)).toBe('cooldown');
  await tap(page, '[data-game-action="focus"]');
  await expect.poll(() => state(page, a => a.focusReady)).toBeGreaterThan(0);

  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.mode = 'upgrades';
    a.pendingUpgrades = 1;
    a.choices = [
      { id: 'sigma', name: 'Sigma Aura', description: 'Damage up', maxStacks: 2, rarity: 'RARE' },
      { id: 'alpha', name: 'Alpha Aura', description: 'Damage up', maxStacks: 2, rarity: 'RARE' },
      { id: 'speed', name: 'Bro Has Motion', description: 'Speed up', maxStacks: 3, rarity: 'COMMON' },
    ];
  });
  await expect(page.locator('[data-game-action="choice0"]')).toBeVisible();
  await expect(page.locator('[data-game-action="choice0"]')).toContainText('Sigma Aura');
  await tap(page, '[data-game-action="choice0"]');
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
  expect(await state(page, a => a.buffs.sigma)).toBe(1);

  await page.evaluate(() => {
    (window.__game.scene.scenes[0] as ArenaScene).arena.mode = 'dead';
  });
  await expect(page.locator('#touch-confirm')).toHaveText('RETRY');
  await tap(page, '#touch-confirm');
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
});

test('landscape controls flank the canvas and remain tappable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const play = page.locator('#touch-confirm');
  await expect(play).toBeVisible();
  await tap(page, '#touch-confirm');
  await expect(page.locator('#joystick-track')).toBeVisible();
  const stick = (await page.locator('#joystick-track').boundingBox())!;
  const canvas = (await page.locator('#game').boundingBox())!;
  const flex = (await page.locator('[data-game-action="flex"]').boundingBox())!;
  expect(stick.x + stick.width).toBeLessThan(canvas.x + 4);
  expect(flex.x).toBeGreaterThan(canvas.x + canvas.width - 4);
  expect(canvas.height).toBeLessThanOrEqual(390);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
  await tap(page, '[data-game-action="focus"]');
  await expect.poll(() => state(page, a => a.focusReady)).toBeGreaterThan(0);
});
