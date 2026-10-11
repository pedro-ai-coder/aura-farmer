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
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
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
  await expect(page.locator('[data-menu="retry"]')).toBeVisible();
  await page.locator('[data-menu="retry"]').click();
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
});

test('landscape controls flank the canvas and remain tappable', async ({ page }) => {
  await page.setViewportSize({ width: 844, height: 390 });
  const play = page.locator('[data-menu="play"]');
  await expect(play).toBeVisible();
  await play.click();
  await page.locator('[data-menu="start"]').click();
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

test('fullscreen button enables immersive landscape, preserves touch controls and exits cleanly', async ({ page }) => {
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
  await expect(page.locator('#touch-play-actions')).toBeVisible();
  // Native Fullscreen isn't available in several embedded/mobile browsers.
  // Force rejection to exercise the CSS fallback, independent of CI browser permissions.
  await page.evaluate(() => {
    Object.defineProperty(Element.prototype, 'requestFullscreen', {
      configurable: true,
      value: () => Promise.reject(new Error('Fullscreen not supported')),
    });
  });
  const toggle = page.locator('#fullscreen-toggle');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveText('FULL SCREEN');
  await toggle.tap();
  await expect(page.locator('.play-layout')).toHaveClass(/is-immersive/);
  await expect(toggle).toHaveText('EXIT');
  await expect(toggle).toBeHidden(); // Fullscreen navigation now lives in the pause menu
  await expect(page.locator('#rotate-notice')).toBeVisible();

  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('#rotate-notice')).toBeHidden();
  await expect(page.locator('#joystick-track')).toBeVisible();
  const stage = (await page.locator('.play-layout').boundingBox())!;
  const arena = (await page.locator('#game').boundingBox())!;
  const stick = (await page.locator('#joystick-track').boundingBox())!;
  const focus = (await page.locator('[data-game-action="focus"]').boundingBox())!;
  expect(stage.width).toBeGreaterThanOrEqual(840);
  expect(stage.height).toBeLessThanOrEqual(391);
  // Full-bleed: gameplay canvas fills the screen and the controls float above it.
  const gameCanvas = (await page.locator('#game canvas').boundingBox())!;
  expect(arena.x).toBeLessThanOrEqual(2);
  expect(arena.width).toBeGreaterThanOrEqual(840);
  expect(arena.height).toBeGreaterThanOrEqual(385);
  expect(gameCanvas.width).toBeGreaterThanOrEqual(840);
  expect(gameCanvas.height).toBeGreaterThanOrEqual(385);
  expect(stick.x).toBeGreaterThanOrEqual(arena.x);
  expect(stick.x + stick.width).toBeLessThan(arena.x + arena.width / 2);
  expect(focus.x).toBeGreaterThan(arena.x + arena.width / 2);
  expect(focus.x + focus.width).toBeLessThanOrEqual(arena.x + arena.width + 2);
  // Keep all navigation off the HUD and away from the main touch targets.
  const menu = (await page.locator('#menu-open').boundingBox())!;
  const flex = (await page.locator('[data-game-action="flex"]').boundingBox())!;
  const waveHudBottom = gameCanvas.y + gameCanvas.height * (80 / 600);
  expect(menu.y).toBeGreaterThanOrEqual(waveHudBottom - 2);
  expect(menu.x).toBeGreaterThan(gameCanvas.x + gameCanvas.width / 2);
  expect(menu.y + menu.height).toBeLessThan(flex.y);
  expect(flex.y + flex.height).toBeLessThanOrEqual(focus.y + 1);
  expect(stick.width).toBeLessThanOrEqual(125);
  expect(stick.height).toBeLessThanOrEqual(125);
  expect(flex.width).toBeLessThanOrEqual(155);
  expect(focus.width).toBeLessThanOrEqual(155);
  await expect(toggle).toBeHidden();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);

  await tap(page, '[data-game-action="focus"]');
  await expect.poll(() => state(page, a => a.focusReady)).toBeGreaterThan(0);
  await page.screenshot({ path: 'test-results/immersive-landscape.png' });

  await page.locator('#menu-open').tap();
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
  await expect(page.locator('[data-menu="fullscreen"]')).toHaveText('EXIT FULL SCREEN');
  await expect(page.locator('#joystick-track')).toBeHidden();
  await page.locator('[data-menu="fullscreen"]').click();
  await expect(page.locator('.play-layout')).not.toHaveClass(/is-immersive/);
  await expect(toggle).toHaveText('FULL SCREEN');
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
  await page.locator('[data-menu="resume"]').click();
  await expect(page.locator('#joystick-track')).toBeVisible();
});
