import { test, expect } from '@playwright/test';
import enemyFrames from '../../src/browser/enemy-frames.json';

/** A review artifact made from actual already-approved runtime textures.
 * Not AI-generated art, a placeholder or proof of finishing every animation.
 */
test('Option A enemy/boss visual evidence includes every authored state and berserk variant', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
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

    const rows = Object.entries(enemyFrames).map(([kind, data]) => ({
        kind, sheet: data.sheet, count: data.frames.length,
    }));
    const evidence = await page.evaluate((all) => {
        const textures = (window as any).__app.scene.textures;
        const stateNames = ['IDLE', 'MOVE 1', 'MOVE 2', 'MOVE 3', 'WINDUP', 'IMPACT', 'HURT', 'DEATH'];
        const cellW = 146, cellH = 134, labelW = 150, headerH = 66;
        const sheet = document.createElement('canvas');
        sheet.id = 'v2-enemy-sheet';
        sheet.width = labelW + 8 * cellW;
        sheet.height = headerH + all.length * cellH;
        sheet.style.cssText = 'position:fixed;top:0;left:0;z-index:2000;background:#f7edcd';
        const ctx = sheet.getContext('2d')!;
        ctx.fillStyle = '#f7edcd';
        ctx.fillRect(0, 0, sheet.width, sheet.height);
        ctx.fillStyle = '#253449';
        ctx.font = 'bold 19px sans-serif';
        ctx.fillText('OPTION A — approved enemy/boss artwork (8 existing states)', 12, 28);
        ctx.font = 'bold 13px sans-serif';
        for (let i = 0; i < 8; i++) ctx.fillText(stateNames[i], labelW + i * cellW + 9, 56);
        let valid = 0;
        for (let rowIndex = 0; rowIndex < all.length; rowIndex++) {
            const row = all[rowIndex];
            if (row.count !== 8) throw new Error('Missing actor states for ' + row.kind);
            const y = headerH + rowIndex * cellH;
            ctx.fillStyle = rowIndex % 2 === 0 ? '#e7eee9' : '#f1e2c1';
            ctx.fillRect(0, y, sheet.width, cellH - 2);
            ctx.fillStyle = '#253449';
            ctx.font = 'bold 12px sans-serif';
            ctx.fillText(row.kind, 8, y + 30);
            for (let i = 0; i < 8; i++) {
                const key = `${row.kind}:${i}`;
                const texture = textures.get(row.sheet);
                const frame = texture.get(key);
                if (!frame) throw new Error('Missing runtime frame ' + key);
                const source = texture.getSourceImage() as HTMLCanvasElement;
                const scale = Math.min((cellW - 12) / frame.cutWidth,
                    (cellH - 18) / frame.cutHeight);
                const w = frame.cutWidth * scale, h = frame.cutHeight * scale;
                const x = labelW + i * cellW + (cellW - w) / 2;
                ctx.drawImage(source, frame.cutX, frame.cutY,
                    frame.cutWidth, frame.cutHeight,
                    x, y + cellH - h - 8, w, h);
                valid++;
            }
        }
        document.getElementById(sheet.id)?.remove();
        document.body.append(sheet);
        return { valid, families: all.length, bossNormal: all.some(x => x.kind === 'boss'),
            bossBerserk: all.some(x => x.kind === 'boss-berserk') };
    }, rows);
    expect(evidence).toMatchObject({ valid: 136, families: 17, bossNormal: true, bossBerserk: true });
    await page.locator('#v2-enemy-sheet').screenshot({
        path: 'test-results/v2-approved-enemy-boss-art-sheet.png',
    });
    await page.locator('#v2-enemy-sheet').evaluate(el => el.remove());

    const attacks = await page.evaluate(async () => {
        const runUrl: string = '/src/game/simulation/run.ts';
        const animationUrl: string = '/src/browser/enemy-animation.ts';
        const cueUrl: string = '/src/browser/enemy-telegraph.ts';
        const { Run } = await import(/* @vite-ignore */ runUrl);
        const { enemyPose } = await import(/* @vite-ignore */ animationUrl);
        const { enemyTelegraph } = await import(/* @vite-ignore */ cueUrl);
        const snapshots: { kind: string; pose: string; direction: number; active: boolean }[] = [];
        for (const kind of ['hater', 'ratio-ram', 'ping-sniper',
            'reply-guy', 'ohio-express', 'doomscroll-prime', 'boss'] as const) {
            const run = new Run('sigma', 29);
            const enemy = run.spawn(kind, { x: 650, y: 500 })!;
            enemy.born = 0;
            enemy.attackPose = { start: 10, impact: 11, end: 11.4, angle: Math.PI / 3 };
            enemy.angle = -Math.PI / 2;
            for (const [time, label] of [[10.5, 'windup'], [11, 'impact'], [11.3, 'recover']] as const) {
                const pose = enemyPose(enemy, time, 0, false, false);
                const marker = enemyTelegraph(pose, time);
                snapshots.push({ kind, pose: pose.state,
                    direction: marker?.angle ?? enemy.attackPose.angle, active: !!marker });
                if (pose.state !== label) throw new Error(kind + ' expected ' + label + ', got ' + pose.state);
            }
        }
        return snapshots;
    });
    expect(attacks).toHaveLength(21);
    expect(attacks.filter(s => s.pose === 'windup' && s.active)).toHaveLength(7);
    expect(attacks.filter(s => s.pose === 'impact' && s.active)).toHaveLength(7);
    expect(attacks.filter(s => s.pose === 'recover' && !s.active)).toHaveLength(7);
    for (const state of attacks) expect(state.direction).toBeCloseTo(Math.PI / 3);
});
