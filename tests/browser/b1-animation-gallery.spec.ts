import { test, expect } from '@playwright/test';

test('Interactive gallery only shows approved Sigma / Cool Kid / Alpha Chad sprites and real atlas frames', async ({ page }) => {
    await page.setViewportSize({ width: 1180, height: 860 });
    await page.goto('/assets/cartoon/option-a-v1/animation-gallery.html');
    await expect(page).toHaveTitle('Aura Farmer · Galeria de animações B1');
    const heroes = page.locator('[data-hero]');
    await expect(heroes).toHaveCount(3);
    await expect(page.locator('#frame-info')).toContainText('Sigma');
    await expect.poll(async () => page.locator('#hero-canvas').evaluate(node => {
        const canvas = node as HTMLCanvasElement;
        const pixels = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height).data;
        // Non-background sprite must cover an appreciable part of the stage.
        let opaque = 0;
        for (let i = 3; i < pixels.length; i += 16) if (pixels[i] > 200) opaque++;
        return opaque > 300;
    })).toBe(true);
    await page.getByRole('button', { name: 'COOL KID' }).click();
    await page.locator('#direction').selectOption('6');
    await expect(page.locator('#frame-info')).toContainText('Cool Kid');
    await expect(page.locator('#frame-info')).toContainText('rear:');
    await page.locator('#state').selectOption('flex');
    await expect(page.locator('#frame-info')).toContainText('flex:');
    await page.getByRole('button', { name: 'ALPHA CHAD' }).click();
    await page.locator('#state').selectOption('run');
    await page.locator('#direction').selectOption('6');
    await expect(page.locator('#frame-info')).toContainText('rear:');
    await page.locator('#secondary-motion').uncheck();
    await page.locator('#reduced-motion').check();
    await page.locator('#speed').fill('0.5');
    await page.locator('#play').click();
    await page.getByRole('button', { name: 'Frame seguinte' }).click();
    await expect(page.locator('#play')).toHaveAttribute('aria-pressed', 'false');
    await page.screenshot({ path: 'test-results/b1-current-characters-animation-gallery.png', fullPage: true });
});

test('Animation gallery remains usable at a narrow mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/assets/cartoon/option-a-v1/animation-gallery.html');
    await expect(page.locator('#frame-info')).toContainText('Sigma');
    await expect(page.getByRole('button', { name: 'ALPHA CHAD' })).toBeVisible();
    const widths = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
    }));
    expect(widths.document).toBeLessThanOrEqual(widths.viewport + 2);
});

test('FPS diagnostics are explicit opt-in and do not swap character PNGs', async ({ page }) => {
    await page.route('**/src/main.ts', async route => {
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({
            response,
            body: (await response.text()).replace('new BrowserApp();', 'window.__app = new BrowserApp();'),
        });
    });
    await page.goto('/?fps=1');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#render-frame-meter')).toContainText('FPS observado:', { timeout: 15000 });
    const data = await page.evaluate(() => ({
        hero: (window as any).__app.scene.heroImage.texture.key as string,
        injectedNewArt: (window as any).__app.scene.textures.exists('b1-sigma'),
    }));
    expect(data.hero).toMatch(/^sigma-(atlas|rear-v2|flex-v2|matte-)/);
    expect(data.injectedNewArt).toBe(false);
    await page.screenshot({ path: 'test-results/b1-frame-diagnostics.png' });
});
