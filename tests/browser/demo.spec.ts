import { test, expect, type Page } from '@playwright/test';
import type { BrowserApp } from '../../src/browser/app';
declare global {
    interface Window {
        __app: BrowserApp;
    }
}
async function open(page: Page) {
    await page.route('**/src/main.ts', async route => {
        // Retry only transport resets while loading the test hook, not failed assertions or HTTP errors.
        const response = await route.fetch({ maxRetries: 2 });
        await route.fulfill({ response, body: (await response.text()).replace('new BrowserApp();', 'window.__app = new BrowserApp();') });
    });
    await page.goto('/');
    await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeEnabled();
}
async function start(page: Page) { await open(page); await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click(); await expect(page.locator('#modal')).toBeHidden(); }
for (const viewport of [{ width: 1280, height: 720 }, { width: 1920, height: 1080 }, { width: 800, height: 600 }])
    test(`home and run fit ${viewport.width}x${viewport.height}`, async ({ page }) => { await page.setViewportSize(viewport); const errors: string[] = []; page.on('pageerror', e => errors.push(e.message)); await open(page); await expect(page.locator('.hero-card')).toHaveCount(3); await expect(page.locator('.hero-card img').first()).toBeVisible(); await expect(page.getByRole('button', { name: 'ENTER RUIN ALLEY' })).toBeInViewport(); await page.screenshot({ path: `test-results/home-${viewport.width}.png` }); await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click(); await expect(page.locator('.meter.hp')).toContainText('The Sigma'); await page.waitForTimeout(1200); await page.keyboard.press('Escape'); await expect(page.locator('.pause')).toBeVisible(); expect(errors).toEqual([]); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true); });
test('all three heroes start with their own starter and Flex', async ({ page }) => { await open(page); for (const id of ['sigma', 'cool-kid', 'alpha']) {
    await page.locator(`[data-action=hero][data-value="${id}"]`).click();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    expect(await page.evaluate(() => window.__app.run!.inventory.weapons.length)).toBe(1);
    expect(await page.evaluate(() => window.__app.run!.characterId)).toBe(id);
    await page.screenshot({ path: `test-results/hero-${id}.png` });
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'LEAVE RUN', exact: true }).click();
    await page.getByRole('button', { name: 'LEAVE RUN', exact: true }).click();
    await expect(page.locator('.home')).toBeVisible();
} });
test('move, pause, queued upgrades and resume without overlapping dialogs', async ({ page }) => { await start(page); const initial = await page.evaluate(() => window.__app.run!.pos.x); await page.keyboard.down('d'); await page.waitForTimeout(350); await page.keyboard.up('d'); expect(await page.evaluate(() => window.__app.run!.pos.x)).toBeGreaterThan(initial); await page.keyboard.press('Escape'); const paused = await page.evaluate(() => window.__app.run!.time); await page.waitForTimeout(300); expect(await page.evaluate(() => window.__app.run!.time)).toBe(paused); await page.getByRole('button', { name: 'BACK TO THE FARM' }).click(); await page.evaluate(() => { window.__app.run!.gainXp(100); }); await expect(page.locator('.choices .choice')).toHaveCount(3); await expect(page.locator('#modal>.panel')).toHaveCount(1); await page.locator('.choice').first().click(); await page.getByRole('button', { name: 'CONFIRM CHOICE' }).click(); await page.locator('.choice').first().click(); await page.getByRole('button', { name: 'CONFIRM CHOICE' }).click(); await expect(page.locator('#modal')).toBeHidden(); });
test('six legendary choices retain offer and enforce one legendary', async ({ page }) => { await start(page); await page.evaluate(() => { const r = window.__app.run!; r.wave = 4; r.time = 540; r.openLegendary(); }); await expect(page.locator('.choice')).toHaveCount(6); const names = await page.locator('.choice h3').allTextContents(); await page.getByRole('button', { name: 'DECIDE LATER' }).click(); await page.getByRole('button', { name: 'CHOOSE LEGENDARY' }).click(); expect(await page.locator('.choice h3').allTextContents()).toEqual(names); await page.locator('.choice').nth(3).click(); await page.getByRole('button', { name: 'CONFIRM CHOICE' }).click(); await expect(page.locator('#modal')).toBeHidden(); expect(await page.evaluate(() => window.__app.run!.inventory.legendarySpent)).toBe(true); await expect(page.getByRole('button', { name: 'CHOOSE LEGENDARY' })).toHaveCount(0); });
test('boss enters berserk, remains killable and saves victory once', async ({ page }) => { await start(page); await page.evaluate(() => { const r = window.__app.run!; r.time = 899.99; r.wave = 5; r.nextSpawn = Infinity; }); await expect(page.locator('.boss-meter')).toContainText('BIG HATER'); await page.evaluate(() => { window.__app.run!.time = 1080; }); await expect(page.locator('.boss-meter')).toContainText('FULL HATER MODE'); await page.waitForTimeout(1000); await page.evaluate(() => { const r = window.__app.run!; r.hitEnemy(r.boss!, 1e9); }); await expect(page.locator('.results')).toContainText('Absolute cinema.'); expect(await page.evaluate(() => window.__app.save.wins)).toBe(1); await page.reload(); await expect(page.locator('.local-progress')).toContainText('1 runs · 1 wins'); });
test('loss and restart reset equipment and aura', async ({ page }) => { await start(page); await page.evaluate(() => window.__app.run!.hurt(1000, undefined)); await expect(page.locator('.results')).toContainText('Run it back.'); await page.getByRole('button', { name: 'ONE MORE RUN' }).click(); expect(await page.evaluate(() => window.__app.run!.inventory.weapons.length)).toBe(1); expect(await page.evaluate(() => window.__app.run!.aura)).toBeLessThan(2); });
test('legacy profile survives reload', async ({ page }) => { await page.addInitScript(() => { if (!localStorage.getItem('aura-farmer:profile:v1'))
    localStorage.setItem('aura-farmer:profile:v1', JSON.stringify({ schemaVersion: 1, unlockedCharacters: ['fanum', 'six-seven'], lifetime: { runs: 12, wins: 3, xpCollected: 765 }, settings: { reduceMotion: true } })); }); await open(page); await expect(page.locator('.local-progress')).toContainText('12 runs · 3 wins · 765 lifetime XP'); await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click(); expect(await page.evaluate(() => window.__app.save.unlocked)).toContain('fanum'); await page.reload(); await expect(page.locator('.local-progress')).toContainText('12 runs'); expect(await page.evaluate(() => JSON.parse(localStorage.getItem('aura-farmer:profile:v1')!).unlockedCharacters)).toContain('six-seven'); });

