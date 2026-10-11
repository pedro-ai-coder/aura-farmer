# Mobile HUD & Touch Overlay — Layout Fix

**Reason:** real Android landscape screenshot shows **EXIT overlapping WAVE**, the independent **MENU** button intruding into the HUD, and oversized FLEX/FOCUS/joystick touch surfaces obscuring the arena.

## Mobile fullscreen rules

- **One navigation entry during a run:** MENU, placed top-right *below the Phaser HUD*.
- **No persistent EXIT button in the HUD:** the underlying fullscreen-toggle is visually hidden in immersive mode. Open MENU → **EXIT FULL SCREEN** to leave fullscreen without discarding the run. Browser/system exit is still supported.
- **Compact thumb controls:** joystick anchored to the bottom-left, FLEX/FOCUS stacked at bottom-right with at least 44px CSS tap targets and safe-area insets; none may overlap the HUD.
- **Menu overlays are modal:** while HOME/PAUSE/RESULTS is open, joystick/action/upgrade HTML controls are hidden and non-interactive, and the Phaser introduction/result modal is suppressed. Pause stops simulation as before.
- **Home menu fullscreen button:** displays the correct FULL SCREEN / EXIT FULL SCREEN text as the state changes.
- No impact on Phaser 960×600 logical coordinates, game state, controls, combat, characters or the existing local save.

## Acceptance tests

- Android 844×390 viewport: fullscreen CSS fallback has one visible MENU, toggle hidden and accessible through pause, menu never overlaps the HUD and remains above compact right actions.
- Joystick max 125px; right actions max 155px width, both safely within viewport and clickable.
- ENTER FULLSCREEN from the old button outside immersive still works; on pause EXIT FULL SCREEN works; RESUME preserves the active run.
- MENU overlay hides on-canvas gameplay touch controls and the duplicate legacy Phaser modal.
- Portrait and desktop tests stay green; real-device screenshot review for ultrawide screen.

**Next:** after passing CI, publish to production and request updated real Android screenshot to verify the overlap visually.
