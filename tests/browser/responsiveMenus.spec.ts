import { test, expect, type Page } from '@playwright/test';

test.use({isMobile:true,hasTouch:true});

async function startPage(page:Page,width:number,height:number):Promise<void>{
  await page.setViewportSize({width,height});
  await page.goto('/');
  await expect(page.locator('.meta-shell[data-screen="home"]')).toBeVisible();
}
async function visibleInsideViewport(page:Page,selector:string):Promise<void>{
  const rect=await page.locator(selector).first().boundingBox();
  expect(rect,selector).not.toBeNull();
  const viewport=page.viewportSize()!;
  expect(rect!.x,selector).toBeGreaterThanOrEqual(-1);
  expect(rect!.y,selector).toBeGreaterThanOrEqual(-1);
  expect(rect!.x+rect!.width,selector).toBeLessThanOrEqual(viewport.width+1);
  expect(rect!.y+rect!.height,selector).toBeLessThanOrEqual(viewport.height+1);
}

test('portrait front-menu uses viewport: primary actions and fullscreen are not cut off',async({page})=>{
  await startPage(page,390,844);
  await expect(page.locator('.play-layout')).toHaveClass(/is-front-menu/);
  await expect(page.locator('#game')).toBeHidden();
  await visibleInsideViewport(page,'.meta-panel');
  await visibleInsideViewport(page,'[data-menu="play"]');
  await visibleInsideViewport(page,'[data-menu="fullscreen"]');
  await page.screenshot({path:'test-results/mobile-home-portrait-fixed.png'});
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('.meta-shell[data-screen="characters"]')).toBeVisible();
  await expect(page.locator('.meta-character')).toHaveCount(8);
  await visibleInsideViewport(page,'[data-menu="start"]');
  await visibleInsideViewport(page,'[data-menu="home"]');
  await visibleInsideViewport(page,'[data-menu="fullscreen"]');
  await page.screenshot({path:'test-results/mobile-characters-portrait-fixed.png'});
});

test('landscape selection keeps header, 8 characters, Start and Back in one accessible panel',async({page})=>{
  await startPage(page,844,390);
  await visibleInsideViewport(page,'[data-menu="play"]');
  await visibleInsideViewport(page,'[data-menu="fullscreen"]');
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator('.meta-character')).toHaveCount(8);
  await visibleInsideViewport(page,'.meta-header');
  await visibleInsideViewport(page,'[data-menu="start"]');
  await visibleInsideViewport(page,'[data-menu="home"]');
  const selected=page.locator('[data-character="alpha"]');
  await selected.click();
  await expect(selected).toHaveAttribute('aria-pressed','true');
  await page.screenshot({path:'test-results/mobile-characters-landscape-fixed.png'});
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#game')).toBeVisible();
  await expect(page.locator('.play-layout')).not.toHaveClass(/is-front-menu/);
  await expect(page.locator('#menu-open')).toBeVisible();
});

test('non-fullscreen landscape MENU, FULL SCREEN, single FLEX and joystick do not overlap',async({page})=>{
  await startPage(page,844,390);
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator('#menu-open')).toBeVisible();
  await expect(page.locator('#fullscreen-toggle')).toBeVisible();
  await expect(page.locator('[data-game-action="flex"]')).toBeVisible();
  await expect(page.locator('[data-game-action="flex"]')).toHaveCount(1);
  await expect(page.locator('[data-game-action="focus"]')).toHaveCount(0);
  await expect(page.locator('#joystick-track')).toBeVisible();
  const buttonRects=await Promise.all(['#menu-open','#fullscreen-toggle','[data-game-action="flex"]','#joystick-track']
    .map(selector=>page.locator(selector).boundingBox()));
  const [menu,fullscreen,flex,joystick]=buttonRects;
  const overlap=(a:NonNullable<typeof menu>,b:NonNullable<typeof menu>)=>
    Math.max(a.x,b.x)<Math.min(a.x+a.width,b.x+b.width)
    && Math.max(a.y,b.y)<Math.min(a.y+a.height,b.y+b.height);
  expect(overlap(menu!,fullscreen!)).toBe(false);
  expect(overlap(menu!,flex!)).toBe(false);
  expect(overlap(menu!,joystick!)).toBe(false);
  expect(overlap(fullscreen!,flex!)).toBe(false);
  expect(overlap(flex!,joystick!)).toBe(false);
  await page.screenshot({path:'test-results/mobile-nonfullscreen-landscape-fixed.png'});
  await page.locator('#menu-open').click();
  await expect(page.locator('#meta-shell')).toContainText('PAUSED');
  await page.locator('[data-menu="resume"]').click();
  await expect(page.locator('#meta-shell')).toBeHidden();
});