test('HUD stays inside the map after wide-window resize', async ({ page }) => {
    await start(page);
    for (const viewport of [{ width: 2560, height: 1080 }, { width: 1280, height: 720 }, { width: 800, height: 600 }]) {
        await page.setViewportSize(viewport);
        await expect.poll(async () => page.evaluate(() => {
            const canvas = document.querySelector('canvas')!.getBoundingClientRect();
            return Array.from(document.querySelectorAll('#hud button, .hud-top')).every(el => {
                const b = el.getBoundingClientRect();
                return b.left >= canvas.left - 1 && b.right <= canvas.right + 1 && b.top >= canvas.top - 1 && b.bottom <= canvas.bottom + 1;
            });
        })).toBe(true);
        await page.screenshot({ path: `test-results/hud-${viewport.width}.png` });
    }
});

test('wave legendary takes priority over XP choices and preserves the 12-minute reminder', async ({ page }) => {
    await start(page);
    await page.evaluate(() => { const r = window.__app.run!; r.time = 539.99; r.wave = 3; r.nextSpawn = Infinity; });
    await expect(page.locator('.legendary-offer')).toBeVisible();
    const cards = await page.locator('.choice h3').allTextContents();
    const paused = await page.evaluate(() => window.__app.run!.time);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__app.run!.time)).toBe(paused);
    await page.getByRole('button', { name: 'DECIDE LATER' }).click();
    await expect(page.locator('.choices .choice')).toHaveCount(3);
    while (await page.evaluate(() => window.__app.run!.mode === 'upgrade')) {
        await page.locator('.choice').first().click();
        await page.getByRole('button', { name: 'CONFIRM CHOICE' }).click();
    }
    await page.evaluate(() => { window.__app.run!.time = 719.99; });
    await expect(page.locator('.legendary-offer')).toBeVisible();
    expect(await page.locator('.choice h3').allTextContents()).toEqual(cards);
    await expect(page.locator('#modal > .panel')).toHaveCount(1);
});

