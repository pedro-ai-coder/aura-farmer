import {expect,test,type Page} from "@playwright/test";
import type {ArenaScene} from "../../src/game/scenes/ArenaScene";

declare global {interface Window { __game: Phaser.Game }}

async function prepare(page:Page,path:string):Promise<void>{
  await page.route("**/src/main.ts",async route=>{
    const response=await route.fetch();
    await route.fulfill({response,body:(await response.text()).replace("new Phaser.Game(", "window.__game = new Phaser.Game(")});
  });
  await page.goto(path);
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
}

test("Gate A preview is opt-in and regular game remains unchanged",async({page})=>{
  await prepare(page,"/");
  await expect(page.locator("html")).not.toHaveClass(/gate-a-mode/);
  const keys=await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.textures.exists("ga-sigma-idle-0")||scene.textures.exists("ga-floor");
  });
  expect(keys).toBe(false);
});

test("preview uses Aura Arena graphics, without plant-world signage",async({page})=>{
  await prepare(page,"/?gateA=1");
  await expect(page.locator("html")).toHaveClass(/gate-a-mode/);
  await expect(page.locator(".af-home-event")).toContainText("AURA ARENA");
  await expect(page.locator(".af-home-event")).not.toContainText("WITHERROOT");
  await expect(page.locator(".af-home-art .af-hero-art")).toHaveAttribute("src",/^data:image\/png/);
  await expect(page.locator(".masthead")).toContainText("GATE A");
  const present=await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return ["ga-floor","ga-sigma-idle-0","ga-sigma-move-5","ga-npc-move-0","ga-hater-move-0","ga-xp","ga-hit-3"]
      .every(k=>scene.textures.exists(k));
  });
  expect(present).toBe(true);
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator("#meta-shell")).toContainText("CHOOSE YOUR FIGHTER");
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator("#meta-shell")).toBeHidden();
  const textures=await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const a=scene.arena;
    a.enemies=[
      {id:888,type:"npc",x:590,y:370,hp:27,nextHit:Infinity,nextShot:Infinity},
      {id:889,type:"hater",x:720,y:400,hp:36,nextHit:Infinity,nextShot:Infinity},
    ];
    a.drops.push({x:620,y:420,xp:8});
    return true;
  });
  expect(textures).toBe(true);
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const names=scene.children.list.filter(item=>item.type==="Image").map(item=>(item as Phaser.GameObjects.Image).texture.key);
    return names.includes("ga-floor")&&names.some(n=>n.startsWith("ga-sigma-"))
      &&names.some(n=>n.startsWith("ga-npc-"))&&names.some(n=>n.startsWith("ga-hater-"))
      &&names.includes("ga-xp");
  })).toBe(true);
  await page.screenshot({path:"test-results/gate-a-arena-desktop.png"});
});

test("Gate A keeps touch/menu layout at mobile landscape size",async({page})=>{
  await page.setViewportSize({width:844,height:390});
  await prepare(page,"/?gateA=1");
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  const btn=page.locator("#menu-open");
  await expect(btn).toBeVisible();
  await btn.click();
  await expect(page.locator("#meta-shell")).toContainText("PAUSED");
  await page.locator('[data-menu="resume"]').click();
  await expect(page.locator("#meta-shell")).toBeHidden();
});
