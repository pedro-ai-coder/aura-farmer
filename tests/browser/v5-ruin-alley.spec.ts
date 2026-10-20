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

test('B2.4 approved alley illustration remains central, with collision-backed crates across expanded map', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await enter(page);
    const snapshot = await page.evaluate(async () => {
        const worldUrl: string = '/src/game/simulation/world.ts';
        const { COVER, WORLD, ALLEY_ORIGIN, ORIGINAL_ALLEY, RUN_START, walkable } = await import(/* @vite-ignore */ worldUrl);
        const scene = (window as any).__app.scene;
        const ground = scene.children.list.find((o: any) => o.name === 'alley-cover-contact');
        const map = scene.children.list.find((o: any) => o.name === 'ruin-central-district');
        const floor = scene.children.list.find((o: any) => o.name === 'ruin-expanded-floor');
        const boundary = scene.children.list.find((o: any) => o.name === 'ruin-real-walkable-border');
        const cover = scene.children.list.filter((o: any) => o.texture?.key === 'enemy-atlas' && o.frame?.name === 14);
        return {
            world: WORLD, origin: ALLEY_ORIGIN, original: ORIGINAL_ALLEY,
            hero: RUN_START, floor: { width: floor.displayWidth, height: floor.displayHeight, texture: floor.texture.key },
            boundary: !!boundary,
            cover: COVER.map((c: any) => ({ ...c, collision: walkable(c) })),
            grounded: !!ground, depth: ground?.depth, mapTexture: map?.texture?.key,
            mapWidth: map?.displayWidth, mapHeight: map?.displayHeight,
            coverProps: cover.length,
        };
    });
    expect(snapshot.world).toEqual({ width: 3500, height: 2650 });
    expect(snapshot.origin).toEqual({ x: 0, y: 0 });
    expect(snapshot.hero).toEqual({ x: 724, y: 610 });
    expect(snapshot.floor).toEqual({ width: 3500, height: 2650, texture: 'ruin-floor-loop' });
    expect(snapshot.boundary).toBe(true);
    expect(snapshot.grounded).toBe(true);
    expect(snapshot.depth).toBeLessThan(0);
    expect(snapshot.mapTexture).toBe('ruin-district-blend');
    expect(snapshot.mapWidth).toBe(1448);
    expect(snapshot.mapHeight).toBe(1086);
    expect(snapshot.cover).toHaveLength(11);
    for (const c of snapshot.cover) expect(c.collision).toBe(false);
    expect(snapshot.coverProps).toBe(11);
    await page.screenshot({ path: 'test-results/v5-ruin-alley-desktop-1280.png' });
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await page.getByRole('button', { name: 'BACK TO THE FARM' }).click();
    await expect(page.locator('#modal')).toBeHidden();
});

test('B2.4 short landscape remains playable on the actual larger map', async ({ browser }) => {
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
