# Aura Farmer — contributor instructions

`docs/GDD.md` is the sole product, gameplay and visual specification. Read it before changing behavior. Do not infer requirements from old commits, removed documentation or historical PRs. Update the GDD when the owner approves a design change.

This file contains operational instructions only:
- Work on a task branch and open a PR. The owner has authorized merge and production deployment after validation without further approval; respect any later hold on a specific PR.
- Preserve saves and character IDs, with explicit versioned migrations where required.
- Keep simulation independent of Phaser and share catalog rules with the UI.
- Use no paid services without approval. Never expose secrets or enable privileged CI for untrusted PR code.
- Validate with `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run test:browser` for runtime changes. Fix failures before declaring ready; report blocked or unrun checks accurately.
- PRs describe changes, actual validation, limitations and manual checks. Do not claim the full GDD is implemented just because tests pass.
