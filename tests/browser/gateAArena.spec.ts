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


test("Gate A desktop home keeps event, hero and caption inside one unscrolled panel",async({page})=>{
  await page.setViewportSize({width:1100,height:820});
  await prepare(page,"/?gateA=1");
  const panel=page.locator('.meta-shell[data-screen="home"] .meta-panel');
  const event=page.locator('.af-home-event');
  const hero=page.locator('.af-home-art .af-hero-art');
  const caption=page.locator('.af-art-caption');
  await expect(panel).toBeVisible();
  await expect(event).toBeVisible();
  await expect(hero).toBeVisible();
  await expect(caption).toBeVisible();
  const p=await panel.boundingBox(), e=await event.boundingBox(),h=await hero.boundingBox(),c=await caption.boundingBox();
  expect(p&&e&&h&&c).toBeTruthy();
  expect(e!.y+e!.height).toBeLessThanOrEqual(p!.y+p!.height-2);
  expect(c!.y+c!.height).toBeLessThanOrEqual(p!.y+p!.height-2);
  expect(h!.y+h!.height).toBeLessThanOrEqual(c!.y+12);
  const overflow=await panel.evaluate(el=>({
    delta:el.scrollHeight-el.clientHeight,
    overflow:getComputedStyle(el).overflowY,
  }));
  expect(overflow.overflow).toBe("hidden");
  expect(overflow.delta).toBeLessThanOrEqual(3);
});

test("Gate A MENU label is singular and remains clickable at desktop and landscape sizes",async({page})=>{
  await page.setViewportSize({width:1100,height:820});
  await prepare(page,"/?gateA=1");
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  const btn=page.locator("#menu-open");
  await expect(btn).toBeVisible();
  await expect(btn).toHaveText("☰ MENU");
  const after=await btn.evaluate(el=>getComputedStyle(el,"::after").content);
  expect(["none","normal"].includes(after)).toBe(true);
  let bounds=await btn.boundingBox(),stage=await page.locator(".play-layout").boundingBox();
  expect(bounds&&stage).toBeTruthy();
  expect(bounds!.x+bounds!.width).toBeLessThan(stage!.x+stage!.width-7);
  expect(bounds!.y).toBeGreaterThan(stage!.y+7);
  await btn.click();
  await expect(page.locator("#meta-shell")).toContainText("PAUSED");
});

test("Gate A portrait home retains reachable PLAY and event without overlapping art",async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await prepare(page,"/?gateA=1");
  await expect(page.locator('[data-menu="play"]')).toBeVisible();
  await expect(page.locator(".af-home-event")).toBeVisible();
  const art=await page.locator(".af-home-art").boundingBox();
  const event=await page.locator(".af-home-event").boundingBox();
  expect(art&&event).toBeTruthy();
  expect(art!.y+art!.height).toBeLessThanOrEqual(event!.y+3);
  await page.locator('[data-menu="play"]').click();
  await expect(page.locator("#meta-shell")).toContainText("CHOOSE YOUR FIGHTER");
});


test("Gate A hero illustration matches the selected character rather than always showing Sigma",async({page})=>{
  await prepare(page,"/?gateA=1");
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-character="rizzler"]').click();
  await page.locator('[data-menu="home"]').click();
  const hero=page.locator(".af-home-art .af-hero-art");
  await expect(hero).toHaveAttribute("src",/rizzler-portrait\.png/);
  await expect(page.locator(".meta-feature")).toContainText("The Rizzler");
});


test("Gate A fullscreen repairs a missing dynamically painted impact texture",async({page})=>{
  await page.setViewportSize({width:1200,height:800});
  await prepare(page,"/?gateA=1");
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await expect(page.locator("#menu-open")).toBeVisible();
  await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    scene.setPaused(true); // inspect a known stable scene while the browser resizes
    scene.textures.remove("ga-hit-0");
  });
  await page.evaluate(async()=>{
    const layout=document.querySelector<HTMLElement>(".play-layout")!;
    await layout.requestFullscreen();
  });
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return document.fullscreenElement!==null && scene.textures.exists("ga-hit-0");
  })).toBe(true);
  await page.evaluate(async()=>{await document.exitFullscreen();});
  await expect.poll(()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return document.fullscreenElement===null && scene.textures.exists("ga-hit-0");
  })).toBe(true);
});

test("visible Gate A images never show Phaser missing-texture square around fullscreen",async({page})=>{
  await page.setViewportSize({width:1200,height:800});
  await prepare(page,"/?gateA=1");
  await page.locator('[data-menu="play"]').click();
  await page.locator('[data-menu="start"]').click();
  await page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    const a=scene.arena;
    // Exercising every category without bypassing the actual renderer.
    a.enemies=[{id:819,type:'npc',x:400,y:310,hp:30,nextHit:999999,nextShot:999999},
      {id:820,type:'hater',x:660,y:320,hp:50,nextHit:999999,nextShot:999999}];
    a.shots=[{x:510,y:390,vx:0,vy:0,ttl:100000,damage:1,hostile:false,bounces:0},
      {x:620,y:390,vx:0,vy:0,ttl:100000,damage:1,hostile:true,bounces:0}];
    a.drops=[{x:550,y:460,xp:3}];
    a.buffs['ohio-orbiter']=1;
    scene.setPaused(false);
  });
  const inspect=()=>page.evaluate(()=>{
    const scene=window.__game.scene.scenes[0] as ArenaScene;
    return scene.children.list.filter(o=>o.type==='Image')
      .map(o=>o as Phaser.GameObjects.Image)
      .filter(img=>img.visible && (img.texture.key==='__MISSING' ||
        !scene.textures.exists(img.texture.key) || !img.texture.has(img.frame.name)))
      .map(img=>({key:img.texture.key,frame:img.frame.name,x:img.x,y:img.y}));
  });
  await expect.poll(inspect).toEqual([]);
  await page.evaluate(async()=>{await document.querySelector<HTMLElement>('.play-layout')!.requestFullscreen();});
  await expect.poll(inspect).toEqual([]);
  await page.evaluate(async()=>{await document.exitFullscreen();});
  await expect.poll(inspect).toEqual([]);
});
