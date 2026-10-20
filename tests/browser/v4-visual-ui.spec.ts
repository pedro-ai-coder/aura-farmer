import { expect, test, type Page } from '@playwright/test';

async function open(page: Page) {
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
async function start(page: Page) {
    await open(page);
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
}

test('V4 Option A desktop: readable home, inventory icons and normal upgrade cards', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await open(page);
    const fontSizes = await page.evaluate(() => {
        const font = (query: string) => parseFloat(getComputedStyle(document.querySelector(query)!).fontSize);
        return { heroName: font('.hero-card strong'), description: font('.hero-description'),
            body: font('.home-copy > p:not(.eyebrow)'), role: font('.hero-card small') };
    });
    expect(fontSizes.heroName).toBeGreaterThanOrEqual(16);
    expect(fontSizes.description).toBeGreaterThanOrEqual(16);
    expect(fontSizes.role).toBeGreaterThanOrEqual(13);
    await page.screenshot({ path: 'test-results/v4-home-1280x720.png' });

    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    await expect(page.locator('.meter.hp')).toContainText('The Sigma');
    await page.screenshot({ path: 'test-results/v4-hud-1280x720.png' });
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await expect(page.locator('.equipment-slot')).toHaveCount(8);
    await expect(page.locator('.equipment-slot .slot-icon')).toHaveCount(8);
    expect(await page.locator('.equipment-slot:not(.empty) .slot-icon').first().textContent()).toBe('⌒');
    await page.screenshot({ path: 'test-results/v4-build-1280x720.png' });

    await page.getByRole('button', { name: 'BACK TO THE FARM' }).click();
    await page.evaluate(() => { (window as any).__app.run.gainXp(100); });
    await expect(page.locator('.choice')).toHaveCount(3);
    const actualSizes = await page.evaluate(() => {
        const px = (css: string) => parseFloat(getComputedStyle(document.querySelector(css)!).fontSize);
        return { description: px('.choice p'), comparison: px('.comparison'),
            title: px('.choice h3'), eyebrow: px('.choice-top') };
    });
    expect(actualSizes.description).toBeGreaterThanOrEqual(16);
    expect(actualSizes.comparison).toBeGreaterThanOrEqual(14);
    expect(actualSizes.title).toBeGreaterThanOrEqual(17);
    await page.screenshot({ path: 'test-results/v4-upgrades-1280x720.png' });
});

test('V4 legendary grid uses six functional cards in two desktop rows', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await start(page);
    await page.evaluate(() => {
        const run = (window as any).__app.run;
        run.wave = 4; run.time = 540; run.openLegendary();
    });
    await expect(page.locator('.legendary-offer .choice')).toHaveCount(6);
    // The CSS hover animation lifts a card by up to 2px. The previous
    // strict equality of rounded top coordinates sometimes counted the
    // hovered card as a third row, even though the 3×2 grid was correct.
    await page.mouse.move(2, 2);
    await page.evaluate(() => document.fonts.ready);
    await expect.poll(async () =>
        page.locator('.legendary-offer .choice').evaluateAll(cards => {
            const rects = cards.map(card => card.getBoundingClientRect());
            const aligned = (indices: number[]) => {
                const tops = indices.map(i => rects[i].top);
                return Math.max(...tops) - Math.min(...tops) <= 3;
            };
            return aligned([0, 1, 2]) && aligned([3, 4, 5]) &&
                rects[0].left < rects[1].left && rects[1].left < rects[2].left &&
                rects[3].left < rects[4].left && rects[4].left < rects[5].left &&
                rects[0].bottom <= rects[3].top - 2;
        })
    ).toBe(true);
    const grid = await page.locator('.legendary-offer .choice').evaluateAll(cards => {
        const rects = cards.map(card => card.getBoundingClientRect());
        return { noOverlap: rects[0].bottom <= rects[3].top - 2,
            contentFits: cards.every(card => card.scrollHeight <= card.clientHeight + 2) };
    });
    expect(grid.noOverlap).toBe(true);
    expect(grid.contentFits).toBe(true);
    await page.locator('.choice').first().click();
    await expect(page.locator('.choice').first()).toHaveAttribute('aria-pressed', 'true');
    const confirm = page.getByRole('button', { name: /CONFIRM CHOICE|REPLACE & EQUIP/ });
    await expect(confirm).toBeEnabled();
    await expect(confirm).toBeInViewport();
    await expect(page.getByRole('button', { name: 'DECIDE LATER' })).toBeInViewport();
    await page.screenshot({ path: 'test-results/v4-legendary-six-1280x720.png' });
});

test('V4 landscape touch: scrollable cards, visible controls and no document overflow', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 915, height: 412 },
        screen: { width: 915, height: 412 },
        hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    });
    try {
        const page = await context.newPage();
        await start(page);
        await page.evaluate(() => {
            const run = (window as any).__app.run;
            run.wave = 4; run.time = 540; run.openLegendary();
        });
        await expect(page.locator('.legendary-offer .choice')).toHaveCount(6);
        const shape = await page.evaluate(() => {
            const modal = document.getElementById('modal')!;
            const panel = modal.querySelector<HTMLElement>('.panel')!;
            return { viewportWidth: window.innerWidth, scrollWidth: document.documentElement.scrollWidth,
                modalScrollHeight: modal.scrollHeight, modalClientHeight: modal.clientHeight,
                panelScrollHeight: panel.scrollHeight, panelClientHeight: panel.clientHeight,
                font: getComputedStyle(panel.querySelector('.choice p')!).fontSize };
        });
        expect(shape.scrollWidth).toBeLessThanOrEqual(shape.viewportWidth + 1);
        expect(shape.panelClientHeight).toBeGreaterThan(200);
        await page.screenshot({ path: 'test-results/v4-legendary-mobile-landscape.png' });
        await page.getByRole('button', { name: 'DECIDE LATER' }).scrollIntoViewIfNeeded();
        await expect(page.getByRole('button', { name: 'DECIDE LATER' })).toBeInViewport();
        await page.getByRole('button', { name: 'DECIDE LATER' }).click();
        await expect(page.locator('#modal')).toBeHidden();
        await expect(page.locator('#touch-zone')).toBeVisible();
        await expect(page.locator('.build-chip')).toBeHidden();
        await expect(page.locator('#hud .flex')).toBeVisible();
        await expect(page.locator('[data-action="pause"]').first()).toBeVisible();
        await page.screenshot({ path: 'test-results/v4-mobile-gameplay-915x412.png' });
    } finally {
        await context.close();
    }
});
