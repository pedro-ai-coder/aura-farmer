import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

async function enter(page: Page) {
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

/** One deterministic stress fixture of actual actor models and the real Phaser
 * renderer. It is NOT a natural run, an automated win or a hardware FPS SLA.
 */
async function crowd(page: Page, reduced: boolean) {
    const result = await page.evaluate(async low => {
        const moduleUrl: string = '/src/game/simulation/run.ts';
        const worldUrl: string = '/src/game/simulation/world.ts';
        const { Run } = await import(/* @vite-ignore */ moduleUrl);
        const { walkable } = await import(/* @vite-ignore */ worldUrl);
        const app = (window as any).__app;
        const run = new Run('alpha', 39022);
        run.wave = 4;
        run.time = 600;
        run.mode = 'playing';
        run.reduceMotion = low;
        run.pos = { x: 724, y: 610 };
        const kinds = ['npc', 'hater', 'beta', 'ratio-ram', 'doomscroller',
            'ping-sniper', 'fanum-leech', 'copium-puffer'];
        let created = 0;
        for (let n = 0; n < 70; n++) {
            const angle = n * 2.3999632297;
            const distance = 112 + Math.sqrt(n / 70) * 270;
            const candidate = { x: run.pos.x + Math.cos(angle) * distance,
                y: run.pos.y + Math.sin(angle) * distance };
            if (!walkable(candidate, 20)) continue;
            const e = run.spawn(kinds[n % kinds.length], candidate);
            if (e) { e.born = run.time - 1; created++; }
        }
        run.addArea({ x: run.pos.x + 135, y: run.pos.y - 60,
            radius: 95, hostile: true, damage: 10, shape: 'circle',
            at: run.time + 1, end: run.time + 2.5, label: 'VISUAL QA WARNING' });
        run.addArea({ x: run.pos.x - 120, y: run.pos.y + 50,
            radius: 105, hostile: false, weapon: 'personal-space', damage: 20,
            shape: 'circle', at: run.time, end: run.time + 2.5, label: 'QA PULSE' });
        run.shields = { 'qa-only': { amount: 25, until: run.time + 3 } };
        app.run = run;
        app.scene.run = run;
        // Phaser keeps rendering real art and enemy animation; only combat
        // simulation time is frozen for consistent screenshots and comparisons.
        app.scene.tick = undefined;
        app.render(true);
        return { created, wave: run.wave, reduced: run.reduceMotion, hero: run.characterId };
    }, reduced);
    expect(result.wave).toBe(4);
    expect(result.created).toBeGreaterThanOrEqual(25);
    await expect(page.locator('#modal')).toBeHidden();
    await page.waitForTimeout(300);
    return result;
}

/** This is a browser-CI observation, not reference desktop/phone hardware.
 * Do NOT set a pass/fail 60/30 FPS gate on a shared virtual CI machine.
 */
async function sampleFrames(page: Page) {
    return await page.evaluate(async () => {
        const frames: number[] = [];
        let previous: number | undefined;
        const began = performance.now();
        await new Promise<void>(resolve => {
            const advance = (stamp: number) => {
                if (previous !== undefined) frames.push(stamp - previous);
                previous = stamp;
                if (stamp - began < 1800) requestAnimationFrame(advance);
                else resolve();
            };
            requestAnimationFrame(advance);
        });
        const sorted = [...frames].sort((a, b) => a - b);
        const span = frames.reduce((sum, delta) => sum + delta, 0);
        return {
            frameCount: frames.length,
            sampleSeconds: Math.round(span / 10) / 100,
            observedFps: span > 0 ? Math.round(frames.length / (span / 1000) * 10) / 10 : 0,
            p95FrameMs: sorted.length ? Math.round(sorted[Math.ceil(sorted.length * .95) - 1] * 10) / 10 : 0,
            devicePixelRatio: window.devicePixelRatio,
            viewport: { width: innerWidth, height: innerHeight },
            userAgent: navigator.userAgent,
            source: 'shared GitHub Actions headless Chromium, not a calibrated device',
        };
    });
}

test('V6 evidence: desktop dense wave, warning legibility, normal and reduced effects', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await enter(page);
    const full = await crowd(page, false);
    await page.screenshot({ path: 'test-results/v6-crowded-desktop-normal.png' });
    const fullTiming = await sampleFrames(page);
    expect(fullTiming.frameCount).toBeGreaterThan(0);
    const reduced = await crowd(page, true);
    await page.screenshot({ path: 'test-results/v6-crowded-desktop-reduced.png' });
    const reducedTiming = await sampleFrames(page);
    expect(reducedTiming.frameCount).toBeGreaterThan(0);
    mkdirSync('test-results', { recursive: true });
    writeFileSync('test-results/v6-desktop-render-observations.json',
        JSON.stringify({ full, fullTiming, reduced, reducedTiming,
            qualifier: 'CI-only rendering sample, not a guarantee of 60 FPS on player hardware' }, null, 2));
});

test('V6 evidence: short landscape crowded wave and touch exclusion', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 915, height: 412 }, screen: { width: 915, height: 412 },
        hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    });
    try {
        const page = await context.newPage();
        await enter(page);
        const state = await crowd(page, true);
        await expect(page.locator('#touch-zone')).toBeVisible();
        await page.screenshot({ path: 'test-results/v6-crowded-mobile-915x412.png' });
        const frameMetrics = await sampleFrames(page);
        expect(frameMetrics.frameCount).toBeGreaterThan(0);
        writeFileSync('test-results/v6-mobile-emulated-render-observations.json',
            JSON.stringify({ state, frameMetrics,
                qualifier: 'desktop Chromium emulating phone viewport; NOT a physical smartphone or certified 30 FPS' }, null, 2));
    } finally {
        await context.close();
    }
});

test('V6 evidence: portrait viewport honestly retains rotate hint without hiding the menu', async ({ browser }) => {
    const context = await browser.newContext({
        viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 },
        hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    });
    try {
        const page = await context.newPage();
        await enter(page);
        await expect(page.locator('#orientation-hint')).toBeVisible();
        await page.screenshot({ path: 'test-results/v6-portrait-orientation-current.png' });
        // This records the current design; it does not mean portrait is approved.
    } finally {
        await context.close();
    }
});
