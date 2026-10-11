import { test, expect } from '@playwright/test';

test('identity skin renders a single functional hero menu and real loader completes', async ({page})=>{
  await page.goto('/');
  await expect(page.locator('#af-loading')).toBeHidden();
  await expect(page.locator('.af-home-layout')).toBeVisible();
  await expect(page.locator('h1')).toContainText('GROW YOUR LEGEND');
  await expect(page.locator('.af-home-event')).toContainText('WITHERROOT');
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('[data-menu="choose"]')).toHaveCount(6);
  await expect(page.locator('.af-home-layout')).toHaveCount(0);
});

test('visual event banners react to real gameplay signal without covering navigation',async({page})=>{
  await page.goto('/');
  await expect(page.locator('#af-loading')).toBeHidden();
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('aura:wave',{detail:5})));
  const spotlight=page.locator('#af-spotlight');
  await expect(spotlight).toBeVisible();
  await expect(spotlight).toContainText('THE BIG HATER');
  expect(await spotlight.getAttribute('data-variant')).toBe('boss');
  expect(await spotlight.evaluate(el=>getComputedStyle(el).pointerEvents)).toBe('none');
  await page.evaluate(()=>window.dispatchEvent(new CustomEvent('aura:burst')));
  await expect(spotlight).toContainText('AURA BURST!');
});
