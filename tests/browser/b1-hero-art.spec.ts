import { expect, test } from '@playwright/test';

test('B1 review gallery displays three original animated transparent SVG hero atlases', async ({ page }) => {
    await page.setViewportSize({ width: 1300, height: 940 });
    await page.goto('/assets/cartoon/b1/index.html');
    await expect(page).toHaveTitle('Aura Farmer — B1 Sprite Review');
    await expect(page.getByRole('heading', { name: 'SIGMA', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'COOL KID', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ALPHA CHAD', exact: true })).toBeVisible();
    const loaded = await page.locator('.sheet img').evaluateAll(nodes => nodes.map(node => {
        const img = node as HTMLImageElement;
        return { complete: img.complete, width: img.naturalWidth, height: img.naturalHeight };
    }));
    expect(loaded).toHaveLength(3);
    expect(loaded.every(item => item.complete && item.width === 800 && item.height === 896)).toBe(true);
    await page.getByRole('combobox', { name: 'Animação Sigma' }).selectOption('back');
    await expect(page.locator('[data-hero="sigma"] .sprite')).toHaveAttribute('data-frame', /1[1-4]/);
    await page.screenshot({ path: 'test-results/b1-art-review-gallery.png', fullPage: true });
});

test('Phaser loads B1 sheets and actually renders a new illustrated hero in-game', async ({ page }) => {
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
    await expect.poll(async () => page.evaluate(() => {
        const scene = (window as any).__app.scene;
        return scene.heroImage?.texture?.key?.startsWith('b1-') ?? false;
    })).toBe(true);
    const frames = await page.evaluate(() => {
        const scene = (window as any).__app.scene;
        return ['sigma', 'cool-kid', 'alpha'].map(id => {
            const texture = scene.textures.get('b1-' + id);
            return {
                key: texture.key,
                loaded: scene.textures.exists('b1-' + id),
                frame15: !!texture.get(15),
                width: (texture.getSourceImage() as HTMLImageElement).width,
                height: (texture.getSourceImage() as HTMLImageElement).height,
            };
        });
    });
    for (const atlas of frames) {
        expect(atlas.loaded).toBe(true);
        expect(atlas.frame15).toBe(true);
        expect(atlas.width).toBe(800);
        expect(atlas.height).toBe(896);
    }
    await page.screenshot({ path: 'test-results/b1-art-live-gameplay.png' });
});
