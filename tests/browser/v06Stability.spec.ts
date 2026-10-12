import { expect, test, type Page } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';

declare global { interface Window { __game: Phaser.Game } }
async function boot(page:Page, url='/'):Promise<void> {
  await page.route('**/src/main.ts',async route=>{
    const result=await route.fetch();
    await route.fulfill({response:result,body:(await result.text()).replace('new Phaser.Game(','window.__game = new Phaser.Game(')});
  });
  await page.goto(url);
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
}
async function play(page:Page):Promise<void> {
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#meta-shell')).toBeHidden();
}
test('v0.6 suspends an active run on tab hide and requires explicit resume',async({page})=>{
  await boot(page);
  await play(page);
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
  const frozen=await page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.clock);
  await page.waitForTimeout(190);
  expect(await page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.clock)).toBe(frozen);
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,value:false});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
  await page.locator('[data-menu="resume"]').click();
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.clock)).toBeGreaterThan(frozen);
});

test('v0.6 does not leak an E key buffered during a pause into FLEX on resume',async({page})=>{
  await boot(page);
  await play(page);
  await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const key=scene.input.keyboard!.addKey('E');
    key.emit('down');
    scene.setPaused(true);
    scene.setPaused(false);
  });
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.flex.state)).toBe('ready');
});

test('v0.6 direct browser fullscreen keeps UI synchronized, including native exit',async({page})=>{
  await page.setViewportSize({width:1100,height:820});
  await boot(page);
  await play(page);
  await page.evaluate(async()=>{await document.querySelector<HTMLElement>('.play-layout')!.requestFullscreen();});
  await expect(page.locator('.play-layout')).toHaveClass(/is-immersive/);
  await expect(page.locator('#fullscreen-toggle')).toHaveAttribute('aria-pressed','true');
  await page.evaluate(async()=>{await document.exitFullscreen();});
  await expect(page.locator('.play-layout')).not.toHaveClass(/is-immersive/);
  await expect(page.locator('#fullscreen-toggle')).toHaveAttribute('aria-pressed','false');
  await page.locator('#menu-open').click();
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
});

test('v0.6 avoids re-binding unchanged hero texture on every render tick',async({page})=>{
  await boot(page);
  await play(page);
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.children.list.some(o=>o.type==='Image' && (o as Phaser.GameObjects.Image).texture.key.startsWith('ga-sigma-'));
  })).toBe(true);
  const counts=await page.evaluate(async()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const hero=scene.children.list.find(o=>o.type==='Image' && (o as Phaser.GameObjects.Image).texture.key.startsWith('ga-sigma-')) as Phaser.GameObjects.Image;
    let calls=0;
    const original=hero.setTexture.bind(hero);
    hero.setTexture=((key:string, frame?:string|number)=>{calls++;return original(key,frame);}) as typeof hero.setTexture;
    await new Promise(resolve=>setTimeout(resolve,140));
    return calls;
  });
  // Sigma's idle animation changes frames once every ~175 ms, not 60
  // redundant GPU texture bindings per second.
  expect(counts).toBeLessThanOrEqual(3);
});

test('v0.6 keeps smartphone pause/resume and upgrade controls accessible',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await boot(page);
  await play(page);
  await expect(page.locator('#joystick-track')).toBeVisible();
  await page.evaluate(()=>{
    Object.defineProperty(document,'hidden',{configurable:true,value:true});
    document.dispatchEvent(new Event('visibilitychange'));
  });
  await expect(page.locator('#joystick-track')).toBeHidden();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});});
  await page.locator('[data-menu="resume"]').click();
  await expect(page.locator('#joystick-track')).toBeVisible();
});
