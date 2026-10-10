# AURA FARMER — Pixel Cartoon Brainrot Roguelite

A fast-paced solo browser roguelite built with Phaser 3, TypeScript, and Vite. Survive five 50-second waves, collect XP, choose upgrades, and defeat the Big Hater in the final wave.

## Play online

**[Play Aura Farmer](https://aura-farmer-ecru.vercel.app)**

The Vercel deployment tracks the `main` branch. Changes appear on the live website after they have been merged and the production build succeeds.

## Mobile controls

Open the same game URL on your phone — no app installation required. Use the **virtual joystick** to move, tap **FLEX** for the risky Aura action, and **FOCUS** to slow enemies. The on-screen **PLAY / NEXT WAVE / RETRY** button replaces Enter, and upgrade buttons let you choose buffs by touch. Rotating to **landscape** gives a larger game view, but portrait controls are supported as well.

**Immersive landscape on Android:** tap **FULL SCREEN** next to the game actions. The game requests browser fullscreen and attempts to lock landscape orientation where supported. The arena is in the center, the joystick on the left and FLEX/FOCUS/upgrade buttons on the right. Tap **EXIT** to return to the normal page. If the phone stays vertical, turn it sideways manually and ensure auto-rotate is enabled.

**Fallback:** embedded browsers or iPhone Safari may reject native fullscreen/orientation lock. The game then fills the webpage viewport using CSS and offers a rotate-device prompt, but browser bars may remain visible. Native browser fullscreen and forced landscape cannot be guaranteed on every phone. Do not lock the game globally into landscape; portrait mode remains playable outside immersive mode.

**Art production:** the current sprites are original runtime-generated pixel placeholders matching the approved Art Bible. Editable final Aseprite sprite atlases are planned in [Sprite Production P0](docs/SPRITE_PRODUCTION_P0.md) and tracked separately.

## Run locally

Requires Node.js 22 (see `.nvmrc`) and npm. In your local checkout:

```bash
nvm use                 # if you use nvm
npm ci
npm run dev
```

Open the URL printed by Vite. No login, API keys, backend, or external services required. For a production-like run, use `npm run build` followed by `npm run preview`.

| Key | Action |
| --- | --- |
| ENTER | Start, advance to the next wave, or restart |
| WASD / arrow keys | Move; weapons automatically target the closest enemy |
| E | FLEX: stand still and stop attacking for 1s; keep at least 3 enemies within 145px to earn +25 Aura |
| SPACE | Sigma Focus: slow enemies for 3s |
| 1 / 2 / 3 | Choose an upgrade; the game pauses during selection |
| F3 | Show FPS and simulation diagnostics |

Collect green crystals to gain XP. Getting hit interrupts FLEX and costs 20 Aura. FLEX enters a 15-second cooldown after it ends or is interrupted. At 100 Aura, Aura Burst gives +20% damage for 6 seconds and resets the meter to 40. Reaching the end of the final wave is not enough: the boss must also be defeated.

All in-game UI, buff descriptions, and combat messages are in English. Meme-themed names (such as Sigma, Mewing, and Six Seven) are intentionally kept.

## Testing

```bash
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

On Linux, `npx playwright install --with-deps chromium` can also install system browser dependencies. The browser tests start their own Vite server on port 4174; screenshots and traces go to `test-results/` and are not committed.

Validation history and limitations: [docs/VALIDATION.md](docs/VALIDATION.md). The Phaser-independent combat simulation lives in `src/game/core/arena.ts`, and the rendering/input scene lives in `src/game/scenes/ArenaScene.ts`.

Human gameplay balance testing is still needed. Multiplayer, Discord, shop and persistence remain future features. Mobile touch and immersive landscape presentation are already implemented; final hand-drawn sprite production is planned separately.
