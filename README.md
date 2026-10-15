# Aura Farmer

Browser survival game built with TypeScript, Phaser and Vite.

## Product specification

[GDD](docs/GDD.md) is the sole source of truth for rules, scope and visual direction. It includes the approved Cartoon Arcade art and the refactor plan. The current runtime is being migrated to that specification; the GDD is not a claim of implementation completeness.

Approved static masters: [asset gallery](public/assets/cartoon/option-a-v1/index.html). Assets still used by the current runtime remain until their replacements are integrated; unused historical variants are removed.

## Development

Use the Node version in `.nvmrc`. Run `npm ci`, then `npm run dev`.

Validation: `npm run typecheck`, `npm test`, `npm run build`, `npm run test:browser`. For browser tests install Chromium with `npx playwright install chromium` (or set `CHROMIUM_PATH`).

Contributor workflow: [AGENTS.md](AGENTS.md). No automatic production merge or deployment is authorized by these instructions.
