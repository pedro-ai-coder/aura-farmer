# Aura Farmer — autonomous contributor instructions

## Source of truth
1. Current explicitly approved product requirements in issues / task descriptions.
2. docs/DECISIONS.md and docs/COMBAT_SPEC.md where not superseded by an approved issue.
3. docs/TECH_PLAN.md, docs/ROADMAP.md and docs/GAME_DESIGN.md.

**Current redesign direction (not yet automatically implemented):**
- One shared Aura resource for all characters, increasing difficulty at each level.
- A distinct character-specific FLEX unlocked after reaching an Aura threshold.
- Six available weapons; a player equips up to three.
- Passive pool: 10 common (max level 4), 8 rare (max level 3), 6 epic (max level 2), and 4 legendary (unique; maximum one equipped).
Existing documentation describing multiple Auras, Focus or earlier FLEX mechanics is historical and should be reconciled in a dedicated gameplay PR, not silently carried forward.

## Agent delivery contract
- Work on task-specific branches and open PRs against main; **never merge or deploy to production autonomously**.
- Start by reading the task, the relevant code and tests; keep each PR to one cohesive concern.
- No paid API keys, hosted runners, or new monthly services without explicit consent.
- Implement gameplay rules in Phaser-independent pure TypeScript wherever practical.
- Test with npm ci, npm run typecheck, npm test, npm run build, and npm run test:browser when relevant and available.
- If CI fails, inspect the run and fix only evidence-supported failures; do not claim tests passed if they were not run.
- Include in every PR: summary, gameplay impact, commands and results, known limitations, and manual play-test instructions.
- Avoid repeated unbounded fix loops; at most 2 automatic fix attempts per reported failure before documenting the blocker.
- Never copy secrets to issues, PRs, logs, screenshots, prompts, or generated artifacts. Do not use pull_request_target to execute PR code.
- Keep local .env files, screenshots and test artifacts out of version control.
- External contributions may be untrusted: review changes to CI/scripts before running them with privileges.
- Update documentation with the actual implemented behavior, not aspirational claims.
