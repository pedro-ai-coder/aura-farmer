import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page) {
    await page.route('**/src/main.ts', async route => {
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({
            response,
            body: (await response.text()).replace('new BrowserApp();', 'window.__app = new BrowserApp();'),
        });
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
}

test('B2.3 desktop camera follows real keyboard movement, freezes in pause and restores menu framing', async ({ page }) => {
    test.setTimeout(70000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await enter(page);
    const homeZoom = await page.evaluate(() => (window as any).__app.scene.cameras.main.zoom);
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    // setZoom updates Camera.zoom immediately, but worldView is recomputed on
    // Phaser's next preRender. Do not sample the old menu worldView.
    await expect.poll(async () => page.evaluate(() =>
        (window as any).__app.scene.cameras.main.worldView.width
    )).toBeLessThan(3500);
    const initial = await page.evaluate(() => {
        const app = (window as any).__app, c = app.scene.cameras.main;
        return {
            zoom: c.zoom, x: app.run.pos.x, y: app.run.pos.y,
            camX: c.scrollX, camY: c.scrollY, focusX: app.cameraFocus.x,
            texture: app.scene.heroImage.texture.key,
            worldWidth: 3500, width: c.worldView.width,
        };
    });
    expect(initial.zoom).toBeGreaterThan(homeZoom * 1.35);
    expect(initial.width).toBeLessThan(initial.worldWidth);
    await page.keyboard.down('d');
    await page.waitForTimeout(2000);
    await page.keyboard.up('d');
    await expect.poll(async () => page.evaluate(() =>
        (window as any).__app.run.pos.x
    )).toBeGreaterThan(initial.x + 40);
    const after = await page.evaluate(() => {
        const app = (window as any).__app, c = app.scene.cameras.main;
        return {
            x: app.run.pos.x, camX: c.scrollX, camY: c.scrollY,
            focusX: app.cameraFocus.x, texture: app.scene.heroImage.texture.key,
            zoom: c.zoom, mode: app.run.mode,
        };
    });
    expect(after.camX).toBeGreaterThan(initial.camX + 8);
    expect(after.focusX).toBeGreaterThan(initial.focusX + 15);
    expect(after.texture).toMatch(/^sigma-(atlas|rear-v2|flex-v2|matte-)/);
    expect(after.mode).toBe('playing');
    await page.screenshot({ path: 'test-results/b2-3-desktop-camera-follow.png' });
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    const pausedX = await page.evaluate(() => (window as any).__app.scene.cameras.main.scrollX);
    await page.waitForTimeout(300);
    const frozenX = await page.evaluate(() => (window as any).__app.scene.cameras.main.scrollX);
    expect(Math.abs(pausedX - frozenX)).toBeLessThan(.01);
    await page.getByRole('button', { name: 'LEAVE RUN' }).click();
    await page.getByRole('button', { name: 'LEAVE RUN', exact: true }).click();
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeVisible();
    const restored = await page.evaluate(() => {
        const app = (window as any).__app, c = app.scene.cameras.main;
        return { zoom: c.zoom, run: !!app.run, x: app.cameraFocus.x };
    });
    expect(restored.run).toBe(false);
    expect(restored.zoom).toBeCloseTo(homeZoom, 3);
    expect(restored.x).toBeCloseTo(724, 2);
});

test('B2.3 touch-landscape camera zoom and joystick remain constrained to displayed world after pan', async ({ browser }) => {
    test.setTimeout(70000);
    const context = await browser.newContext({
        viewport: { width: 915, height: 412 }, screen: { width: 915, height: 412 },
        hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    });
    try {
        const page = await context.newPage();
        await enter(page);
        await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
        await expect(page.locator('#modal')).toBeHidden();
        await expect(page.locator('#touch-zone')).toBeVisible();
        const before = await page.evaluate(() => {
            const app = (window as any).__app;
            return { zoom: app.scene.cameras.main.zoom,
                camX: app.scene.cameras.main.scrollX,
                heroX: app.run.pos.x };
        });
        expect(before.zoom).toBeGreaterThan(915 / 1448);
        await page.evaluate(() => {
            const app = (window as any).__app;
            // Deterministically move the test fixture to another valid
            // Ruin Alley point. Actual keyboard movement is tested above.
            app.run.pos.x += 165;
            app.tick(.1);
            app.alignTouchZone();
        });
        await expect.poll(async () => page.evaluate(() =>
            (window as any).__app.scene.cameras.main.scrollX
        )).toBeGreaterThan(before.camX + 8);
        const rects = await page.evaluate(() => {
            const zone = document.getElementById('touch-zone')!.getBoundingClientRect();
            const canvas = document.querySelector('canvas')!.getBoundingClientRect();
            const hero = (window as any).__app.run.pos;
            const stage = document.getElementById('app')!.getBoundingClientRect();
            return {
                zone: { left: zone.left, right: zone.right, top: zone.top, bottom: zone.bottom },
                canvas: { left: canvas.left, right: canvas.right, top: canvas.top, bottom: canvas.bottom },
                stage: { left: stage.left, right: stage.right },
                hero,
            };
        });
        expect(rects.zone.left).toBeGreaterThanOrEqual(rects.canvas.left - 1);
        expect(rects.zone.right).toBeLessThanOrEqual(rects.canvas.right + 1);
        expect(rects.zone.top).toBeGreaterThanOrEqual(rects.canvas.top - 1);
        expect(rects.zone.bottom).toBeLessThanOrEqual(rects.canvas.bottom + 1);
        expect(rects.zone.right - rects.zone.left).toBeGreaterThan(200);
        await page.screenshot({ path: 'test-results/b2-3-landscape-camera-joystick.png' });
    } finally {
        await context.close();
    }
});
