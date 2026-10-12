import {expect,test,type Page} from '@playwright/test';
import type {ArenaScene} from '../../src/game/scenes/ArenaScene';

declare global { interface Window {__game:Phaser.Game} }
const names:Record<string,string>={ohio:'Ohio Kid',fanum:'Fanum Lord','six-seven':'Six Seven Kid'};
async function boot(page:Page,url:string):Promise<void>{
 await page.route('**/src/main.ts',async route=>{
  const result=await route.fetch();
  await route.fulfill({response:result,body:(await result.text()).replace('new Phaser.Game(','window.__game = new Phaser.Game(')});
 });
 await page.goto(url);
 await expect(page.locator('[data-menu="play"]')).toBeVisible();
}
test('B2 is independent of ordinary, Gate A and Gate B1 routes',async({page})=>{
 await boot(page,'/?gateB=1');
 expect(await page.evaluate(()=>{
  const s=window.__game.scene.scenes[0] as ArenaScene;
  return s.textures.getTextureKeys().filter(n=>n.startsWith('gb2-')).length;
 })).toBe(0);
 await page.goto('/?gateB=2');
 await expect(page.locator('[data-menu="play"]')).toBeVisible();
 expect(await page.evaluate(()=>{
  const s=window.__game.scene.scenes[0] as ArenaScene;
  return s.textures.exists('ga-floor')&&s.textures.exists('gb-alpha-idle-0')&&s.textures.exists('gb2-ohio-idle-0');
 })).toBe(true);
});
for(const id of ['ohio','fanum','six-seven'] as const){
 test('B2 '+id+' portrait, animated gameplay, fullscreen',async({page})=>{
  await page.setViewportSize({width:1100,height:820});
  await boot(page,'/?gateB=2');
  await expect(page.locator('.masthead')).toContainText('GATE B2');
  await expect(page.locator('.af-home-event')).toContainText('ALL SIX HEROES');
  const has=await page.evaluate(id=>{
   const s=window.__game.scene.scenes[0] as ArenaScene;
   return [
    'ga-floor','gb2-'+id+'-idle-0','gb2-'+id+'-move-5',
    'gb2-'+id+'-death-5','gb2-'+id+'-'+(id==='ohio'?'dash':id==='fanum'?'tax':'volley')+'-0'
   ].every(key=>s.textures.exists(key));
  },id);
  expect(has).toBe(true);
  await page.locator('[data-menu="play"]').click();
  const card=page.locator('.meta-character[data-character="'+id+'"]');
  await expect(card).toBeEnabled();
  await expect(card.locator('img')).toHaveAttribute('src',/^data:image\/png/);
  await card.click();
  await page.locator('[data-menu="home"]').click();
  await expect(page.locator('.meta-feature')).toContainText(names[id]);
  await expect(page.locator('.af-home-art .af-hero-art')).toHaveAttribute('src',/^data:image\/png/);
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect.poll(()=>page.evaluate(id=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.arena.characterId===id &&
      scene.children.list.some(item=>item.type==='Image' && (item as Phaser.GameObjects.Image).texture.key.startsWith('gb2-'+id+'-'));
  },id)).toBe(true);
  await page.evaluate(async()=>{await document.querySelector<HTMLElement>('.play-layout')!.requestFullscreen();});
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return !!document.fullscreenElement && scene.children.list
      .filter(o=>o.type==='Image')
      .every(o=>{
        const i=o as Phaser.GameObjects.Image;
        return !i.visible || (scene.textures.exists(i.texture.key)&&i.texture.has(i.frame.name));
      });
  })).toBe(true);
  await page.evaluate(async()=>{await document.exitFullscreen();});
  await expect.poll(()=>page.evaluate(()=>!document.fullscreenElement)).toBe(true);
 });
}
test('B2 does not write preview-only locked selections to the real profile',async({page})=>{
 await boot(page,'/?gateB=2');
 await page.locator('[data-menu="play"]').click();
 await page.locator('[data-character="fanum"]').click();
 const data=await page.evaluate(()=>localStorage.getItem('aura-farmer:profile:v1'));
 expect(!data || !JSON.parse(data).unlockedCharacters.includes('fanum')).toBe(true);
 await expect(page.locator('.meta-character[data-character="fanum"]')).toHaveAttribute('aria-pressed','true');
});
test('B2 portrait layout remains reachable in portrait size',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 await boot(page,'/?gateB=2');
 await page.locator('[data-menu="play"]').click();
 await expect(page.locator('[data-character="six-seven"]')).toBeVisible();
 await page.locator('[data-character="six-seven"]').click();
 await expect(page.locator('[data-character="six-seven"]')).toHaveAttribute('aria-pressed','true');
 await expect(page.locator('[data-menu="start"]')).toBeVisible();
});
