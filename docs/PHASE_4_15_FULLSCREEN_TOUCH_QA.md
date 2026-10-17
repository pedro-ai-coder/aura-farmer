# Phase 4.15 — Desktop fullscreen and mobile touch controls

## Player-reported issues

- Desktop fullscreen does not fit the arena and overlays reliably.
- Mobile floating joystick is restricted to the left side.
- Returning from pause/menu can leave fullscreen sizing or the HUD misaligned.
- Mobile should use as much screen space as possible immediately.

## Changes

- The floating movement joystick's touch surface now covers the entire game stage on coarse-pointer devices while the run is playing.
- The fullscreen game stage explicitly occupies the dynamic viewport.
- Fullscreen and visual viewport resize events realign the HUD and camera.
- Resuming a paused run requests a post-render HUD alignment.

## Browser constraints

The game already requests fullscreen from the user-initiated Play action on coarse-pointer devices. Fullscreen requests and landscape orientation locks may be denied or unsupported, especially on iOS Safari and embedded browsers. A website cannot reliably enter fullscreen real mode on initial page load without a user gesture. The normal layout should remain usable when fullscreen is unavailable.

## Required verification

- [ ] Desktop Chromium: enter/exit fullscreen, pause/resume, window resize, no black margins or HUD drift.
- [ ] Android Chrome: joystick starts from left, center and right unobstructed arena; buttons and menus remain clickable.
- [ ] iOS Safari: viewport usable without Fullscreen API; touch movement, menu/resume and orientation changes work.
- [ ] Mobile: Play requests fullscreen only where supported; orientation hint remains available otherwise.
- [ ] TypeScript, Vitest, build, Playwright and Vercel green.
- [ ] No gameplay balance or persistence changes.

Do not merge until cross-device functional checks are recorded.
