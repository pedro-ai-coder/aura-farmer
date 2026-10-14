import { test, expect } from '@playwright/test';

test('three playable maps and their cartoon art appear in map selection',async({page})=>{
 await page.goto('/?visual=cartoon');
 await page.locator('[data-menu="maps"]').click();
 const cards=page.locator('.af-map-pick');
 await expect(cards).toHaveCount(3);
 for(const id of ['ruin-alley','crown-chamber','toxic-rooftop']){
   await expect(page.locator(`button.af-map-pick[data-character="${id}"]`)).toBeVisible();
   const image=page.locator(`button.af-map-pick[data-character="${id}"] img`);
   await expect(image).toHaveJSProperty('complete',true);
 }
 await page.locator('button.af-map-pick[data-character="crown-chamber"]').click();
 await expect(page.locator('.play-layout')).toHaveAttribute('data-map','crown-chamber');
 await expect(page).toHaveURL(/map=crown-chamber/);
 await page.locator('[data-menu="maps"]').click();
 await page.locator('button.af-map-pick[data-character="toxic-rooftop"]').click();
 await expect(page.locator('.play-layout')).toHaveAttribute('data-map','toxic-rooftop');
});

test('all character pose and enemy pose assets are served as valid SVGs',async({request})=>{
 for(const id of ['sigma','alpha','rizzler','ohio','fanum','six-seven','cool-kid','nerd']){
  const sprite=await request.get('/assets/cartoon/v1/characters/'+id+'.svg');
  expect(sprite.ok()).toBeTruthy();
  expect(await sprite.text()).toContain('viewBox="0 0 128 128"');
  const flex=await request.get('/assets/cartoon/v1/characters/poses/'+id+'-flex.svg');
  expect(flex.ok()).toBeTruthy();
 }
 for(const id of ['npc','hater','beta','boss']){
  const attack=await request.get('/assets/cartoon/v1/enemies/poses/'+id+'-attack.svg');
  expect(attack.ok()).toBeTruthy();
 }
});

test('classic view remains a separate unmodified non-scrolling arena',async({page})=>{
 await page.goto('/?visual=arena&map=toxic-rooftop');
 await expect(page.locator('.play-layout')).toHaveAttribute('data-map','classic');
});
