import { expect, test, type Page } from '@playwright/test';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';

declare global {interface Window{__game:Phaser.Game}}
async function load(page:Page,path='/'):Promise<void>{
  await page.route('**/src/main.ts',async route=>{
    const r=await route.fetch(); await route.fulfill({response:r,body:(await r.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(')});
  });
  await page.goto(path);
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
}

test('runtime-art is opt-in: legacy sprites remain the standard build',async({page})=>{
  await load(page);
  const key=await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.textures.exists('rt-sigma');
  });
  expect(key).toBe(false);
});
test('illustrated runtime pack loads and changes visual textures without altering gameplay',async({page})=>{
  await load(page,'/?runtimeArt=1');
  const has=await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return ['rt-sigma','rt-npc','rt-hater','rt-beta','rt-boss','rt-field','rt-xp'].every(key=>scene.textures.exists(key));
  });
  expect(has).toBe(true);
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.children.list.some(item=>item.type==='Image'&&(item as Phaser.GameObjects.Image).texture.key==='rt-sigma');
  })).toBe(true);
  await page.evaluate(()=>{
    const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
    a.enemies=[{id:999,type:'npc',x:600,y:380,hp:100,nextHit:Infinity,nextShot:Infinity},{id:998,type:'boss',x:800,y:360,hp:500,nextHit:Infinity,nextShot:Infinity}];
    a.drops=[{x:430,y:420,xp:1}];a.shots=[];
  });
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const keys=scene.children.list.filter(item=>item.type==='Image').map(item=>(item as Phaser.GameObjects.Image).texture.key);
    return keys.includes('rt-npc')&&keys.includes('rt-boss')&&keys.includes('rt-xp');
  })).toBe(true);
  await page.screenshot({path:'test-results/runtime-art-desktop.png'});
});
