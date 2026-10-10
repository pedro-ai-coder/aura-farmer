# Pixel Cartoon Visual Pass — v0.3

**Status:** implementation PR (not a final hand-drawn pixel sprite pack).

Approved direction: [Art Bible](ART_BIBLE.md), [Gate A](ART_TEST_GATE_A.md). This release implements a first **playable** pass of the approved look. The renderer draws small, original 24×24 pixel patterns once into cached CanvasTextures, then Phaser displays them as pixel sprites. No generated reference illustration was shipped or converted into a spritesheet.

## Delivered

- Sigma: dark hoodie, angular hair, gold Aura chest symbol; idle, movement alternation, FLEX and hurt pose.
- NPC, Hater, Beta Bro and Big Hater: distinguishable silhouette, palette and simple animated states.
- Amber player shots, coral hostile shots, bright green XP crystal, bright cyan/amber orb.
- Light Lavender Pop arena, subtle tile texture, cream HUD area, dark readable text, gold FLEX and Aura effects.
- Mobile joystick and touch actions skinned for the new palette while preserving their tap targets.

## Deferred to hand-drawn art production

True individually drawn Aseprite sprite sheets, polished run/death cycles, distinct weapon animations, 17 detailed buff icons, extra decoration and event banners. The code-based pixel sprites are **original placeholders**, not a substitute for a contracted pixel artist's deliverables. The renderer and textures can be replaced incrementally without changing combat mechanics.

## Runtime restrictions

- The Arena combat simulation is unchanged.
- Character hitboxes, five waves, buffs, boss and controls are unchanged.
- Cached CanvasTextures are created once per scene (no per-frame texture generation).
- Entity images are keyed by stable enemy IDs; dead enemies are destroyed; shot and XP display objects are pooled.
- Large FLEX and other hit area warnings remain procedural to match actual gameplay radius.
- No server, external image licensing requirement or backend.

## Verification checklist

- `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`.
- Desktop/Android portrait/landscape readability.
- Visual proof of `#F6F0EA` exterior and `#DDD6F0` arena, and distinct dangers versus rewards.
- Enemy cap 90 and CPU/GPU performance on a physical Android device.
- Check focus warning, FLEX animation/state, kill/drop/upgrade, boss victory and death.
- Only merge after CI green, then verify Vercel READY.

## Artist next steps

When ready for P0 final art, supply editable Aseprite sprites and matching PNG/atlas/metadata per Art Bible. Replace runtime textures sprite-by-sprite, maintaining origin, scaling, IDs, collision and mobile requirements.
