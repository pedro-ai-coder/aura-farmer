# Aura Farmer — PoC orchestration: Stage 0 (safe infrastructure)

## Authority, scope and invariants

- Sole authoritative product, gameplay and visual specification: docs/GDD.md. This document and the checkpoint plan DO NOT change the GDD.
- Agent operational instructions: AGENTS.md. One narrowly scoped branch and Pull Request per iteration. Every merge requires the owner's explicit approval, even if CI and preview checks succeed.
- Handoff context: docs/DEVELOPMENT_CONTEXT.md.
- Assets: docs/ASSET_POLICY.md. Do not generate new images or replace approved art without explicit owner approval.
- Project writing and code follow the English-language policy in docs/ENGLISH_AND_FULL_RUN_QA.md.
- Near-term scope: first solo desktop/mobile browser test build, three heroes, GDD-approved gameplay. Not the full PvE, multiplayer, Discord, backend or monetization roadmap.

## Exactly what this PR delivers

Stage 0 is **read-only readiness infrastructure**, not an autonomous programming agent.

- automation/poc-checkpoints.json: six evidence checkpoints for the browser PoC. It does not claim any task is completed and does not override the GDD.
- automation/poc-readiness.mjs: dependency-graph checks, canonical GDD SHA-256 identification, checks that existing npm scripts are wired in CI, and a JSON readiness inventory. Outputs every milestone as UNVERIFIED.
- automation/poc-readiness.test.mjs: native Node tests for malformed dependency graphs, missing source of truth and no false completion claims.
- .github/workflows/poc-readiness.yml: **manual workflow_dispatch only**, read-only GitHub token permissions, no secrets, no OpenAI/Codex calls, no billable APIs, no git writes, no deployments and no automatic triggers.

The report states explicitly that **no tests, GitHub statuses, Vercel deployments or owner approvals were verified by this tool**. A successfully generated inventory is not an accepted PoC.

## Local commands

Use Node version from .nvmrc.

    node --test automation/poc-readiness.test.mjs
    node automation/poc-readiness.mjs
    node automation/poc-readiness.mjs --output reports/automation/poc-readiness.json

The output file is a local artifact, not a source of truth and not an authorization to merge anything.

## Optional manual GitHub execution (after merge and owner choice)

In Actions, select **PoC readiness inventory (manual, read-only)** and choose **Run workflow**. The run validates the guardrails, creates an inventory, and uploads a JSON artifact retained for three days. Because it has only workflow_dispatch, it will not run on a push, pull request, schedule or merge.

The existing workflows remain the actual technical validation:
- .github/workflows/ci.yml: TypeScript, Vitest, Vite production build and Playwright; this PR adds a native Node guardrail-test step and read-only GDD inventory check to the existing PR CI job.
- .github/workflows/secrets.yml: secret exposure scan.
- scripts/validate-local.mjs: repeatable validation for scoped work.

GitHub commit statuses already reference Vercel. Verify the existing project's preview rather than creating another project solely because the Vercel connector cannot enumerate the Vercel team.

## Stage 1 — Candidate for a future, separately authorized PR

Add a **read-only GitHub coordinator** that associates task issues, exact-SHA completed CI jobs, Vercel preview evidence, PR review state and unresolved blockers. The coordinator must not infer human approval from green CI; a comment, PR description, status indicator or milestone file alone is not owner approval. It should not overwrite concurrent or draft PR work.

## Stage 2 — Optional coding agent (NOT implemented or enabled)

Only after explicit authorization of a coding provider, credential mechanism, spending ceiling and additional permission review, add an opt-in runner with:
- one scoped issue and branch per execution;
- GDD SHA/version captured in every run;
- isolation from untrusted PR code and protections for tokens/secrets;
- bounded attempts, time and spend; fail/stop rather than retry forever;
- draft PR output, with actual test logs and known gaps;
- no gameplay/visual specification changes without owner decision;
- no automatic images, auto-merge, publishing or production deployment.

Do not insert placeholder API keys or silently activate a provider. GitHub-hosted build execution and AI API usage have different billing models.

## Stage 3 — Controlled continuation (NOT implemented or enabled)

A later stateful coordinator may select the next eligible task only when all predecessor evidence is complete, the relevant PR has been explicitly accepted/merged by the owner and any device/playtest gates are recorded. It stops if tests fail repeatedly, the GDD is ambiguous, a payment or asset approval is required, or the human decision gate is reached.

## Acceptance checklist for every scoped PR

1. Record exact GDD revision and linked requirements.
2. Record PR URL, final commit SHA, TypeScript/Vitest/build/Playwright results and security scanning.
3. For gameplay balance, provide reproducible full-run results with genuine enemy damage. Short deterministic tests do not substitute for a complete session.
4. For mobile, record real Android/iOS device evidence. Chromium emulation alone is insufficient.
5. For publishing, load and actually play the exact Vercel preview; READY alone does not prove usability.
6. Obtain owner approval **before** any merge; PoC-wide final acceptance is a separate explicit decision.

## Safety of this stage

This change does not touch game source, GDD, assets or deployment configuration. Existing CI triggers are preserved; only two read-only orchestration validation steps are added to the existing CI job. It never calls external AI APIs. The new workflow runs only if a person manually starts it, and only after the workflow is present on the appropriate branch in GitHub Actions. It cannot autonomously develop the game. That ability requires later reviewable infrastructure and explicit approval.
