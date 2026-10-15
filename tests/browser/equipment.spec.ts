import {expect,test,type Page} from '@playwright/test';
import type {ArenaScene} from '../../src/game/scenes/ArenaScene';
declare global{interface Window{__game:Phaser.Game}}
async function boot(page:Page,width:number,height:number){
 await page.setViewportSize({width,height});
 await page.route('**/src/main.ts',async route=>{
   const response=await route.fetch();
   await route.fulfill({response,body:(await response.text()).replace('new Phaser.Game(','window.__game = new Phaser.Game(')});
 });
 await page.goto('/');
 await page.locator('[data-menu="play"]').click();
 await page.locator('[data-menu="start"]').click();
 await expect(page.locator('#meta-shell')).toBeHidden();
}
for(const d of [{name:'desktop',width:1180,height:820},{name:'portrait',width:390,height:844}]){
 test(d.name+' equipment shows three weapon and five passive slots',async({page})=>{
   await boot(page,d.width,d.height);
   const hud=page.locator('#loadout-hud');
   await expect(hud).toBeVisible();
   await expect(hud.locator('[data-loadout="weapons"] .equipment-slot')).toHaveCount(3);
   await expect(hud.locator('[data-loadout="passives"] .equipment-slot')).toHaveCount(5);
   await expect(hud.locator('[data-equipment="aura-shot"]')).toContainText('LV 1/4');
   await expect(hud.locator('[data-loadout-count="weapons"]')).toHaveText('1/3');
   await page.evaluate(()=>{
     const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
     a.buffs['mewing-jaw']=1;a.buffs['ohio-orbiter']=1;
     a.buffs['iron-will']=1;a.buffs['speed-shoes']=1;a.buffs['lucky-charm']=1;
   });
   await expect(hud.locator('[data-loadout-count="weapons"]')).toHaveText('3/3');
   await expect(hud.locator('[data-loadout-count="passives"]')).toHaveText('3/5');
   await expect(hud.locator('[data-equipment="ohio-orbiter"]')).toContainText('LV 1/4');
   await expect(hud.locator('.equipment-slot.empty')).toHaveCount(2);
   await page.screenshot({path:'test-results/equipment-'+d.name+'.png'});
 });
}
test('the upgrade dialog clearly separates weapons and passives and refuses a sixth passive slot',async({page})=>{
 await boot(page,1180,820);
 await page.evaluate(()=>{
   const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
   a.buffs['mewing-jaw']=1;a.buffs['ohio-orbiter']=1;
   a.buffs['iron-will']=1;a.buffs['speed-shoes']=1;a.buffs['lucky-charm']=1;a.buffs['quick-hands']=1;a.buffs['gym-routine']=1;
   a.enemies=[];a.shots=[];a.mode='playing';
   a.drops=[{...a.pos,xp:20}];
   a.update(1);
 });
 await expect(page.locator('#upgrade-overlay')).toBeVisible();
 await expect(page.locator('#upgrade-title')).toContainText('UPGRADE YOUR BUILD');
 expect(await page.evaluate(()=>{
   const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
   return a.choices.every(b=>a.buffs[b.id]>0);
 })).toBe(true);
 await expect(page.locator('.upgrade-rarity:visible').first()).toContainText(/WEAPON|PASSIVE/);
 await page.keyboard.press('1');
 await expect(page.locator('#upgrade-overlay')).toBeHidden();
 await expect(page.locator('#loadout-hud')).toBeVisible();
});

for(const size of [{width:1180,height:820},{width:844,height:390},{width:390,height:844}]){
  test('Combat V2 upgrade dialog fits '+size.width+'x'+size.height,async({page})=>{
    await boot(page,size.width,size.height);
    await page.evaluate(()=>{
      const a=(window.__game.scene.scenes[0] as ArenaScene).arena;
      a.mode='playing';a.enemies=[];a.shots=[];a.pendingUpgrades=1;a.update(1);
    });
    const dialog=page.locator('#upgrade-dialog, .upgrade-dialog').first();
    await expect(page.locator('#upgrade-overlay')).toBeVisible();
    await expect(dialog).toBeVisible();
    const r=await dialog.boundingBox();
    expect(r).not.toBeNull();
    if(r){
      expect(r.width).toBeGreaterThan(250);
      expect(r.height).toBeGreaterThan(130);
      expect(r.x).toBeGreaterThanOrEqual(-1);
      expect(r.y).toBeGreaterThanOrEqual(-1);
      expect(r.x+r.width).toBeLessThanOrEqual(size.width+1);
      expect(r.y+r.height).toBeLessThanOrEqual(size.height+1);
    }
    await expect(page.locator('.upgrade-choice:visible')).toHaveCount(3);
  });
}
