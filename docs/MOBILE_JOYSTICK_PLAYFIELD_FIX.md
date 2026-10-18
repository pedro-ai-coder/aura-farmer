# Mobile joystick: limit movement touch input to the visible arena

## Reported bug

On a mobile landscape screenshot, the arena artwork occupied only part of the screen. The floating joystick nevertheless appeared in the **empty navy-blue background**, and another screenshot showed it on top of the **pause/menu button**. This was a functional input bug, not a request to expand the accepted gameplay catalog.

## Cause

The last mobile CSS override set `#touch-zone` to `inset:0;width:100%;height:100%`, covering the entire `#app` regardless of the camera's rendered world or letterboxing. Its z-index (3) was above the HUD (2), allowing a pointer to be captured ahead of UI actions. Previous left-side-only touch limits should **not** be reintroduced: the user wants touch movement from any available part of the actual game area.

## Implementation

- Calculate the bounding rectangle for the *visible intersection* of the 1448×1086 world image, the Phaser canvas, and the current camera world viewport, with coordinates relative to `#app`.
- Align `#touch-zone` to that rectangle rather than the browser window or full Phaser background.
- Recalculate when fullscreen, orientation, canvas size, or mobile landscape camera position changes.
- Keep the HUD above the movement capture layer, and explicitly reject input over top/bottom HUD and boss bars.
- Clamp joystick artwork inside the visible playfield while continuing to calculate direction from the finger's real touch origin.
- Preserve on-screen full-playfield input (not just the left side), pointer capture during movement, and pause/upgrade controls.

## Acceptance

- [ ] The joystick starts and moves anywhere **inside** the visible arena that is not covered by an interactive HUD/menu.
- [ ] Taps on the empty navy-blue area beside the world produce **no movement or joystick**.
- [ ] Menu and HUD actions work normally and are never covered by touch controls.
- [ ] Pause, resume, fullscreen/orientation changes and mobile viewport resize do not leave a joystick behind.
- [ ] Chromium mobile viewport/browser touch tests and world-projection unit tests pass.
- [ ] TypeScript, all Vitest, production build, full Playwright suite, secret audit, and Vercel preview green on final commit.
- [ ] Owner validates on the original mobile device and explicitly approves the PR before merge.

No server, login, persistence, payment, new mechanics, or balance value changes. This is a targeted mobile input bug fix and is intentionally separated from open boss-validation PR #87.
