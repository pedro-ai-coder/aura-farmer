import { test, expect } from '@playwright/test';

test('Ruin Alley selected in cartoon mode, classic remains intact', async ({ page }) => {
  await page.goto('/?visual=cartoon');
  await expect(page.locator('.play-layout')).toHaveAttribute('data-map','ruin-alley');
  await expect(page.locator('html')).toHaveClass(/cartoon-ui/);
  await expect(page.locator('button[data-menu="play"]')).toBeVisible();

  await page.goto('/?visual=arena');
  await expect(page.locator('.play-layout')).toHaveAttribute('data-map','classic');
});

test('new world keeps game controls accessible during movement', async ({ page }) => {
  await page.goto('/?visual=cartoon');
  await expect(page.locator('.play-layout')).toHaveAttribute('data-map','ruin-alley');
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#flex-ultimate-hud')).toBeVisible();
  await page.keyboard.down('D');
  await page.waitForTimeout(1200);
  await page.keyboard.up('D');
  await expect(page.locator('#flex-ultimate-hud')).toBeVisible();
  await expect(page.locator('#loadout-hud')).toBeVisible();
});

test('short landscape menu still exposes play', async ({ page }) => {
  await page.setViewportSize({ width:844, height:390 });
  await page.goto('/?visual=cartoon');
  await expect(page.locator('.play-layout')).toHaveAttribute('data-map','ruin-alley');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
});

test('desktop cartoon home and character menu never collapse into a narrow strip',async({page})=>{
  await page.setViewportSize({width:1412,height:900});
  await page.goto('/?visual=cartoon');
  const stage=page.locator('.play-layout');
  await expect(stage).toHaveClass(/is-front-menu/);
  const stageBox=await stage.boundingBox();
  const panel=page.locator('#meta-shell .meta-panel');
  const panelBox=await panel.boundingBox();
  expect(stageBox).not.toBeNull();
  expect(panelBox).not.toBeNull();
  if(stageBox&&panelBox){
    expect(stageBox.height).toBeGreaterThan(500);
    expect(panelBox.height).toBeGreaterThan(160);
    expect(panelBox.y).toBeGreaterThanOrEqual(stageBox.y);
    expect(panelBox.y+panelBox.height).toBeLessThanOrEqual(stageBox.y+stageBox.height+1);
  }
  await page.locator('[data-menu="play"]').click();
  const roster=page.locator('#meta-shell .meta-panel');
  await expect(roster).toBeVisible();
  const rosterBox=await roster.boundingBox();
  expect(rosterBox?.height).toBeGreaterThan(160);
});
