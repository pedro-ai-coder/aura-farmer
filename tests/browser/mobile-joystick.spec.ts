import { test, expect, type Page } from '@playwright/test';
import type { BrowserApp } from '../../src/browser/app';

declare global {
    interface Window { __app: BrowserApp; }
}

test.use({ hasTouch: true, isMobile: true, viewport: { width: 960, height: 540 } });

async function enterArena(page: Page) {
    await page.route('**/src/main.ts', async route => {
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({
            response,
            body: (await response.text()).replace('new BrowserApp();', 'window.__app = new BrowserApp();'),
        });
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    await expect.poll(async () =>
        page.locator('#touch-zone').evaluate(el => el.getBoundingClientRect().width)
    ).toBeGreaterThan(100);
}

test('joystick only starts on visible artwork, not the blue canvas or HUD', async ({ page }) => {
    await enterArena(page);

    // Force a world view wider than the NEW 3500U arena to expose a blue letterbox,
    // just like a mobile fullscreen/viewport aspect-ratio mismatch.
    await page.evaluate(() => {
        const camera = window.__app.scene.cameras.main;
        camera.setZoom(.22);
        camera.centerOn(724, 543);
        (window.__app as unknown as { alignTouchZone(): void }).alignTouchZone();
    });
    // A camera constrained against a world edge can letterbox either side.
    // Do not assume the image is centered (the screenshot shows it at left).
    await expect.poll(async () => {
        const geometry = await page.evaluate(() => {
            const camera = window.__app.scene.cameras.main;
            camera.setZoom(.22);
            (window.__app as unknown as { alignTouchZone(): void }).alignTouchZone();
            const z = document.querySelector('#touch-zone')!.getBoundingClientRect();
            const c = document.querySelector('#game canvas')!.getBoundingClientRect();
            return { gap: c.width - z.width, left: z.left - c.left, right: c.right - z.right };
        });
        return geometry.gap > 100 && (geometry.left > 10 || geometry.right > 10);
    }).toBe(true);

    const zone = (await page.locator('#touch-zone').boundingBox())!;
    const canvas = (await page.locator('#game canvas').boundingBox())!;
    expect(zone.width).toBeLessThan(canvas.width - 100);
    expect(zone.x).toBeGreaterThanOrEqual(canvas.x - 1);
    expect(zone.x + zone.width).toBeLessThanOrEqual(canvas.x + canvas.width + 1);

    const leftGap = zone.x - canvas.x;
    const rightGap = canvas.x + canvas.width - zone.x - zone.width;
    const outsideX = leftGap > rightGap ? canvas.x + leftGap / 2
        : zone.x + zone.width + rightGap / 2;
    const centerY = zone.y + zone.height / 2;
    await page.mouse.move(outsideX, centerY);
    await page.mouse.down();
    expect(await page.evaluate(() => window.__app['touchPointer'])).toBe(null);
    await expect(page.locator('#touch-joystick')).toBeHidden();
    await page.mouse.up();

    const hud = (await page.locator('#hud .hud-top').boundingBox())!;
    await page.mouse.move(hud.x + hud.width / 3, hud.y + hud.height / 2);
    await page.mouse.down();
    expect(await page.evaluate(() => window.__app['touchPointer'])).toBe(null);
    await page.mouse.up();

    const x = zone.x + zone.width / 2, y = zone.y + zone.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    expect(await page.evaluate(() => window.__app['touchPointer'])).not.toBe(null);
    await expect(page.locator('#touch-joystick')).toBeVisible();
    await page.mouse.move(x + 36, y + 12, { steps: 3 });
    expect(await page.evaluate(() => window.__app['touchDirection'].x)).toBeGreaterThan(.3);
    await page.mouse.up();
    expect(await page.evaluate(() => window.__app['touchPointer'])).toBe(null);

    // HUD action remains clickable because its stacking order is above touch.
    await page.locator('#hud .hud-top [data-action=pause]').click();
    await expect(page.locator('.pause')).toBeVisible();
    await expect(page.locator('#touch-zone')).toBeHidden();
});

test('touch playfield follows the camera, viewport and resume lifecycle', async ({ page }) => {
    await enterArena(page);
    const initial = (await page.locator('#touch-zone').boundingBox())!;
    const canvas = (await page.locator('#game canvas').boundingBox())!;
    expect(initial.width).toBeLessThanOrEqual(canvas.width + 1);
    expect(initial.height).toBeLessThanOrEqual(canvas.height + 1);

    await page.evaluate(() => {
        const camera = window.__app.scene.cameras.main;
        camera.setZoom(.5);
        camera.centerOn(1200, 540);
        (window.__app as unknown as { alignTouchZone(): void }).alignTouchZone();
    });
    const moved = (await page.locator('#touch-zone').boundingBox())!;
    expect(moved.width).toBeGreaterThan(100);
    expect(moved.x).toBeGreaterThanOrEqual(canvas.x - 1);
    expect(moved.x + moved.width).toBeLessThanOrEqual(canvas.x + canvas.width + 1);

    await page.locator('#hud .hud-top [data-action=pause]').click();
    await expect(page.locator('#touch-zone')).toBeHidden();
    await page.getByRole('button', { name: 'BACK TO THE FARM' }).click();
    await expect(page.locator('#touch-zone')).toBeVisible();

    await page.setViewportSize({ width: 800, height: 400 });
    await expect.poll(async () => {
        const z = await page.locator('#touch-zone').boundingBox();
        const c = await page.locator('#game canvas').boundingBox();
        return !!z && !!c && z.x >= c.x - 1 && z.y >= c.y - 1 &&
            z.x + z.width <= c.x + c.width + 1 &&
            z.y + z.height <= c.y + c.height + 1;
    }).toBe(true);
});
