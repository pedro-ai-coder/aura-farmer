import {expect,test,type Page} from '@playwright/test';
import type {ArenaScene} from '../../src/game/scenes/ArenaScene';
declare global { interface Window { __game:Phaser.Game } }
async function setup(page:Page,url:string):Promise<void>{
  await page.route('**/src/main.ts',async route=>{
    const result=await route.fetch();
    await route.fulfill({response:result,body:(await result.text()).replace('new Phaser.Game(','window.__game = new Phaser.Game(')});
  });
  await page.goto(url);
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
}
test('Gate B explicitly opts in, while default and Gate A stay stable',async({page})=>{
  await setup(page,'/');
  let keys=await page.evaluate(()=>{
    const sc=window.__game.scene.scenes[0] as ArenaScene;
    return sc.textures.getTextureKeys().filter(key=>key.startsWith('gb-'));
  });
  expect(keys).toEqual([]);
  await page.goto('/?gateA=1');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  keys=await page.evaluate(()=>{
    const sc=window.__game.scene.scenes[0] as ArenaScene;
    return sc.textures.getTextureKeys().filter(key=>key.startsWith('gb-'));
  });
  expect(keys).toEqual([]);
});
for(const id of ['alpha','rizzler'] as const){
  test('Gate B '+id+' portrait, animation and fullscreen',async({page})=>{
    await page.setViewportSize({width:1160,height:840});
    await setup(page,'/?gateB=1');
    await expect(page.locator('.masthead')).toContainText('GATE B');
    await expect(page.locator('.af-home-event')).toContainText('HERO IDENTITY');
    const frames=await page.evaluate(id=>{
      const scene=window.__game.scene.scenes[0] as ArenaScene;
      return [
        'ga-floor','gb-'+id+'-idle-0','gb-'+id+'-move-5',
        'gb-'+id+'-'+(id==='alpha'?'punch':'cast')+'-5','gb-'+id+'-death-5'
      ].every(key=>scene.textures.exists(key));
    },id);
    expect(frames).toBe(true);
    await page.locator('[data-menu="play"]').click();
    await page.locator('[data-character="'+id+'"]').click();
    await expect(page.locator('.meta-character[data-character="'+id+'"] .meta-avatar img')).toHaveAttribute('src',/^data:image\/png/);
    await page.locator('[data-menu="home"]').click();
    await expect(page.locator('.meta-feature')).toContainText(id==='alpha'?'Alpha Chad':'The Rizzler');
    await expect(page.locator('.af-home-art img')).toHaveAttribute('src',/^data:image\/png/);
    await page.locator('[data-menu="play"]').click();
    await page.locator('[data-menu="start"]').click();
    await expect.poll(()=>page.evaluate(id=>{
      const scene=window.__game.scene.scenes[0] as ArenaScene;
      return scene.children.list.some(item=>item.type==='Image' && (item as Phaser.GameObjects.Image).texture.key.startsWith('gb-'+id+'-'));
    },id)).toBe(true);
    await page.evaluate(async()=>{await document.querySelector<HTMLElement>('.play-layout')!.requestFullscreen();});
    await expect.poll(()=>page.evaluate(id=>{
      const scene=window.__game.scene.scenes[0] as ArenaScene;
      return document.fullscreenElement!==null &&
        scene.textures.exists('gb-'+id+'-idle-0') &&
        scene.children.list.filter(item=>item.type==='Image').every(item=>{
          const sprite=item as Phaser.GameObjects.Image;
          return !sprite.visible || (scene.textures.exists(sprite.texture.key) && sprite.texture.has(sprite.frame.name));
        });
    },id)).toBe(true);
    await page.evaluate(async()=>{await document.exitFullscreen();});
    await expect.poll(()=>page.evaluate(()=>document.fullscreenElement===null)).toBe(true);
  });
}
