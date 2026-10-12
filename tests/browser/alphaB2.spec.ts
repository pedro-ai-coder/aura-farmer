import {test,expect} from '@playwright/test';
import type {ArenaScene} from '../../src/game/scenes/ArenaScene';
declare global {interface Window {__game:Phaser.Game}}

test('Alpha Chad B2: full native atlas, portrait and strike/death animation',async({page})=>{
  await page.route('**/src/main.ts',async route=>{
    const response=await route.fetch({maxRetries:2});
    await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(')});
  });
  await page.setViewportSize({width:844,height:390});
  await page.goto('/?visual=legacy');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  const assets=await page.evaluate(async()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const image=scene.textures.get('spr-alpha-b2').getSourceImage() as HTMLImageElement;
    const pic=await fetch('/assets/pixel/alpha-portrait.png');
    return {exists:scene.textures.exists('spr-alpha-b2'),w:image.width,h:image.height,portrait:pic.status};
  });
  expect(assets).toEqual({exists:true,w:48*31,h:48,portrait:200});
  await page.locator('[data-menu="play"]').click();
  const alpha=page.locator('[data-character="alpha"]');
  await alpha.click();
  await expect(alpha).toHaveAttribute('aria-pressed','true');
  const pic=page.locator('.meta-avatar img[src$="alpha-portrait.png"]').first();
  await expect(pic).toBeVisible();
  await expect.poll(()=>pic.evaluate(img=>(img as HTMLImageElement).naturalWidth)).toBe(48);
  await page.locator('[data-menu="start"]').click();
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.characterId)).toBe('alpha');
  const hero=()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const actor=scene.children.list.find(o=>o.type==='Image' &&
      (o as Phaser.GameObjects.Image).texture.key==='spr-alpha-b2') as Phaser.GameObjects.Image|undefined;
    return actor?{texture:actor.texture.key,frame:Number(actor.frame.name)}:null;
  });
  await expect.poll(async()=>(await hero())?.texture).toBe('spr-alpha-b2');
  await page.evaluate(()=>{
    const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
    a.enemies=[];a.shots=[];a.drops=[];
    a.jawUntil=a.clock+3000; // hold the attack pose long enough for deterministic Chromium capture
  });
  await expect.poll(async()=>{
    const h=await hero();return h!==null&&h.frame>=10&&h.frame<=15;
  }).toBe(true);
  await page.screenshot({path:'test-results/alpha-b2-mobile-landscape.png'});
  await page.evaluate(()=>{
    const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
    a.hp=0;a.mode='dead';
  });
  await expect.poll(async()=>(await hero())?.frame).toBeGreaterThanOrEqual(25);
  await expect.poll(async()=>(await hero())?.frame).toBe(30);
});
