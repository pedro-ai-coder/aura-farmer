import { test, expect, type Page } from '@playwright/test';
import type { Arena } from '../../src/game/core/arena';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';
import type { BuffId } from '../../src/game/data/buffs';

declare global { interface Window { __game: Phaser.Game } }

const newBuffs: [BuffId, string][] = [
  ['gym-routine', 'Gym Routine'], ['speed-shoes', 'Speed Shoes'], ['thick-skin', 'Thick Skin'],
  ['quick-hands', 'Quick Hands'], ['long-reach', 'Long Reach'], ['magnet-mode', 'Magnet Mode'],
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
    test('six Combat V2 normal passives display and can be selected through legal upgrades', async ({ page }) => {
      test.setTimeout(90000);
      if (layout.mobile) {
        await page.locator('[data-menu="play"]').click();
        await page.locator('[data-menu="start"]').click();
      }
      else await page.keyboard.press('Enter');
      await expect.poll(() => state(page, a => a.mode)).toBe('playing');
      for (const [id, name] of newBuffs) {
        // Each item is tested in an empty LEGAL build; exhausting every item
        // at once no longer works because the game enforces 3+5 slots.
        await page.evaluate(async buffId=>{
          const path='/src/game/data/buffs.ts';
          const {BUFFS,emptyBuffLevels}=await import(path) as typeof import('../../src/game/data/buffs');
          const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
          a.buffs=emptyBuffLevels();a.buffs['aura-shot']=1;
          a.enemies=[];a.shots=[];a.drops=[];a.hp=100;
          a.mode='upgrades';a.pendingUpgrades=1;
          a.choices=[BUFFS.find(b=>b.id===buffId)!];
        },id);
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
