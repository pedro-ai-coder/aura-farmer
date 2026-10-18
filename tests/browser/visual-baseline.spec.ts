import { test, expect, type Page, type TestInfo } from '@playwright/test';
import type { BrowserApp } from '../../src/browser/app';

declare global {
    interface Window { __app: BrowserApp; }
}

/** Capture *real runtime* before-screenshots, not illustrations or golden images.
 * Every attachment appears in the existing CI browser-test-results artifact.
 */
async function visitWithTestHook(page: Page) {
    await page.route('**/src/main.ts', async route => {
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({
            response,
            body: (await response.text()).replace('new BrowserApp();', 'window.__app = new BrowserApp();'),
        });
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
    await expect(page.locator('.hero-card img')).toHaveCount(3);
}

async function capture(page: Page, testInfo: TestInfo, name: string) {
    await testInfo.attach(name, {
        body: await page.screenshot({ animations: 'disabled', fullPage: true }),
        contentType: 'image/png',
    });
}

test('Option A BEFORE: desktop menu at 1280 and 1920, upgrade and pause', async ({ page }, testInfo) => {
    await visitWithTestHook(page);
    for (const viewport of [{ width: 1280, height: 720 }, { width: 1920, height: 1080 }]) {
        await page.setViewportSize(viewport);
        await expect(page.locator('.home')).toBeVisible();
        await capture(page, testInfo, `before-home-${viewport.width}x${viewport.height}`);
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    await expect(page.locator('#hud')).toBeVisible();
    await page.waitForTimeout(250);
    await capture(page, testInfo, 'before-sigma-gameplay-1280x720');
    await page.evaluate(() => { const run = window.__app.run!; run.aura = 100; run.activateFlex(); });
    await capture(page, testInfo, 'before-sigma-flex-1280x720');

    await page.evaluate(() => { window.__app.run!.gainXp(100); });
    await expect(page.locator('.choices .choice')).toHaveCount(3);
    await capture(page, testInfo, 'before-level-up-three-cards-1280x720');

    await page.reload();
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await capture(page, testInfo, 'before-pause-overlay-1280x720');
});

for (const hero of ['cool-kid', 'alpha'] as const)
    test(`Option A BEFORE: ${hero} in-game sprite`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width: 1280, height: 720 });
        await visitWithTestHook(page);
        await page.locator(`[data-action="hero"][data-value="${hero}"]`).click();
        await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
        await expect(page.locator('#modal')).toBeHidden();
        await page.waitForTimeout(250);
        await capture(page, testInfo, `before-${hero}-gameplay-1280x720`);
        await page.evaluate(() => { const run = window.__app.run!; run.aura = 100; run.activateFlex(); });
        await capture(page, testInfo, `before-${hero}-flex-1280x720`);
    });

test('Option A BEFORE: Big Hater presentation (test fixture, not a completed run)', async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await visitWithTestHook(page);
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    await page.evaluate(() => {
        // The same transition trigger used in functional browser regressions.
        // This fixture captures art only: it does not count as a natural win.
        const run = window.__app.run!;
        run.wave = 5;
        run.time = 899.99;
        run.nextSpawn = Infinity;
    });
    await expect(page.locator('.boss-meter')).toContainText('BIG HATER');
    await capture(page, testInfo, 'before-big-hater-1280x720');
    await page.evaluate(() => { window.__app.run!.time = 1080; });
    await expect(page.locator('.boss-meter')).toContainText('FULL HATER MODE');
    await capture(page, testInfo, 'before-berserk-1280x720');
});

test('Option A BEFORE: mobile portrait and landscape viewport', async ({ browser }, testInfo) => {
    for (const viewport of [{ width: 390, height: 844 }, { width: 915, height: 412 }]) {
        const context = await browser.newContext({
            viewport, screen: viewport, isMobile: true, hasTouch: true, deviceScaleFactor: 1,
        });
        try {
            const page = await context.newPage();
            await page.goto('/');
            await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
            await capture(page, testInfo, `before-mobile-home-${viewport.width}x${viewport.height}`);
            await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
            await expect(page.locator('#hud')).toBeVisible();
            await page.waitForTimeout(250);
            await capture(page, testInfo, `before-mobile-gameplay-${viewport.width}x${viewport.height}`);
        } finally {
            await context.close();
        }
    }
});
