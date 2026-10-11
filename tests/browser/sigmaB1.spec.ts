import { test,expect } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';
declare global {interface Window {__game: Phaser.Game}}

test('Sigma B1 loads 25 native 48px frames, menu portrait and in-game sprite',async({page})=>{
  await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(')});
  });
  await page.goto('/');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  const source=await page.evaluate(async()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const texture=scene.textures.get('spr-sigma-b1');
    const portrait=await fetch('/assets/pixel/sigma-portrait.png');
    const atlas=await fetch('/assets/pixel/sigma-b1.png');
    return {exists:scene.textures.exists('spr-sigma-b1'),
      frames:texture.frameTotal,width:texture.getSourceImage().width,
      height:texture.getSourceImage().height,
      portraitStatus:portrait.status,atlasStatus:atlas.status};
  });
  expect(source.exists).toBe(true);
  expect(source.frames).toBeGreaterThanOrEqual(25);
  expect(source.width).toBe(1200);
  expect(source.height).toBe(48);
  expect(source.portraitStatus).toBe(200);
  expect(source.atlasStatus).toBe(200);
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('[data-character="sigma"]')).toHaveAttribute('aria-pressed','true');
  const portrait=page.locator('.meta-avatar img[src$="sigma-portrait.png"]').first();
  await expect(portrait).toBeVisible();
  await expect.poll(() => portrait.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBe(48);
  await page.locator('[data-menu="start"]').click();
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.children.list.some(g=>g.type==='Image' &&
      (g as Phaser.GameObjects.Image).texture.key==='spr-sigma-b1');
  })).toBe(true);
  await page.setViewportSize({width:844,height:390});
  await page.screenshot({path:'test-results/sigma-b1-android-landscape.png'});
  await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    scene.arena.mode='dead';scene.arena.hp=0;
  });
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const hero=scene.children.list.find(g=>g.type==='Image' &&
      (g as Phaser.GameObjects.Image).texture.key==='spr-sigma-b1') as Phaser.GameObjects.Image;
    return Number(hero.frame.name);
  })).toBeGreaterThanOrEqual(20);
});
