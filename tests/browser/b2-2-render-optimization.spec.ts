import { expect, test } from '@playwright/test';

/**
 * B2.2 verifies the real Phaser renderer with the approved PNG assets.
 * Scene culling and cached graphics may never mutate combat's world state.
 */
test('B2.2 uses cached contacts and only draws on-screen actors', async ({ page }) => {
    test.setTimeout(55000);
    await page.route('**/src/main.ts', async route => {
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({
            response,
            body: (await response.text()).replace('new BrowserApp();', 'window.__app = new BrowserApp();'),
        });
    });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/?fps=1');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();

    const setup = await page.evaluate(async () => {
        const url: string = '/src/game/simulation/run.ts';
        const { Run } = await import(/* @vite-ignore */ url);
        const app = (window as any).__app;
        const run = new Run('sigma', 1001);
        run.time = 600; run.wave = 4;
        run.pos = { x: 724, y: 610 };
        const a = run.spawn('npc', { x: 724, y: 570 })!;
        const b = run.spawn('hater', { x: 250, y: 640 })!;
        a.born = 599; b.born = 599;
        app.run = run;
        app.scene.run = run;
        app.scene.tick = undefined;
        app.scene.cameras.main.setZoom(2);
        app.scene.cameras.main.centerOn(724, 610);
        app.render(true);
        return { enemies: run.enemies.length, time: run.time, hp: run.hp };
    });
    expect(setup.enemies).toBe(2);
    await expect.poll(async () => page.evaluate(() => {
        const s = (window as any).__app.scene;
        return s.actorShadows.size;
    })).toBeGreaterThanOrEqual(1);

    const state = await page.evaluate(() => {
        const s = (window as any).__app.scene;
        const run = s.run;
        const cam = s.cameras.main;
        const side = run.enemies.find((e: any) => e.kind === 'hater');
        const distantImage = s.actors.get(side.id);
        return {
            heroTexture: s.heroImage.texture.key,
            heroShadow: { visible: s.heroShadow.visible, key: s.heroShadow.texture.key },
            shadowKeys: [...s.actorShadows.values()].map((entry: any) => entry.image.texture.key),
            stationCached: s.stationCache?.ready,
            actorImageVisible: distantImage?.visible ?? false,
            view: { x: cam.worldView.x, y: cam.worldView.y, width: cam.worldView.width },
            enemies: run.enemies.length, hp: run.hp, time: run.time,
        };
    });
    expect(state.heroTexture).toMatch(/^sigma-(atlas|rear-v2|flex-v2|matte-)/);
    expect(state.heroShadow.key).toBe('actor-contact-2000');
    expect(state.heroShadow.visible).toBe(true);
    expect(state.shadowKeys.every((key: string) => key.startsWith('actor-contact-'))).toBe(true);
    expect(state.stationCached).toBe(true);
    expect(state.actorImageVisible).toBe(false);

    await page.waitForTimeout(270);
    const unchanged = await page.evaluate(() => {
        const s = (window as any).__app.scene;
        return { enemies: s.run.enemies.length, hp: s.run.hp, time: s.run.time };
    });
    expect(unchanged).toEqual({ enemies: setup.enemies, hp: setup.hp, time: setup.time });

    await page.evaluate(() => {
        const app = (window as any).__app;
        app.scene.cameras.main.setZoom(.6);
        app.scene.cameras.main.centerOn(724, 610);
    });
    await expect.poll(async () => page.evaluate(() => {
        const s = (window as any).__app.scene;
        return s.actors.size === 2 &&
            [...s.actors.values()].every((image: any) => image.visible);
    })).toBe(true);
    await page.screenshot({ path: 'test-results/b2-2-cached-ground-contacts.png' });
    await page.evaluate(() => {
        const app = (window as any).__app;
        app.run = undefined; app.scene.run = undefined;
    });
    await expect.poll(async () => page.evaluate(() => {
        const s = (window as any).__app.scene;
        return s.actors.size === 0 && s.actorShadows.size === 0 &&
            !s.heroShadow.visible && !s.stationBase.visible;
    })).toBe(true);
});

test('B2.2 preserves danger cue graphics even when its center is off screen', async ({ page }) => {
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
    const state = await page.evaluate(() => {
        const app = (window as any).__app;
        const run = app.run;
        const area = run.addArea({
            x: run.pos.x + 160, y: run.pos.y, radius: 110, damage: 3,
            shape: 'circle', hostile: true, at: run.time + 1, end: run.time + 2,
        });
        // The camera has a narrow view, but the circle crosses the right edge.
        app.scene.cameras.main.setZoom(4);
        app.scene.cameras.main.centerOn(run.pos.x, run.pos.y);
        run.mode = 'paused';
        return { id: area.id, originalAreaCount: run.areas.length };
    });
    await page.waitForTimeout(250);
    const after = await page.evaluate(() => {
        const app = (window as any).__app;
        const area = app.run.areas.find((a: any) => a.id === Number(
            (window as any).__unused ?? -1)) ?? app.run.areas.at(-1);
        return { areaCount: app.run.areas.length, radius: area.radius,
            damage: area.damage, present: app.scene.ground.commandBuffer.length > 0 };
    });
    expect(after).toMatchObject({ areaCount: state.originalAreaCount, radius: 110, damage: 3, present: true });
});
