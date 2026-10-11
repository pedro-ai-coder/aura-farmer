# Responsive Mobile Menu Fix — October 2026

Real-device Brave screenshots show the in-game immersive HUD is improved but **the pre-game and character menus are clipped**. Landscape outside fullscreen also places MENU on top of FLEX.

## Goal
- All home actions visible in portrait, including FULL SCREEN.
- CHOOSE YOUR FARMER in 2-column portrait and compact 3-column/2-row landscape layouts.
- START RUN, BACK and FULL SCREEN remain usable without scrolling a long character sheet.
- Front menus are dedicated screens: hide the gameplay canvas/controls behind them instead of stacking the menu on top of the arena and virtual joystick.
- Pause and results retain the game behind a dim overlay; these are not front menus.
- In-game non-fullscreen landscape MENU occupies unused space at the top of the right control rail, not the FLEX area.
- Maintain 44px-class tap targets where space allows; compact 38px menu rail buttons on low-height landscape screens, with visible focus state.

## Technical notes
- GameShell sets `is-front-menu`, `is-menu-open` and `data-screen` from one screen state; no duplicated menu state or gameplay reinitialisation.
- CSS relies on `dvh` and stage-size constraints for landscape and portrait. Gameplay canvas is only hidden for front-menu modes; it is still mounted and retains its frame/input system.
- No changes to play logic, achievements, save schema, character roster, sprites or backend.
- Automated Chromium screenshots + geometry checks: 390×844 portrait and 844×390 landscape, menu selection, fullscreen CTA visibility, and MENU/FLEX/FOCUS disjoint rectangles.
- Browser toolbars/Android status bar and native fullscreen exit notifications are controlled by the user's browser and OS, not by the game; do not confuse their system overlays with the game's UI.

## QA gate
CI: typecheck, Vitest, build, all Playwright. Manual Brave/Android test, portrait/landscape and fullscreen fallback, before considering the mobile UX polished.
