# Aura Farmer

Solo browser survival game built with TypeScript, Phaser and Vite.

The [GDD](docs/GDD.md) is the sole product specification. The browser slice implements Ruin Alley, Sigma / Cool Kid / Alpha, nine compatible weapons, 23 passives, five three-minute waves and Big Hater. This is not the complete PvE, multiplayer or Discord release. Implementation limits are recorded in the GDD.

## Play and develop

WASD / arrows move; weapons fire automatically. M switches mouse / auto aim, E activates a charged Flex, Esc pauses, B opens the build. Select a card, then confirm. Browser progress stays on this device; v1 saves are preserved by the v2 migration. Desktop keyboard and mouse are the tested target; mobile and Discord need separate validation.

Use the Node version in `.nvmrc`. Run `npm ci`, then `npm run dev`.

Validation: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`. Install Chromium with `npx playwright install chromium` or set `CHROMIUM_PATH`.

## Code and artwork

- `src/game/catalog`: shared typed content and numeric rules.
- `src/game/simulation`: seeded, pausable game state independent of Phaser.
- `src/browser`: input, UI, Phaser presentation, sound and versioned persistence.
- `public/assets/cartoon/option-a-v1`: preserved approved PNG masters and gallery.
- `public/assets/runtime`: runtime pose sheets and enemy family sheet.

Contributor workflow: [AGENTS.md](AGENTS.md). No paid services or launch publicity are part of this work.