test('deferred legendary expires without automatic equipment', async ({ page }) => {
    await start(page);
    await page.evaluate(() => { const r = window.__app.run!; r.time = 894; r.wave = 5; r.openLegendary(); });
    await page.getByRole('button', { name: 'DECIDE LATER' }).click();
    await page.evaluate(() => { window.__app.run!.time = 895; });
    await expect(page.getByRole('button', { name: 'CHOOSE LEGENDARY' })).toHaveCount(0);
    expect(await page.evaluate(() => window.__app.run!.inventory.legendarySpent)).toBe(false);
});

test('boss entry collects ground XP and keeps its clock paused for the resulting choices', async ({ page }) => {
    await start(page);
    await page.evaluate(() => {
        const r = window.__app.run!; r.time = 899.99; r.wave = 5; r.nextSpawn = Infinity;
        r.drops.push({ x: 400, y: 400, id: 50000, xp: 120 });
    });
    await expect(page.locator('.boss-meter')).toContainText('BIG HATER');
    await expect(page.locator('.choices .choice')).toHaveCount(3);
    const state = await page.evaluate(() => ({ time: window.__app.run!.time, xp: window.__app.run!.xpCollected }));
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__app.run!.time)).toBe(state.time);
    expect(state.xp).toBe(120);
    await expect(page.locator('#modal > .panel')).toHaveCount(1);
});

test('Escape cancels leave confirmation without running combat behind the modal', async ({ page }) => {
    await start(page);
    await page.keyboard.press('Escape');
    await page.getByRole('button', { name: 'LEAVE RUN', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Your build stays here.' })).toBeVisible();
    const time = await page.evaluate(() => window.__app.run!.time);
    await page.keyboard.press('Escape');
    await expect(page.locator('.pause')).toBeVisible();
    await page.keyboard.down('w');
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__app.run!.time)).toBe(time);
    const pos = await page.evaluate(() => ({ ...window.__app.run!.pos }));
    await page.getByRole('button', { name: 'BACK TO THE FARM' }).click();
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => window.__app.run!.pos)).toEqual(pos);
    await page.keyboard.up('w');
    expect(await page.evaluate(() => window.__app.save.runs)).toBe(0);
});

for (const hero of ['sigma', 'cool-kid', 'alpha'])
    test(`${hero} result persists once and restart clears the whole run build`, async ({ page }) => {
        await open(page);
        await page.locator(`[data-action=hero][data-value="${hero}"]`).click();
        await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
        await page.evaluate(() => {
            const r = window.__app.run!;
            r.level = 10; r.aura = 99; r.xpCollected = 915;
            r.inventory.weapons[0].rarity = 'legendary'; r.inventory.legendarySpent = true;
            r.inventory.passives = [{ id: 'built-different', rarity: 'common', level: 4 }];
            r.hurt(1e6, undefined);
        });
        await expect(page.locator('.results')).toBeVisible();
        await page.waitForTimeout(150);
        expect(await page.evaluate(() => window.__app.save.runs)).toBe(1);
        await page.getByRole('button', { name: 'ONE MORE RUN' }).click();
        const fresh = await page.evaluate(() => {
            const r = window.__app.run!;
            return { hero: r.characterId, level: r.level, aura: r.aura, weapons: r.inventory.weapons, passives: r.inventory.passives, spent: r.inventory.legendarySpent, pending: r.pending };
        });
        expect(fresh.hero).toBe(hero); expect(fresh.level).toBe(1); expect(fresh.aura).toBeLessThan(2);
        expect(fresh.weapons).toHaveLength(1); expect(fresh.weapons[0].rarity).toBe('common');
        expect(fresh.passives).toHaveLength(0); expect(fresh.spent).toBe(false); expect(fresh.pending).toBe(0);
        await page.reload();
        await expect(page.locator('.local-progress')).toContainText('1 runs · 0 wins · 915 lifetime XP');
        await expect(page.locator(`[data-value="${hero}"]`)).toHaveAttribute('aria-pressed', 'true');
    });

