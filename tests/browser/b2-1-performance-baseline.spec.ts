import { test, expect, type Page } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';

type SceneCase = {
    target: 20 | 50 | 100;
    reducedMotion: boolean;
    simulation: 'frozen' | 'active';
};
type Observation = Record<string, unknown>;

async function enter(page: Page) {
    // Existing browser QA seam: expose app only in the test browser, not production.
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
    await expect(page.locator('#modal')).toBeHidden();
    await expect(page.locator('#render-frame-meter')).toBeVisible();
    await expect.poll(async () => page.evaluate(() =>
        (window as any).__app.scene.heroImage.texture.key as string
    )).toMatch(/^sigma-(atlas|rear-v2|flex-v2|matte-)/);
}

/** Setup is deterministic in counts, positions, actor types and random seed.
 * The frozen scenario isolates drawing cost; active sim is measured separately.
 * These are diagnostic fixtures, not natural or representative full playthroughs.
 */
async function fixture(page: Page, testCase: SceneCase) {
    return page.evaluate(async ({target, reducedMotion, simulation}) => {
        const runUrl: string = '/src/game/simulation/run.ts';
        const worldUrl: string = '/src/game/simulation/world.ts';
        const { Run } = await import(/* @vite-ignore */ runUrl);
        const { walkable } = await import(/* @vite-ignore */ worldUrl);
        const app = (window as any).__app;
        const run = new Run('alpha', 39022);
        run.wave = 4;
        run.time = 600;
        run.mode = 'playing';
        run.reduceMotion = reducedMotion;
        run.pos = { x: 724, y: 610 };
        run.hp = 100000; // isolate renderer from premature defeat in active case
        run.nextSpawn = 1e9;
        const kinds = ['npc', 'hater', 'beta', 'ratio-ram',
            'doomscroller', 'ping-sniper', 'fanum-leech', 'copium-puffer'];
        let created = 0;
        // Golden-angle distribution with deterministic varying distance. Keep
        // attempting until the actual requested count exists on walkable floor.
        for (let i = 0; created < target && i < 2000; i++) {
            const angle = i * 2.399963229728653;
            const distance = 105 + 330 * Math.sqrt((i * .6180339887498949) % 1);
            const point = {
                x: run.pos.x + Math.cos(angle) * distance,
                y: run.pos.y + Math.sin(angle) * distance,
            };
            if (!walkable(point, 20)) continue;
            const enemy = run.spawn(kinds[i % kinds.length], point);
            if (!enemy) continue;
            enemy.born = run.time - 1;
            created++;
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
        if (simulation === 'active') {
            // Real updateEnemies/weapons/drop/sim CPU path, without user input.
            app.scene.tick = (dt: number) => run.update(dt, {
                x: 0, y: 0, aim: { x: 900, y: 570 }, manual: false,
            });
        } else {
            app.scene.tick = undefined;
        }
        app.render(true);
        app.scene.frameMeter.reset();
        return {
            seed: run.seed, hero: run.characterId, wave: run.wave,
            target, created, reducedMotion, simulation,
            areas: run.areas.length, initialHp: run.hp,
        };
    }, testCase);
}

async function collect(page: Page, testCase: SceneCase): Promise<Observation> {
    const setup = await fixture(page, testCase);
    // The real Phaser Scene is rendered every frame even when simulation is
    // frozen. Settle one frame, then sample for ~1.5 seconds.
    expect(setup.created).toBe(testCase.target);
    await page.waitForTimeout(1650);
    const evidence = await page.evaluate(() => {
        const app = (window as any).__app;
        const scene = app.scene;
        const run = scene.run;
        const meter = scene.frameMeter;
        return {
            performance: meter.snapshot(),
            actualEnemies: run.enemies.length,
            renderedActors: scene.actors.size,
            actualProjectiles: run.shots.length,
            actualEffects: run.effects.length,
            mode: run.mode,
            elapsedSimulationSeconds: run.time - 600,
            renderer: app.game.renderer.type,
            environment: {
                devicePixelRatio: window.devicePixelRatio,
                viewportWidth: innerWidth,
                viewportHeight: innerHeight,
                userAgent: navigator.userAgent,
                hardwareConcurrency: navigator.hardwareConcurrency,
            },
        };
    });
    expect((evidence.performance as { sampleCount: number }).sampleCount).toBeGreaterThan(3);
    expect((evidence.performance as { observedFps: number }).observedFps).toBeGreaterThan(0);
    expect(evidence.renderedActors).toBeGreaterThan(0);
    if (testCase.simulation === 'frozen') {
        expect(evidence.actualEnemies).toBe(testCase.target);
        expect(evidence.elapsedSimulationSeconds).toBe(0);
    } else {
        expect(evidence.elapsedSimulationSeconds).toBeGreaterThan(0);
    }
    return { fixture: setup, ...evidence };
}

async function report(page: Page, label: string, cases: SceneCase[]) {
    const observations: Observation[] = [];
    for (const scenario of cases) {
        const observation = await collect(page, scenario);
        observations.push(observation);
        if (scenario.target === 100 && scenario.simulation === 'frozen' && !scenario.reducedMotion) {
            await page.screenshot({
                path: 'test-results/b2-1-' + label + '-100-enemies.png',
            });
        }
    }
    mkdirSync('test-results', { recursive: true });
    writeFileSync('test-results/b2-1-' + label + '-baseline.json', JSON.stringify({
        version: 'B2.1', label,
        capturedBy: 'GitHub Actions / shared headless Chromium',
        limitations: [
            'NOT measured on player desktop or phone hardware',
            'NOT a calibrated 60/30 FPS pass/fail gate',
            'GPU/compositor/layout are not included in JS simulation/draw costs',
            'Frozen samples isolate render path; active case measures real simulation',
            'Frame cadence may be affected by CI contention and software rendering',
            'Sampled with ?fps=1 diagnostics overhead enabled',
        ],
        observations,
    }, null, 2) + '\n');
}

test('B2.1 baseline: desktop 20/50/100 enemies, normal/reduced, plus active simulation', async ({ page }) => {
    test.setTimeout(110000);
    await page.setViewportSize({ width: 1280, height: 720 });
    await enter(page);
    await report(page, 'desktop', [
        { target: 20, reducedMotion: false, simulation: 'frozen' },
        { target: 50, reducedMotion: false, simulation: 'frozen' },
        { target: 100, reducedMotion: false, simulation: 'frozen' },
        { target: 20, reducedMotion: true, simulation: 'frozen' },
        { target: 50, reducedMotion: true, simulation: 'frozen' },
        { target: 100, reducedMotion: true, simulation: 'frozen' },
        { target: 50, reducedMotion: false, simulation: 'active' },
    ]);
});

test('B2.1 baseline: touch landscape emulation 20/50/100 enemies', async ({ browser }) => {
    test.setTimeout(90000);
    const context = await browser.newContext({
        viewport: { width: 915, height: 412 }, screen: { width: 915, height: 412 },
        hasTouch: true, isMobile: true, deviceScaleFactor: 1,
    });
    try {
        const page = await context.newPage();
        await enter(page);
        await expect(page.locator('#touch-zone')).toBeVisible();
        await report(page, 'mobile-emulated', [
            { target: 20, reducedMotion: false, simulation: 'frozen' },
            { target: 50, reducedMotion: false, simulation: 'frozen' },
            { target: 100, reducedMotion: false, simulation: 'frozen' },
            { target: 50, reducedMotion: false, simulation: 'active' },
        ]);
    } finally {
        await context.close();
    }
});
