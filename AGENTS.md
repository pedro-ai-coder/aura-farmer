# Aura Farmer — contributor instructions

`docs/GDD.md` is the sole product, gameplay and visual specification. Read it before changing behavior. Do not infer requirements from old commits, removed documentation or historical PRs. Update the GDD when the owner approves a design change.

This file contains operational instructions only:
- Work on a task branch and open a PR. Each iteration has its own clearly identified PR. Merge only after the owner explicitly approves that PR, even when every check passes.
- Preserve saves and character IDs, with explicit versioned migrations where required.
- Keep simulation independent of Phaser and share catalog rules with the UI.
- Use no paid services without approval. Never expose secrets or enable privileged CI for untrusted PR code.
- Validate with `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:browser` for runtime changes. Fix failures before declaring ready; report blocked or unrun checks accurately.
- PRs describe changes, actual validation, limitations and manual checks. Do not claim the full GDD is implemented just because tests pass.

## Resource-efficient development

- One scoped iteration per PR. Before editing, read the GDD and only the files relevant to the task. Keep a short handoff in `docs/DEVELOPMENT_CONTEXT.md` instead of repeatedly exploring the entire repository.
- Do not generate images during functional PRs. Reuse approved assets first, then existing runtime assets, then simple placeholders. Request explicit owner approval before any new image generation. Keep graphical iterations separate.
- Consult `docs/ASSET_POLICY.md` and generate the local asset inventory with `npm run assets:inventory` before proposing new artwork. The generated inventory is an inspection report, not an authorization to delete or replace assets.
- Prefer deterministic local commands to agent-driven test loops. Use `npm run validate:local` for a single reproducible run and inspect saved logs only on failure. Do not repeatedly rerun successful suites without a change that warrants it.
- Never skip required checks or declare a PR ready while checks fail. When local execution is unavailable, report the blocker and leave the PR as draft for later validation.
- Do not install paid services, enable billable CI, change gameplay, or alter assets as part of efficiency-only PRs.
