import { test, expect, type Page } from '@playwright/test';
import type { Arena } from '../../src/game/core/arena';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';
import type { BuffId } from '../../src/game/data/buffs';

declare global { interface Window { __game: Phaser.Game } }

const newBuffs: [BuffId, string][] = [
  ['crash-out', 'Crash Out'], ['skibidi-bounce', 'Skibidi Bounce'], ['delulu', 'Delulu Is the Solulu'],
  ['touch-grass', 'Touch Grass'], ['mogged', 'Mogged'], ['rizz-aura', 'Rizz Aura'],
];
async function state<T>(page: Page, fn: (a: Arena) => T): Promise<T> {
  return page.evaluate(`(${fn.toString()})(window.__game.scene.scenes[0].arena)`);
}
async function canvasText(page: Page): Promise<string> {
  return page.evaluate(() => window.__game.scene.scenes[0].children.list
    .filter(o => o.type === 'Text').map(o => (o as Phaser.GameObjects.Text).text).join('\n'));
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  (page as Page & { errors: string[] }).errors = errors;
  await page.route('**/src/main.ts', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(') });
  });
  await page.goto('/');
  await expect.poll(() => state(page, a => a.mode)).toBe('intro');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test.afterEach(async ({ page }) => {
  expect((page as Page & { errors: string[] }).errors).toEqual([]);
});

for (const layout of [
  { name: 'desktop', width: 1100, height: 820, mobile: false },
  { name: 'portrait Android emulation', width: 390, height: 844, mobile: true },
  { name: 'landscape Android emulation', width: 844, height: 390, mobile: true },
]) {
  test.describe(layout.name, () => {
    test.use({ viewport: { width: layout.width, height: layout.height }, isMobile: layout.mobile, hasTouch: layout.mobile });
    test('all six buffs appear in English level-ups and can be selected with the existing controls', async ({ page }) => {
      test.setTimeout(90000);
      if (layout.mobile) {
        await page.locator('[data-menu="play"]').click();
        await page.locator('[data-menu="start"]').click();
      }
      else await page.keyboard.press('Enter');
      await expect.poll(() => state(page, a => a.mode)).toBe('playing');
      for (const [id, name] of newBuffs) {
        // Cap alternatives to force the real XP/offerUpgrade path to offer this buff.
        await page.evaluate(async buffId => {
          const path = '/src/game/data/buffs.ts';
          const { BUFFS } = await import(path) as typeof import('../../src/game/data/buffs');
          const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
          for (const b of BUFFS) a.buffs[b.id] = b.maxStacks;
          a.buffs[buffId] = 0; a.enemies = []; a.shots = []; a.hp = 160;
          a.drops = [{ ...a.pos, xp: 20 + (a.xp.level - 1) * 13 - a.xp.xp }];
        }, id);
        await expect.poll(() => state(page, a => a.mode)).toBe('upgrades');
        await expect(page.locator('#upgrade-overlay')).toBeVisible();
        await expect(page.locator('#upgrade-overlay')).toContainText(name);
        await expect(page.locator('#menu-open')).toBeHidden();
        // No duplicate Phaser Level Up modal exists behind the interactive cards.
        expect(await canvasText(page)).not.toContain('LEVEL UP · CHOOSE YOUR BUFF');
        const clock = await state(page, a => a.clock);
        await page.waitForTimeout(80);
        expect(await state(page, a => a.clock)).toBe(clock);
        if (layout.mobile) {
          const choice = page.locator('[data-game-action="choice0"]');
          await expect(choice).toContainText(name);
          const box = (await choice.boundingBox())!;
          expect(box.x).toBeGreaterThanOrEqual(0); expect(box.x + box.width).toBeLessThanOrEqual(layout.width + 1);
          expect(box.y + box.height).toBeLessThanOrEqual(layout.height + 1);
          await choice.tap();
        } else await page.keyboard.press('1');
        await expect.poll(() => page.evaluate(key => (window.__game.scene.scenes[0] as ArenaScene).arena.buffs[key], id)).toBe(1);
        await expect.poll(() => state(page, a => a.mode)).toBe('playing');
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1)).toBe(true);
      await page.evaluate(()=>{
        const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
        a.aura.change(100,a.clock);
      });
      await expect.poll(()=>state(page,a=>a.flex.state)).toBe('ready');
      if(layout.mobile)await page.locator('[data-game-action="flex"]').tap();
      else await page.keyboard.press('e');
      await expect.poll(()=>state(page,a=>a.flex.state)).toBe('active');
    });
  });
}

test('Ultimate 67 renders once and its radial projectiles ricochet without chaining', async ({ page }) => {
  await page.keyboard.press('Enter');
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.buffs['six-seven'] = 1; a.buffs['skibidi-bounce'] = 1; a.kills = 66;
    a.enemies = [
      { id: 100, x: 200, y: 200, type: 'npc', hp: 1, nextHit: Infinity, nextShot: Infinity },
      { id: 101, x: 575, y: 330, type: 'beta', hp: 72, nextHit: Infinity, nextShot: Infinity },
      { id: 102, x: 665, y: 330, type: 'beta', hp: 72, nextHit: Infinity, nextShot: Infinity },
    ];
    a.shots = [{ x: 200, y: 200, vx: 0, vy: 0, damage: 1, ttl: 1000, hostile: false }];
    a.update(1);
    // Existing volley resolves independently of whether FLEX is charged.
  });
  await expect.poll(() => canvasText(page)).toContain('ULTIMATE 67');
  await expect.poll(() => state(page, a => a.enemies.find(e => e.id === 102)?.hp ?? 72)).toBeLessThan(72);
  expect(await state(page, a => a.effects.ultimate67Announced)).toBe(true);
  await page.screenshot({ path: 'test-results/ultimate-67.png' });
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.kills = 133; a.flex.state = 'ready';
    a.enemies = [{ id: 200, x: 200, y: 200, type: 'npc', hp: 1, nextHit: Infinity, nextShot: Infinity }];
    a.shots = [{ x: 200, y: 200, vx: 0, vy: 0, damage: 1, ttl: 1000, hostile: false }];
  });
  await expect.poll(() => canvasText(page)).toContain('SIX SEVEN!');
  expect(await state(page, a => a.feedback)).not.toBe('ULTIMATE 67');
});

test('Delulu protects against lethal collisions and resets on NEXT WAVE but not upgrades', async ({ page }) => {
  await page.keyboard.press('Enter');
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.buffs.delulu = 1; a.hp = 1;
    a.enemies = [{ ...a.pos, id: 100, type: 'npc', hp: 1000, nextHit: 0, nextShot: Infinity }];
    a.update(1); a.enemies = []; a.shots = [];
    a.drops = [{ ...a.pos, xp: 20 }];
  });
  await expect.poll(() => state(page, a => a.mode)).toBe('upgrades');
  expect(await state(page, a => a.effects.deluluUsed)).toBe(true);
  expect(await state(page, a => a.hp)).toBe(1);
  await page.keyboard.press('1');
  await expect.poll(() => state(page, a => a.mode)).toBe('playing');
  expect(await state(page, a => a.effects.deluluUsed)).toBe(true);
  await page.evaluate(() => { (window.__game.scene.scenes[0] as ArenaScene).arena.waveClock = 50000; });
  await expect.poll(() => state(page, a => a.mode)).toBe('between');
  await page.keyboard.press('Enter');
  await expect.poll(() => state(page, a => a.wave)).toBe(2);
  expect(await state(page, a => a.effects.deluluUsed)).toBe(false);
});
