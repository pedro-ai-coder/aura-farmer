import { expect, test, type Page } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';

declare global { interface Window { __game: Phaser.Game } }

async function begin(page:Page):Promise<void>{
  await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(')});
  });
  await page.goto('/');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#menu-open')).toBeVisible();
}

test('illustrated MENU remains an actual pause button',async({page})=>{
  await begin(page);
  const button=page.locator('#menu-open');
  await expect(button).toHaveCSS('background-image',/menu-button\.svg/);
  await button.click();
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
  await page.locator('[data-menu="resume"]').click();
  await expect(page.locator('#meta-shell')).toBeHidden();
});

test('wave celebration is one readable interactive HTML layer',async({page})=>{
  await begin(page);
  await page.evaluate(()=>{
    const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
    a.mode='between';a.wave=2;a.kills=47;a.xp.level=7;
  });
  const dialog=page.locator('#wave-overlay');
  await expect(dialog).toBeVisible();
  await expect(dialog).toContainText('WAVE 2 COMPLETE');
  await expect(dialog).toContainText('47 kills · Level 7');
  await expect(page.locator('#upgrade-overlay')).toBeHidden();
  await expect(page.locator('#wave-title')).toHaveCount(1);
  await page.locator('.wave-continue').click();
  await expect(dialog).toBeHidden();
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.mode)).toBe('playing');
});

test('upgrade cards display real icons, with rarity and legible text',async({page})=>{
  await begin(page);
  await page.evaluate(()=>{
    const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
    a.mode='upgrades';a.pendingUpgrades=1;
    a.choices=[
      {id:'drip',name:'Drip Check',description:'Reduce incoming damage by 1.',rarity:'COMMON',maxStacks:3},
      {id:'thick-skin',name:'Absolute Unit',description:'+20 max HP and restore 20 HP.',rarity:'COMMON',maxStacks:3},
      {id:'delulu',name:'Delulu Is the Solulu',description:'Ignore one fatal hit per wave.',rarity:'EPIC',maxStacks:1},
    ];
  });
  await expect(page.locator('#upgrade-overlay')).toBeVisible();
  await expect(page.locator('.upgrade-art svg')).toHaveCount(3);
  await expect(page.locator('[data-rarity="epic"]')).toContainText('Delulu Is the Solulu');
  await page.locator('[data-game-action="choice2"]').click();
  await expect(page.locator('#upgrade-overlay')).toBeHidden();
});

test('wave CTA stays in viewport on portrait phone',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await begin(page);
  await page.evaluate(()=>{(window.__game.scene.scenes[0] as ArenaScene).arena.mode='between';});
  await expect(page.locator('#wave-overlay')).toBeVisible();
  const rect=await page.locator('.wave-continue').boundingBox();
  expect(rect).not.toBeNull();
  const vp=page.viewportSize()!;
  expect(rect!.y).toBeGreaterThanOrEqual(0);
  expect(rect!.y+rect!.height).toBeLessThanOrEqual(vp.height+1);
});
