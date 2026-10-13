import { test, expect, type Page } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';
import { offerCatalogUpgrades } from './upgradeFixtures';

declare global { interface Window { __game: Phaser.Game } }

test.use({isMobile:true,hasTouch:true});
async function boot(page:Page,width:number,height:number):Promise<void> {
  await page.setViewportSize({width,height});
  await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch({maxRetries:2});
    await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(')});
  });
  await page.goto('/');
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#joystick-track')).toBeVisible();
}

async function injectLevelUp(page:Page):Promise<void> {
  await offerCatalogUpgrades(page,['sigma','alpha','speed']);
  await expect(page.locator('#upgrade-overlay')).toBeVisible();
}

for (const dim of [
  {name:'mobile landscape',width:844,height:390},
  {name:'mobile portrait',width:390,height:844},
]) {
  test(dim.name+' level up is one usable dialog with three cards and no side controls',async({page})=>{
    await boot(page,dim.width,dim.height);
    await injectLevelUp(page);
    await expect(page.locator('#menu-open')).toBeHidden();
    await expect(page.locator('#joystick-track')).toBeHidden();
    await expect(page.locator('[data-game-action="flex"]')).toBeHidden();
    await expect(page.locator('.upgrade-choice:visible')).toHaveCount(3);
    const rects=await Promise.all([0,1,2].map(i=>page.locator('[data-game-action="choice'+i+'"]').boundingBox()));
    const viewport=page.viewportSize()!;
    for(const rect of rects) {
      expect(rect).not.toBeNull();
      expect(rect!.x).toBeGreaterThanOrEqual(-1);
      expect(rect!.y).toBeGreaterThanOrEqual(-1);
      expect(rect!.x+rect!.width).toBeLessThanOrEqual(viewport.width+1);
      expect(rect!.y+rect!.height).toBeLessThanOrEqual(viewport.height+1);
    }
    if (dim.width>dim.height) expect(rects[0]!.y).toBeCloseTo(rects[2]!.y,-1);
    else expect(rects[0]!.y).toBeLessThan(rects[2]!.y);
    const canvasHasModal=await page.evaluate(()=>{
      const scene=window.__game.scene.scenes[0] as ArenaScene;
      return scene.children.list.some(o=>o.type==='Text' &&
        (o as Phaser.GameObjects.Text).text.includes('LEVEL UP · CHOOSE YOUR BUFF'));
    });
    expect(canvasHasModal).toBe(false);
    await page.screenshot({path:`test-results/upgrade-${dim.name.replace(' ','-')}.png`});
    await page.locator('[data-game-action="choice1"]').tap();
    await expect(page.locator('#upgrade-overlay')).toBeHidden();
    await expect(page.locator('[data-game-action="flex"]')).toBeVisible();
    await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.buffs.alpha)).toBe(1);
    expect(await page.evaluate(()=>{
      const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
      return {mode:a.mode,pending:a.pendingUpgrades,weapons:a.loadout.weapons,passives:a.loadout.passives};
    })).toEqual({mode:'playing',pending:0,weapons:['aura-shot'],passives:['alpha']});
  });
}
