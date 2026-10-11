import { test, expect, type Page } from '@playwright/test';
import type { Arena } from '../../src/game/core/arena';
import type { ArenaScene } from '../../src/game/scenes/ArenaScene';

// Observability is injected into the HTTP response only; the shipped game has no test global.
declare global { interface Window { __game: Phaser.Game } }
async function read<T>(page: Page, fn: (arena: Arena) => T): Promise<T> {
  return page.evaluate(`(${fn.toString()})(window.__game.scene.scenes[0].arena)`);
}
async function press(page: Page, key: string) {
  const frame = await page.evaluate(() => window.__game.loop.frame);
  await page.keyboard.down(key);
  try { await page.waitForFunction(start => window.__game.loop.frame > start + 1, frame); }
  finally { await page.keyboard.up(key); }
}

test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  (page as Page & { runtimeErrors?: string[] }).runtimeErrors = errors;
  await page.route('**/src/main.ts', async route => {
    const response = await route.fetch();
    await route.fulfill({ response, body: (await response.text()).replace('new Phaser.Game(', 'window.__game = new Phaser.Game(') });
  });
  await page.goto('/');
  await expect(page.locator('canvas')).toBeAttached(); // front menus intentionally hide the combat stage
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('.controls')).toContainText('choose upgrade');
  await expect.poll(() => read(page, a => a.mode)).toBe('intro');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'test-results/intro.png' });
  await press(page, 'Enter');
  await expect.poll(() => read(page, a => a.mode)).toBe('playing');
});

test.afterEach(async ({ page }) => {
  expect((page as Page & { runtimeErrors?: string[] }).runtimeErrors ?? []).toEqual([]);
});

test('real keyboard, rendering, natural auto-combat, pickup and upgrade choice', async ({ page }) => {
  const x = await read(page, a => a.pos.x);
  await press(page, 'ArrowRight');
  expect(await read(page, a => a.pos.x)).toBeGreaterThan(x);
  await press(page, 'w');
  expect(await read(page, a => a.pos.y)).toBeLessThan(330);
  await press(page, 'e');
  await expect.poll(() => read(page, a => a.flex.state)).toBe('charging');
  await expect.poll(() => read(page, a => a.flex.state)).toBe('cooldown');
  expect(await read(page, a => a.aura.value)).toBe(0);
  await press(page, 'Space');
  expect(await read(page, a => a.focusReady)).toBeGreaterThan(0);
  await expect.poll(() => read(page, a => a.kills), { timeout: 25000 }).toBeGreaterThan(0);
  expect(await read(page, a => a.drops.length)).toBeGreaterThan(0);
  // Move onto a real kill's drop to check collection through the running scene.
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.pos = { ...a.drops[0] };
  });
  await expect.poll(() => read(page, a => a.xp.xp)).toBeGreaterThan(0);
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.drops.push({ ...a.pos, xp: 20 });
  });
  await expect.poll(() => read(page, a => a.mode)).toBe('upgrades');
  const clock = await read(page, a => a.clock);
  await press(page, 'd'); await page.waitForTimeout(300);
  expect(await read(page, a => a.clock)).toBe(clock);
  await page.screenshot({ path: 'test-results/upgrades.png' });
  await press(page, '1');
  await expect.poll(() => read(page, a => a.mode)).toBe('playing');
  expect(await read(page, a => Object.values(a.buffs).reduce((x, y) => x + y, 0))).toBe(1);
  await page.keyboard.press('F3');
  await expect.poll(() => page.evaluate(() => {
    const texts = window.__game.scene.scenes[0].children.list.filter(x => x.type === 'Text') as Phaser.GameObjects.Text[];
    return texts.some(t => t.text.includes('FPS'));
  })).toBe(true);
  await page.screenshot({ path: 'test-results/combat.png' });
});

test('FLEX success, 15s cooldown, damage interrupt, radius and timed Aura Burst', async ({ page }) => {
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.enemies = [270, 330, 390].map((y, id) => ({ x: 610, y, id, type: 'npc', hp: 10000, nextHit: Infinity, nextShot: Infinity }));
  });
  await press(page, 'e');
  await expect.poll(() => read(page, a => a.flex.state)).toBe('charging');
  const position = await read(page, a => a.pos.x);
  await press(page, 'd'); expect(await read(page, a => a.pos.x)).toBe(position);
  await expect.poll(() => read(page, a => a.aura.value)).toBe(25);
  await press(page, 'e'); expect(await read(page, a => a.flex.state)).toBe('cooldown');
  expect(await read(page, a => a.enemies[1].x)).toBeGreaterThan(600);
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.clock = a.flex.cooldownUntil;
    a.enemies = [{ ...a.pos, id: 99, type: 'npc', hp: 10000, nextHit: 0, nextShot: Infinity }];
    a.flex.tryStart(a.clock); a.update(10);
  });
  expect(await read(page, a => a.flex.state)).toBe('cooldown');
  expect(await read(page, a => a.feedback)).toContain('interrupted');
  expect(await read(page, a => a.aura.value)).toBe(5);
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.enemies = []; a.shots = [];
    a.aura.change(100, a.clock);
  });
  expect(await read(page, a => a.aura.value)).toBe(40);
  expect(await read(page, a => a.aura.attackMultiplier(a.clock))).toBe(1.2);
  await page.screenshot({ path: 'test-results/burst.png' });
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.clock = a.aura.burstUntil;
  });
  expect(await read(page, a => a.aura.attackMultiplier(a.clock))).toBe(1);
});

