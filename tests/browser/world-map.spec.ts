import { test, expect } from '@playwright/test';

test('Ruin Alley selected in cartoon mode, classic remains intact', async ({ page }) => {
  await page.goto('/?visual=cartoon');
  await expect(page.locator('.play-layout')).toHaveAttribute('data-map','ruin-alley');
  await expect(page.locator('html')).toHaveClass(/cartoon-v1/);
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
