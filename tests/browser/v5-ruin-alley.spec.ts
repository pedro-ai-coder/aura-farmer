import { test, expect } from '@playwright/test';

async function enter(page: import('@playwright/test').Page) {
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
}

test('V5 Option A: each actual cover gains ground contact, with map texture and collision unchanged', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await enter(page);
    const snapshot = await page.evaluate(async () => {
        const worldUrl: string = '/src/game/simulation/world.ts';
        const { COVER, WORLD, walkable } = await import(/* @vite-ignore */ worldUrl);
        const scene = (window as any).__app.scene;
        const ground = scene.children.list.find((o: any) => o.name === 'alley-cover-contact');
        const map = scene.children.list.find((o: any) => o.texture?.key === 'ruin');
        const cover = scene.children.list.filter((o: any) => o.texture?.key === 'enemy-atlas' && o.frame?.name === 14);
        return {
            world: WORLD, cover: COVER.map((c: any) => ({ ...c, collision: walkable(c) })),
            grounded: !!ground, depth: ground?.depth, mapTexture: map?.texture?.key,
            mapWidth: map?.displayWidth, mapHeight: map?.displayHeight,
            coverProps: cover.length,
        };
    });
    expect(snapshot.world).toEqual({ width: 1448, height: 1086 });
    expect(snapshot.grounded).toBe(true);
    expect(snapshot.depth).toBeLessThan(0);
    expect(snapshot.mapTexture).toBe('ruin');
    expect(snapshot.mapWidth).toBe(1448);
    expect(snapshot.mapHeight).toBe(1086);
    expect(snapshot.cover).toHaveLength(2);
    for (const c of snapshot.cover) expect(c.collision).toBe(false);
    expect(snapshot.coverProps).toBe(2);
    await page.screenshot({ path: 'test-results/v5-ruin-alley-desktop-1280.png' });
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await page.getByRole('button', { name: 'BACK TO THE FARM' }).click();
    await expect(page.locator('#modal')).toBeHidden();
});

test('V5 Option A: short landscape remains a playable, centered arena, not a fake new map', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 915, height: 412 }, screen: { width: 915, height: 412 },
        isMobile: true, hasTouch: true, deviceScaleFactor: 1,
    });
    try {
        const page = await context.newPage();
        await enter(page);
        await expect(page.locator('#touch-zone')).toBeVisible();
        const objects = await page.evaluate(() => {
            const scene = (window as any).__app.scene;
            return scene.children.list.filter((o: any) => o.name === 'alley-cover-contact').length;
        });
        expect(objects).toBe(1);
        await page.screenshot({ path: 'test-results/v5-ruin-alley-mobile-915.png' });
    } finally {
        await context.close();
    }
});
