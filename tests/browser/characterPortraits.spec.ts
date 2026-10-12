import {test,expect} from '@playwright/test';

test('six-frame legacy strips show only the first square character portrait',async({page})=>{
  await page.goto('/?visual=legacy');
  await page.locator('[data-menu="play"]').click();
  for(const id of ['ohio','fanum','six-seven']){
    const img=page.locator(`.meta-character[data-character="${id}"] img[data-character-portrait]`);
    const wrapper=page.locator(`.meta-character[data-character="${id}"] .meta-avatar`);
    await expect(img).toHaveAttribute('data-portrait-strip','6');
    await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalWidth)).toBe(288);
    await expect.poll(()=>img.evaluate(el=>(el as HTMLImageElement).naturalHeight)).toBe(48);
    const sizes=await page.evaluate(id=>{
      const holder=document.querySelector<HTMLElement>(`.meta-character[data-character="${id}"] .meta-avatar`)!;
      const img=holder.querySelector('img')!;
      const a=holder.getBoundingClientRect(), b=img.getBoundingClientRect();
      return {ratio:b.width/b.height,frames:b.width/(a.width-6),left:b.left-a.left-3,top:b.top-a.top-3};
    },id);
    expect(sizes.ratio).toBeCloseTo(6,1);
    expect(sizes.frames).toBeCloseTo(6,1);
    expect(Math.abs(sizes.left)).toBeLessThanOrEqual(1);
    expect(Math.abs(sizes.top)).toBeLessThanOrEqual(1);
    await expect(wrapper).not.toHaveClass(/is-portrait-fallback/);
  }
  await page.locator('[data-character="ohio"]').click();
  await page.locator('[data-menu="home"]').click();
  await expect(page.locator('.meta-feature img[data-character-portrait="ohio"]')).toHaveAttribute('data-portrait-strip','6');
  await expect(page.locator('.meta-feature .meta-avatar')).not.toHaveClass(/is-portrait-fallback/);
});

test('portrait loading failure reveals clean initials rather than a broken image',async({page})=>{
  await page.goto('/?visual=legacy');
  await page.locator('[data-menu="play"]').click();
  const card=page.locator('.meta-character[data-character="ohio"]');
  await expect(card.locator('img')).toBeVisible();
  await card.locator('img').evaluate(img=>img.dispatchEvent(new Event('error')));
  await expect(card.locator('.meta-avatar')).toHaveClass(/is-portrait-fallback/);
  await expect(card.locator('img')).toBeHidden();
  await expect(card.locator('.meta-avatar-fallback')).toHaveText('OK');
});
