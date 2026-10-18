import { test, expect } from '@playwright/test';

test('mobile joystick ignores blue letterbox and remains inside the playable map', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 915, height: 412 },
        screen: { width: 915, height: 412 },
        isMobile: true,
        hasTouch: true,
        deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    try {
        await page.goto('/');
        await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
        await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
        await expect(page.locator('#modal')).toBeHidden();
        const zone = page.locator('#touch-zone');
        await expect(zone).toBeVisible();
        const initial = await page.evaluate(() => {
            const canvas = document.querySelector('canvas')!;
            const rect = canvas.getBoundingClientRect();
            const camera = (window as any).__app?.scene?.cameras?.main;
            return { width: rect.width, height: rect.height, left: rect.left, top: rect.top, camera: !!camera };
        });
        expect(initial.width).toBeGreaterThan(0);
        const box = await zone.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.width).toBeGreaterThan(100);
        expect(box!.width).toBeLessThanOrEqual(initial.width + 1);
        expect(box!.height).toBeLessThanOrEqual(initial.height + 1);
        // The area must not extend into the blank backdrop.
        expect(box!.x).toBeGreaterThanOrEqual(initial.left - 1);
        expect(box!.x + box!.width).toBeLessThanOrEqual(initial.left + initial.width + 1);

        const startX = box!.x + box!.width / 2;
        const startY = box!.y + box!.height / 2;
        await page.touchscreen.tap(startX, startY);
        await expect(page.locator('#touch-joystick')).toBeHidden();
        // A touch in the far-right empty space must never display a stick.
        const outsideX = Math.min(914, Math.ceil(box!.x + box!.width + 70));
        if (outsideX > box!.x + box!.width + 10) {
            await page.touchscreen.tap(outsideX, Math.min(411, Math.max(0, startY)));
            await expect(page.locator('#touch-joystick')).toBeHidden();
        }
    } finally {
        await context.close();
    }
});
