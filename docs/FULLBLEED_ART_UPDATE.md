# Aura Farmer — Full-Bleed and Sprite Atlas Update

## Full-bleed landscape
The entire phone viewport is the game canvas, with translucent joystick bottom-left, action buttons right and EXIT top-right. Fullscreen is started from a tap where supported; Android landscape orientation lock is attempted and manual rotation is the fallback.

Phaser's internal combat world remains 960×600. To fill ultrawide displays **without cropping**, the rendered scene is stretched to the device aspect ratio, so sprites can appear slightly wider on ultrawide phones. Future responsive-world work can eliminate distortion while keeping full-bleed.

## Production-pass PNG sprites
Seven real original transparent PNG horizontal sprite sheets are now in `public/assets/pixel`: Sigma 48px/6 frames; NPC and Hater 48px/4 frames each; Beta Bro 64px/4 frames; Big Hater 128px/4 frames; player/hostile projectiles, green XP and orbiter 16px/4 frames; and 17 buff icons 16px/17 frames.

They match the approved dark Sigma hoodie, angular hair, gold symbol and bright Lavender Pop identity. Phaser loads them as external textures and animates frames in `PixelWorld`. The existing procedural sprites remain available as fallback. Frame index manifest is in `public/assets/pixel/sprites.json`.

The delivered PNG files are editable pixel bitmaps created directly for the project, **not externally commissioned or artist-polished Aseprite spritesheets**. More animation poses, detailed UI icon refinement, VFX and editable source `.aseprite` files remain in issue #13.

## Validation
Run `npm run typecheck`, `npm test`, `npm run build` and `npm run test:browser`; verify PNG frame loading and full-bleed mobile layout in Playwright. A real Android landscape smoke test is required to assess aspect ratio stretch, performance, thumb reach and font clarity.

No collision, wave, buff, boss or combat balance changes are included.
