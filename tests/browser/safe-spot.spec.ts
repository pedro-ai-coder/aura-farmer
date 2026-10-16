import { test, expect } from '@playwright/test';
import type { BrowserApp } from '../../src/browser/app';

declare global { interface Window { __app: BrowserApp } }

test('Safe Spot heals in the arena, shows HUD cooldown and freezes while paused', async ({ page }) => {
    await page.route('**/src/main.ts', async route => {
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({ response, body: (await response.text()).replace('new BrowserApp();', 'window.__app = new BrowserApp();') });
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    await page.evaluate(() => {
        const r = window.__app.run!;
        r.nextSpawn = Infinity;
        r.enemies = [];
        r.hp = r.maxHp / 2;
        r.pos = { x: r.safeSpot.x, y: r.safeSpot.y };
    });
    await expect(page.locator('#hud')).toContainText('SAFE SPOT');
    await expect.poll(() => page.evaluate(() => window.__app.run!.safeSpotUses), { timeout: 12000 }).toBe(1);
    await expect(page.locator('#hud')).toContainText(/SAFE SPOT [0-9]+s/);
    const state = await page.evaluate(() => ({ hp: window.__app.run!.hp, readyAt: window.__app.run!.safeSpotReadyAt }));
    expect(state.hp).toBeGreaterThan(await page.evaluate(() => window.__app.run!.maxHp / 2));
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    const paused = await page.evaluate(() => ({ time: window.__app.run!.time, readyAt: window.__app.run!.safeSpotReadyAt }));
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => window.__app.run!.time)).toBe(paused.time);
    expect(paused.readyAt).toBe(state.readyAt);
});
