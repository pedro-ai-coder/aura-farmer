import { expect, test } from '@playwright/test';

test('Option A sprite contact sheets: all existing frames and logical directions', async ({ page }) => {
    await page.setViewportSize({ width: 1480, height: 900 });
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
    await expect(page.locator('#hud')).toBeVisible();
    for (const heroId of ['sigma', 'cool-kid', 'alpha'] as const) {
        const result = await page.evaluate(async (id) => {
            // Dynamic dev-server modules run in the browser, not the Node
            // Playwright process; Vite resolves these absolute URLs.
            const runUrl: string = '/src/game/simulation/run.ts';
            const poseUrl: string = '/src/browser/hero-animation.ts';
            const { Run } = await import(/* @vite-ignore */ runUrl);
            const { heroPose } = await import(/* @vite-ignore */ poseUrl);
            const game = (window as any).__app;
            const run = new Run(id);
            const scene = game.scene;
            const cellWidth = 172, cellHeight = 174;
            const canvas = document.createElement('canvas');
            canvas.id = 'character-contact-sheet';
            canvas.width = 8 * cellWidth;
            canvas.height = 4 * cellHeight + 58;
            canvas.style.cssText = 'background:#fff6df;display:block;position:fixed;top:0;left:0;z-index:1000';
            const ctx = canvas.getContext('2d')!;
            ctx.fillStyle = '#fff6df'; ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#253449'; ctx.font = 'bold 20px sans-serif';
            ctx.fillText(id + ' — existing authored movement frames (4 poses × 8 logical directions)', 14, 29);
            const names = ['E','SE','S','SW','W','NW','N','NE'];
            const observations: string[] = [];
            for (let dir = 0; dir < 8; dir++) {
                for (let step = 0; step < 4; step++) {
                    run.moving = true;
                    run.movementFacing = dir * Math.PI / 4;
                    run.facing = (dir + 4) * Math.PI / 4;
                    const pose = heroPose(run, { walk: (step + .1) / 9, defeat: 0 });
                    const key = id + '-' + pose.sheet;
                    const texture = scene.textures.get(key);
                    const frame = texture.get(pose.frame);
                    if (!frame) throw Error('Missing frame: ' + id + '/' + dir + '/' + key + '/' + pose.frame);
                    const source = texture.getSourceImage() as HTMLImageElement;
                    const x = dir * cellWidth, y = step * cellHeight + 58;
                    ctx.fillStyle = (dir % 2 ? '#f4e9c9' : '#e7eee9');
                    ctx.fillRect(x, y, cellWidth - 2, cellHeight - 2);
                    ctx.fillStyle = '#253449'; ctx.font = 'bold 13px sans-serif';
                    ctx.fillText(names[dir] + ' ' + key.replace(id + '-', '') + ':' + pose.frame + (pose.flip ? ' FLIP' : ''), x + 8, y + 18);
                    const scale = pose.scale * 2;
                    const dw = frame.cutWidth * scale, dh = frame.cutHeight * scale;
                    ctx.save();
                    ctx.translate(x + cellWidth / 2, y + cellHeight - 12);
                    if (pose.flip) ctx.scale(-1, 1);
                    ctx.drawImage(source, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, -dw / 2, -dh, dw, dh);
                    ctx.restore();
                    observations.push(names[dir] + ':' + pose.sheet + ':' + pose.frame + ':' + pose.flip);
                }
            }
            document.getElementById('character-contact-sheet')?.remove();
            document.body.append(canvas);
            return observations;
        }, heroId);
        expect(result).toHaveLength(32);
        await page.locator('#character-contact-sheet').screenshot({
            path: `test-results/v1-approved-${heroId}-directions.png`,
        });
        await page.evaluate(async (id) => {
            const runUrl: string = '/src/game/simulation/run.ts';
            const poseUrl: string = '/src/browser/hero-animation.ts';
            const { Run } = await import(/* @vite-ignore */ runUrl);
            const { heroPose } = await import(/* @vite-ignore */ poseUrl);
            const game = (window as any).__app;
            const scenarios: { name: string; setup: (r: any) => void; defeat?: number }[] = [
                { name: 'idle EAST', setup: r => { r.facing = 0; } },
                { name: 'idle WEST', setup: r => { r.facing = Math.PI; } },
                { name: 'run NORTH', setup: r => { r.moving = true; r.movementFacing = -Math.PI / 2; } },
                ...[0, .08, .16].map((t, n) => ({
                    name: 'attack ' + (n + 1), setup: (r: any) => { r.time = t; r.timers.attackUntil = .22; },
                })),
                ...[0, .12].map((t, n) => ({
                    name: 'hurt ' + (n + 1), setup: (r: any) => { r.time = t; r.timers.hurtUntil = .18; },
                })),
                ...[0, .15, .3, .5].map((age, n) => ({
                    name: 'defeat ' + (n + 1), setup: (r: any) => { r.mode = 'lost'; }, defeat: age,
                })),
                { name: 'Flex enter', setup: r => { r.flexUntil = r.hero.duration; r.time = .1; } },
                { name: 'Flex active', setup: r => { r.flexUntil = r.hero.duration; r.time = 1; } },
                { name: 'Flex exit', setup: r => { r.flexUntil = r.hero.duration; r.time = r.hero.duration - .1; } },
            ];
            const cellW = 230, cellH = 218, columns = 5;
            const sheet = document.createElement('canvas');
            sheet.width = columns * cellW;
            sheet.height = Math.ceil(scenarios.length / columns) * cellH + 55;
            sheet.id = 'hero-state-contact-sheet';
            sheet.style.cssText = 'position:fixed;top:0;left:0;z-index:1100;background:#fff6df;display:block';
            const ctx = sheet.getContext('2d')!;
            ctx.fillStyle = '#fff6df'; ctx.fillRect(0, 0, sheet.width, sheet.height);
            ctx.fillStyle = '#253449'; ctx.font = 'bold 19px sans-serif';
            ctx.fillText(id + ' — authored runtime action states (not newly drawn frames)', 14, 30);
            scenarios.forEach((scenario, i) => {
                const r = new Run(id);
                scenario.setup(r);
                const p = heroPose(r, { walk: .2, defeat: scenario.defeat ?? 0 });
                const texture = game.scene.textures.get(id + '-' + p.sheet);
                const frame = texture.get(p.frame);
                if (!frame) throw new Error('Missing state frame: ' + id + '/' + scenario.name);
                const source = texture.getSourceImage() as HTMLImageElement;
                const x = (i % columns) * cellW;
                const y = Math.floor(i / columns) * cellH + 55;
                ctx.fillStyle = i % 2 ? '#f4e9c9' : '#e7eee9';
                ctx.fillRect(x, y, cellW - 2, cellH - 2);
                ctx.fillStyle = '#253449'; ctx.font = 'bold 14px sans-serif';
                ctx.fillText(scenario.name + ' — ' + p.sheet + ':' + p.frame, x + 8, y + 19);
                const dw = frame.cutWidth * p.scale * 2.3;
                const dh = frame.cutHeight * p.scale * 2.3;
                ctx.save();
                ctx.translate(x + cellW / 2, y + cellH - 9);
                if (p.flip) ctx.scale(-1, 1);
                ctx.drawImage(source, frame.cutX, frame.cutY, frame.cutWidth, frame.cutHeight, -dw / 2, -dh, dw, dh);
                ctx.restore();
            });
            document.getElementById('hero-state-contact-sheet')?.remove();
            document.body.append(sheet);
        }, heroId);
        await page.locator('#hero-state-contact-sheet').screenshot({
            path: `test-results/v1-approved-${heroId}-states.png`,
        });
        await page.locator('#hero-state-contact-sheet').evaluate(el => el.remove());
    }
    await page.locator('#character-contact-sheet').evaluate(el => el.remove());
});