test('settings survive reload and apply to the next run', async ({ page }) => {
    await open(page);
    await page.getByRole('button', { name: 'Sound ON', exact: true }).click();
    await page.getByRole('button', { name: 'Effects FULL', exact: true }).click();
    await page.reload();
    await expect(page.getByRole('button', { name: 'Sound OFF', exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Effects LOW', exact: true })).toBeVisible();
    await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
    expect(await page.evaluate(() => window.__app.run!.reduceMotion)).toBe(true);
    expect(await page.evaluate(() => window.__app.audio.enabled)).toBe(false);
});

test('storage write failure reports temporary progress and still allows restart', async ({ page }) => {
    await page.addInitScript(() => { Storage.prototype.setItem = () => { throw new DOMException('Storage unavailable', 'QuotaExceededError'); }; });
    await start(page);
    await page.evaluate(() => window.__app.run!.hurt(1e6, undefined));
    await expect(page.locator('.save-note')).toContainText('Saving unavailable');
    await page.getByRole('button', { name: 'ONE MORE RUN' }).click();
    await expect(page.locator('#modal')).toBeHidden();
    expect(await page.evaluate(() => window.__app.run!.level)).toBe(1);
});

for (const hero of ['sigma', 'cool-kid', 'alpha'] as const)
    test(`${hero} directional animation, Flex and defeat render from real atlas frames`, async ({ page }) => {
        const errors: string[] = [];
        page.on('pageerror', e => errors.push(e.message));
        await open(page);
        await page.locator(`[data-action=hero][data-value="${hero}"]`).click();
        await page.getByRole('button', { name: 'ENTER RUIN ALLEY' }).click();
        await page.keyboard.down('w');
        await page.waitForTimeout(350);
        await page.screenshot({ path: `test-results/north-run-${hero}.png` });
        await page.keyboard.up('w');
        const result = await page.evaluate(() => {
            const app = window.__app, r = app.run!, scene = app.scene;
            scene.tick = () => {}; // Presentation fixture: no combat or random damage during captures.
            const image = scene.children.getByName('hero') as import('phaser').GameObjects.Image;
            const canvas = document.createElement('canvas');
            canvas.id = 'animation-proof'; canvas.width = 960; canvas.height = 1100;
            canvas.style.cssText = 'position:fixed;inset:0;z-index:99999;width:960px;height:1100px';
            document.body.append(canvas);
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#eee5ce'; ctx.fillRect(0, 0, 960, 1100);
            ctx.fillStyle = '#253449'; ctx.font = 'bold 20px Arial';
            ctx.fillText(`${r.hero.name} — runtime poses / 1.5× game scale`, 20, 28);
            const labels = ['E', 'SE', 'S', 'SW', 'W', 'NW', 'N', 'NE'];
            const seen: string[] = [];
            const capture = (col: number, row: number, label: string) => {
                scene.update(0, 100);
                const frame = image.frame, p = image.getData('pose');
                seen.push(`${p.sheet}:${p.frame}`);
                const x = 25 + col * 116, y = 60 + row * 165;
                ctx.fillStyle = '#253449'; ctx.font = '12px Arial'; ctx.fillText(label, x, y);
                ctx.save(); ctx.translate(x + 46, y + 140);
                ctx.scale(image.scaleX * 1.5 * (image.flipX ? -1 : 1), image.scaleY * 1.5);
                ctx.drawImage(frame.source.image as HTMLImageElement, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight,
                    -frame.width / 2, -frame.height, frame.width, frame.height);
                ctx.restore();
            };
            r.time = 10; r.moving = true; r.facing = 0;
            for (let dir = 0; dir < 8; dir++) {
                r.movementFacing = dir * Math.PI / 4;
                for (let step = 0; step < 4; step++) {
                    r.pos.x += r.hero.speed / 9 + .01;
                    capture(dir, step, `${labels[dir]} · ${step + 1}`);
                }
            }
            r.moving = true; r.flexUntil = 20 + r.hero.duration;
            for (let step = 0; step < 8; step++) {
                r.time = step === 7 ? r.flexUntil - .05 : 20 + [0, .15, .3, .45, 1.8, 1.95, 2][step];
                r.pos.x += r.hero.speed / 11.25 + .01;
                capture(step, 4, `Flex ${Math.round((r.time - 20) * 100) / 100}s`);
            }
            r.flexUntil = 0; r.mode = 'lost';
            for (let step = 0; step < 8; step++) capture(step, 5, `Defeat ${step}`);
            return { final: image.getData('pose'), frames: seen };
        });
        if (hero === 'cool-kid') expect(result.frames.some(f => f.startsWith('flex-v2:'))).toBe(true);
        expect(result.final.frame).toBe(hero === 'cool-kid' ? 32 : 40);
        if (hero !== 'sigma') expect(result.frames.some(f => f.startsWith('rear-v2:'))).toBe(true);
        await page.locator('#animation-proof').screenshot({ path: `test-results/animation-${hero}.png` });
        expect(errors).toEqual([]);
    });
