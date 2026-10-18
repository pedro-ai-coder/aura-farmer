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
            path: `test-results/v1-before-${heroId}-directions.png`,
        });
    }
    await page.locator('#character-contact-sheet').evaluate(el => el.remove());
});