test('all wave transitions, boss kill required, victory and clean restart', async ({ page }) => {
  for (let wave = 1; wave < 5; wave++) {
    await page.evaluate(() => { (window.__game.scene.scenes[0] as ArenaScene).arena.waveClock = 50000; });
    await expect.poll(() => read(page, a => a.mode)).toBe('between');
    await press(page, 'Enter');
    await expect.poll(() => read(page, a => a.wave)).toBe(wave + 1);
  }
  await page.evaluate(() => { (window.__game.scene.scenes[0] as ArenaScene).arena.waveClock = 12000; });
  await expect.poll(() => read(page, a => a.enemies.some(e => e.type === 'boss'))).toBe(true);
  await page.screenshot({ path: 'test-results/boss.png' });
  await page.evaluate(() => { (window.__game.scene.scenes[0] as ArenaScene).arena.waveClock = 50000; });
  await page.waitForTimeout(200); expect(await read(page, a => a.mode)).toBe('playing');
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    const boss = a.enemies.find(e => e.type === 'boss')!;
    boss.hp = 1; boss.x = a.pos.x + 100; boss.y = a.pos.y; boss.nextShot = Infinity;
    a.enemies = [boss]; a.shots = [];
  });
  await expect.poll(() => read(page, a => a.mode)).toBe('win');
  await page.screenshot({ path: 'test-results/victory.png' });
  await press(page, 'Enter');
  expect(await read(page, a => [a.wave, a.hp, a.kills, a.bossSpawned, a.bossDefeated])).toEqual([1, 100, 0, false, false]);
});

test('collision causes defeat and Enter restarts with full HP and no upgrades', async ({ page }) => {
  await page.evaluate(() => {
    const a = (window.__game.scene.scenes[0] as ArenaScene).arena;
    a.hp = 1; a.buffs.speed = 3;
    a.enemies = [{ ...a.pos, id: 0, type: 'npc', hp: 100, nextHit: 0, nextShot: Infinity }];
  });
  await expect.poll(() => read(page, a => a.mode)).toBe('dead');
  await page.screenshot({ path: 'test-results/defeat.png' });
  await press(page, 'Enter');
  expect(await read(page, a => [a.mode, a.hp, a.buffs.speed])).toEqual(['playing', 100, 0]);
});


test('pixel-cartoon assets load with the light Lavender Pop arena and remain visible', async ({ page }) => {
  const proof = await page.evaluate(() => {
    const scene = window.__game.scene.scenes[0] as ArenaScene;
    const required = [
      'px-floor', 'px-player-idle', 'px-player-flex',
      'px-npc-0', 'px-hater-0', 'px-beta-0', 'px-boss-0',
      'px-xp', 'px-shot', 'px-hostile',
    ];
    const missing = required.filter(key => !scene.textures.exists(key));
    const imported = ['spr-sigma', 'spr-npc', 'spr-hater', 'spr-beta', 'spr-boss', 'spr-items', 'spr-icons'];
    const missingSheets = imported.filter(key => !scene.textures.exists(key));
    const spriteFrames = Object.fromEntries(imported.map(key =>
      [key, scene.textures.exists(key) ? scene.textures.get(key).frameTotal : 0]));
    const displayed = scene.children.list.filter(x => x.type === 'Image')
      .map(x => (x as Phaser.GameObjects.Image).texture.key);
    const canvas = scene.textures.get('px-floor').getSourceImage() as HTMLCanvasElement;
    const pixel = [...canvas.getContext('2d')!.getImageData(0, 0, 1, 1).data].slice(0, 3);
    const texturesVisible = scene.children.list.filter(x => x.type === 'Image' && (x as Phaser.GameObjects.Image).visible).length;
    return { missing, missingSheets, spriteFrames, displayed, pixel, texturesVisible };
  });
  expect(proof.missing).toEqual([]);
  expect(proof.missingSheets).toEqual([]);
  expect(proof.spriteFrames['spr-sigma']).toBeGreaterThan(5);
  expect(proof.spriteFrames['spr-boss']).toBeGreaterThan(3);
  expect(proof.spriteFrames['spr-icons']).toBeGreaterThan(16);
  expect(proof.displayed).toContain('spr-sigma-b1');
  expect(proof.pixel).toEqual([246, 240, 234]); // approved Cream: #F6F0EA
  expect(proof.texturesVisible).toBeGreaterThanOrEqual(2); // player + arena
  await page.screenshot({ path: 'test-results/pixel-cartoon.png' });
});
