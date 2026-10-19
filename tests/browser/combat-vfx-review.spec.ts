import { test, expect } from '@playwright/test';

/** Evidence of the ACTUAL Phaser renderer using declared test-only combat
 * fixtures. Not a complete run, new illustrations or evidence of game balance.
 */
test('V3 Option A: nine weapon looks, pickup/shield clarity and three Flexes', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
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
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible();

    const weaponIds = [
        'ratio-blaster', 'no-cap', 'brainrot-feed',
        'keyboard-warrior', 'ban-hammer', 'touch-grass',
        'cope-shield', 'chad-hands', 'personal-space',
    ];
    for (const weapon of weaponIds) {
        const result = await page.evaluate((id) => {
            const run = (window as any).__app.run;
            run.mode = 'paused'; // freeze simulation for a reproducible ART fixture
            run.time = 45;
            run.areas = []; run.shots = []; run.enemies = []; run.drops = [];
            run.effects = []; run.shields = {};
            run.flexUntil = 0; run.reduceMotion = false;
            const angle = -Math.PI / 6;
            const x = run.pos.x + 125, y = run.pos.y - 65;
            if (id === 'ratio-blaster' || id === 'no-cap') {
                run.shots.push({
                    x, y, at: run.time, id: 700, angle, speed: 700,
                    remaining: 300, damage: 40, radius: id === 'no-cap' ? 16 : 6,
                    hostile: false, source: 0, weapon: id,
                    activation: 1, pierce: 1, hit: [], primary: true,
                });
                if (id === 'no-cap')
                    run.addArea({ x: x - 70, y: y + 20, radius: 145, shape: 'line',
                        angle, width: 25, weapon: id, hostile: false, at: run.time,
                        end: run.time + .12, damage: 20 });
            } else {
                const shape = id === 'brainrot-feed' || id === 'personal-space' ? 'circle' : 'cone';
                run.addArea({
                    x: shape === 'circle' ? x : run.pos.x,
                    y: shape === 'circle' ? y : run.pos.y,
                    radius: id === 'brainrot-feed' ? 100 : id === 'personal-space' ? 135 : 125,
                    shape, angle, arc: Math.PI * .7, weapon: id, hostile: false,
                    at: run.time, end: run.time + .12, damage: 20,
                });
            }
            return { weapon: id, areas: run.areas.length, shots: run.shots.length };
        }, weapon);
        expect(result.areas + result.shots).toBeGreaterThan(0);
        await page.waitForTimeout(85);
        await canvas.screenshot({ path: `test-results/v3-weapon-${weapon}.png` });
    }

    await page.evaluate(() => {
        const run = (window as any).__app.run;
        run.areas = []; run.shots = []; run.enemies = []; run.effects = [];
        run.drops = [
            { x: run.pos.x + 105, y: run.pos.y - 75, id: 10, xp: 0, kind: 'snack' },
            { x: run.pos.x + 170, y: run.pos.y - 75, id: 11, xp: 0, kind: 'magnet' },
            { x: run.pos.x + 235, y: run.pos.y - 75, id: 12, xp: 8 },
        ];
        run.shields = { 'test-shield': { amount: 25, until: run.time + 5 } };
    });
    await page.waitForTimeout(85);
    await canvas.screenshot({ path: 'test-results/v3-shield-health-magnet-xp.png' });

    for (const hero of ['sigma', 'cool-kid', 'alpha'] as const) {
        const state = await page.evaluate(async id => {
            const moduleUrl: string = '/src/game/simulation/run.ts';
            const { Run } = await import(/* @vite-ignore */ moduleUrl);
            const scene = (window as any).__app.scene;
            const run = new Run(id, 93);
            run.mode = 'paused';
            run.time = 50;
            run.timers.flexStart = run.time - 1;
            run.flexUntil = run.time + run.hero.duration - 1;
            run.movementFacing = -.3;
            run.moving = true;
            scene.run = run;
            return { hero: run.characterId, active: run.activeFlex };
        }, hero);
        expect(state).toEqual({ hero, active: true });
        await page.waitForTimeout(85);
        await canvas.screenshot({ path: `test-results/v3-flex-${hero}.png` });
    }

    await page.evaluate(() => {
        const run = (window as any).__app.scene.run;
        run.reduceMotion = true;
    });
    await page.waitForTimeout(85);
    await canvas.screenshot({ path: 'test-results/v3-reduced-effects-alpha.png' });
});
