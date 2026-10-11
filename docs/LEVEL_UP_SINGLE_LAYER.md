# Level Up overlay redesign — single source of truth

## User evidence
Brave/Android full-screen horizontal screenshots show a large Phaser LEVEL UP modal occupying most of the arena **while three duplicate HTML upgrade buttons float on the right**. MENU remains visible, even though the arena is already paused.

## Implemented
- One accessible HTML modal, with three rich buff cards carrying name, rarity, stack and description, on top of a dimmed arena.
- Phaser only renders the HUD/combat, **no second upgrade modal or duplicate upgrade text**.
- Joystick, FLEX, FOCUS, fullscreen button and MENU are hidden while choosing buffs.
- On Android landscape three side-by-side cards; in portrait three stacked cards, with scrolling in very small screens.
- Desktop retains keyboard 1/2/3 to pick cards, and adds optional click selection.
- Existing Arena upgrade logic, clock pause, buff definitions and saved data remain unchanged.
- All DOM labels are created with textContent rather than dynamic HTML injection.
- Playwright validates layout geometry, hides input controls, proves no duplicate Phaser choice text and checks that selecting a buff resumes the run.

## Not controlled by the game
The black Brave/Android fullscreen exit message is a temporary native browser/system prompt. It can appear on screenshots after entering fullscreen and does not originate in the Phaser or HTML upgrade layers.

## Release
Require full TypeScript, unit tests, production build, Playwright and Game Director's Android visual feedback before marking mobile UI final.
