# Development context — concise handoff

## Source of truth
- `docs/GDD.md`: authoritative game design and scope. Read it before changing gameplay.
- `AGENTS.md`: operational workflow and resource-efficiency rules.
- `docs/ASSET_POLICY.md`: asset reuse and graphics approvals.

## Current repository architecture
- TypeScript + Phaser + Vite; Vitest and Playwright for tests.
- `src/game/catalog`: typed content and numeric rules.
- `src/game/simulation`: simulation separate from Phaser.
- `src/browser`: presentation, inputs, audio and persistence.
- `public/assets/cartoon/option-a-v1`: approved art masters.
- `public/assets/runtime`: runtime sprite sheets.

## Safe workflow
1. Inspect the current main branch and open PRs before creating a task branch. Never overwrite concurrent changes.
2. Define a narrow scope and acceptance criteria; one iteration equals one PR.
3. Make the smallest compatible change. Keep saves and IDs stable.
4. Run `npm ci`, `npm run validate:local`, and inspect the generated report. Browser tests need installed Chromium.
5. Fix failures, rerun affected checks and then the full suite. Record exact HEAD and counts; do not invent validation results.
6. Request owner approval before merge. No automatic image generation and no paid CI.

## Update protocol
Update this document only with confirmed repository facts. Do not use it to override `docs/GDD.md`. Record active work and blockers in the PR description rather than claiming historical tasks are complete.
