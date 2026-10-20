import { expect, test } from '@playwright/test';

test('B1 keeps approved sprites while providing in-game pose transitions', async ({ page }) => {
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
    await expect(page.locator('#hud')).toBeVisible();
    const result = await page.evaluate(() => {
        const scene = (window as any).__app.scene;
        const art = scene.heroImage;
        const ids = ['sigma', 'cool-kid', 'alpha'];
        return {
            texture: art.texture.key as string,
            approvedAtlases: ids.every(id => scene.textures.exists(id + '-atlas')),
            rejectedAtlases: ids.some(id => scene.textures.exists('b1-' + id)),
            motion: art.getData('motion') as { lift: number; rotation: number; scaleX: number; scaleY: number },
        };
    });
    expect(result.texture).toMatch(/^sigma-(atlas|rear-v2|flex-v2|matte-)/);
    expect(result.approvedAtlases).toBe(true);
    expect(result.rejectedAtlases).toBe(false);
    expect(result.motion).toEqual(expect.objectContaining({
        lift: expect.any(Number), rotation: expect.any(Number),
        scaleX: expect.any(Number), scaleY: expect.any(Number),
    }));
    await page.screenshot({ path: 'test-results/b1-original-art-motion.png' });
});
