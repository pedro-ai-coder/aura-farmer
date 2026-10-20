import { expect, test, type Page } from '@playwright/test';

async function enter(page: Page) {
    await page.route('**/src/main.ts', async route => {
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({
            response,
            body: (await response.text()).replace(
                'new BrowserApp();', 'window.__app = new BrowserApp();'),
        });
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
}

test('B2.4 real art: looping world, feathered native PNG, border and 11 collision props', async ({ page }) => {
    test.setTimeout(65000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await enter(page);
    const state = await page.evaluate(async () => {
        const worldUrl: string = '/src/game/simulation/world.ts';
        const { WORLD, ALLEY_ORIGIN, ORIGINAL_ALLEY, COVER, RUN_START, walkable } =
            await import(/* @vite-ignore */ worldUrl);
        const app = (window as any).__app, scene = app.scene;
        const floor = scene.children.list.find((obj: any) => obj.name === 'ruin-expanded-floor');
        const district = scene.children.list.find((obj: any) => obj.name === 'ruin-central-district');
        const border = scene.children.list.find((obj: any) => obj.name === 'ruin-real-walkable-border');
        const crates = scene.children.list.filter((obj: any) =>
            obj.texture?.key === 'enemy-atlas' && obj.frame?.name === 14);
        const tex = scene.textures.get('ruin-floor-loop');
        const canvas = tex.getSourceImage();
        return {
            world: WORLD, original: ORIGINAL_ALLEY, origin: ALLEY_ORIGIN,
            floor: { width: floor?.displayWidth, height: floor?.displayHeight,
                texture: floor?.texture?.key, sourceWidth: canvas.width,
                sourceHeight: canvas.height },
            district: { x: district?.x, y: district?.y,
                width: district?.displayWidth, height: district?.displayHeight,
                texture: district?.texture?.key },
            border: { present: !!border, commands: border?.commandBuffer?.length || 0 },
            crates: crates.length, cover: COVER.length,
            invalidCollision: COVER.filter((p: any) => walkable(p)).length,
            spawnValid: walkable(RUN_START), source: scene.textures.exists('ruin'),
            heroTexture: scene.heroImage.texture.key,
        };
    });
    expect(state.world).toEqual({ width: 3500, height: 2650 });
    expect(state.original).toEqual({ width: 1448, height: 1086 });
    expect(state.origin).toEqual({ x: 1026, y: 782 });
    expect(state.floor).toMatchObject({
        width: 3500, height: 2650, texture: 'ruin-floor-loop',
        sourceWidth: 768, sourceHeight: 768,
    });
    expect(state.district).toEqual({
        x: 1026, y: 782, width: 1448, height: 1086,
        texture: 'ruin-district-blend',
    });
    expect(state.border.present).toBe(true);
    expect(state.border.commands).toBeGreaterThan(0);
    expect(state.cover).toBe(11);
    expect(state.crates).toBe(state.cover);
    expect(state.invalidCollision).toBe(0);
    expect(state.source).toBe(true);
    expect(state.spawnValid).toBe(true);
    await expect.poll(async () => page.evaluate(() =>
        (window as any).__app.scene.heroImage.texture.key
    )).toMatch(/^sigma-(atlas|rear-v2|flex-v2|matte-)/);
    await page.screenshot({ path: 'test-results/b2-4-original-alley-central-district.png' });
});

test('B2.4 câmara atravessa o novo cenário, com piso e limites reais nas extremidades', async ({ page }) => {
    test.setTimeout(65000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await enter(page);
    const initial = await page.evaluate(() => {
        const app = (window as any).__app;
        const c = app.scene.cameras.main;
        return { worldWidth: c.worldView.width, cameraX: c.scrollX,
            playerX: app.run.pos.x, playerY: app.run.pos.y };
    });
    const target = await page.evaluate(async () => {
        const worldUrl: string = '/src/game/simulation/world.ts';
        const { walkable, RUN_START } =
            await import(/* @vite-ignore */ worldUrl);
        const app = (window as any).__app;
        const goal = { x: 3150, y: 1392 };
        if (!walkable(goal)) throw new Error('Eastern ruin district should be walkable');
        // Only move the test fixture. Real-player movement and collision are
        // covered by unit and existing keyboard/joystick Playwright tests.
        app.scene.tick = undefined;
        app.run.pos = goal;
        app.cameraFocus = { ...goal };
        app.scene.cameras.main.centerOn(goal.x, goal.y);
        return { distance: Math.abs(goal.x - RUN_START.x),
            pos: { ...app.run.pos }, hp: app.run.hp };
    });
    expect(target.distance).toBeGreaterThan(1200);
    await expect.poll(async () => page.evaluate(() =>
        (window as any).__app.scene.cameras.main.scrollX
    )).toBeGreaterThan(initial.cameraX + 900);
    const far = await page.evaluate(() => {
        const app = (window as any).__app, c = app.scene.cameras.main;
        return {
            x: app.run.pos.x, y: app.run.pos.y,
            hp: app.run.hp, cameraX: c.scrollX,
            floorTexture: app.scene.children.list.find((o: any) =>
                o.name === 'ruin-expanded-floor')?.texture?.key,
            border: app.scene.children.list.some((o: any) =>
                o.name === 'ruin-real-walkable-border'),
        };
    });
    expect(far.x).toBe(3150);
    expect(far.y).toBe(1392);
    expect(far.hp).toBe(target.hp);
    expect(far.floorTexture).toBe('ruin-floor-loop');
    expect(far.border).toBe(true);
    await page.screenshot({ path: 'test-results/b2-4-east-ruin-alley-walkable.png' });
});

test('B2.4 mobile landscape controls stay over the actual expanded arena', async ({ browser }) => {
    test.setTimeout(60000);
    const ctx = await browser.newContext({
        viewport: { width: 915, height: 412 }, screen: { width: 915, height: 412 },
        hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    });
    try {
        const page = await ctx.newPage();
        await enter(page);
        await expect(page.locator('#touch-zone')).toBeVisible();
        await page.evaluate(() => {
            const app = (window as any).__app;
            const goal = { x: 3030, y: 1800 };
            app.scene.tick = undefined;
            app.run.pos = goal;
            app.cameraFocus = { ...goal };
            app.scene.cameras.main.centerOn(goal.x, goal.y);
            app.alignTouchZone();
        });
        await page.waitForTimeout(200);
        const viewport = await page.evaluate(() => {
            const canvas = document.querySelector('canvas')!.getBoundingClientRect();
            const zone = document.querySelector('#touch-zone')!.getBoundingClientRect();
            return {
                rect: { l: zone.left, t: zone.top, r: zone.right, b: zone.bottom },
                canvas: { l: canvas.left, t: canvas.top, r: canvas.right, b: canvas.bottom },
                zoom: (window as any).__app.scene.cameras.main.zoom,
            };
        });
        expect(viewport.rect.l).toBeGreaterThanOrEqual(viewport.canvas.l - 1);
        expect(viewport.rect.t).toBeGreaterThanOrEqual(viewport.canvas.t - 1);
        expect(viewport.rect.r).toBeLessThanOrEqual(viewport.canvas.r + 1);
        expect(viewport.rect.b).toBeLessThanOrEqual(viewport.canvas.b + 1);
        expect(viewport.rect.r - viewport.rect.l).toBeGreaterThan(100);
        expect(viewport.zoom).toBeGreaterThan(0);
        await page.screenshot({ path: 'test-results/b2-4-mobile-landscape-east.png' });
    } finally {
        await ctx.close();
    }
});
