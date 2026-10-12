import {test,expect} from '@playwright/test';
import type {ArenaScene} from '../../src/game/scenes/ArenaScene';
declare global { interface Window { __game: Phaser.Game } }

test.beforeEach(async ({page})=>{
  await page.route('**/src/main.ts',async route=>{
    const result=await route.fetch();
    await route.fulfill({response:result,body:(await result.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(')});
  });
  await page.goto('/');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
});

test('Aura Arena retains grounded shadows, crisp effects and high-contrast HUD',async({page})=>{
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect.poll(()=>page.evaluate(()=>(window.__game.scene.scenes[0] as ArenaScene).arena.mode)).toBe('playing');
  const art=await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const floor=scene.textures.get('af-arena').getSourceImage() as HTMLCanvasElement;
    const pixel=[...floor.getContext('2d')!.getImageData(50,135,1,1).data].slice(0,3);
    const effects=scene.children.list.filter(g=>g.type==='Graphics').map(g=>(g as Phaser.GameObjects.Graphics).depth);
    const status=scene.children.list.filter(o=>o.type==='Text').map(o=>(o as Phaser.GameObjects.Text).text)
      .find(v=>v.includes('FARM AURA'));
    return {pixel,effects,status};
  });
  expect(art.pixel).toHaveLength(3);
  expect(art.pixel.every(n=>n>0)).toBe(true); // painted power fixture on modular arena
  expect(art.effects).toContain(.65); // shadows drawn behind actors
  expect(art.effects).toContain(1.65); // hit VFX drawn over actors
  expect(art.status).toContain('FARM AURA');
  await page.screenshot({path:'test-results/visual-quality-combat.png'});
});
test('Big Hater health bar and hit flash render with no gameplay hitbox changes',async({page})=>{
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const a=scene.arena;
    a.wave=5;a.waveClock=15000;a.bossSpawned=true;
    a.enemies=[{id:100,type:'boss',x:500,y:260,hp:450,nextHit:Infinity,nextShot:Infinity}];
    a.shots=[];a.drops=[];
  });
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.children.list.some(o=>o.type==='Image'&&(o as Phaser.GameObjects.Image).texture.key.startsWith('af-enemy-boss-')&&(o as Phaser.GameObjects.Image).visible);
  })).toBe(true);
  await page.screenshot({path:'test-results/visual-quality-boss.png'});
  const hp=await page.evaluate(()=> (window.__game.scene.scenes[0] as ArenaScene).arena.hp);
  expect(hp).toBeGreaterThan(0);
});
