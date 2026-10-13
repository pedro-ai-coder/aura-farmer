# Public repository readiness — security gate

**Status: NOT CLEARED. Keep this repository private until every gate is checked by the owner.**

The CI workflow in this PR does not publish the repository or validate its entire history.

## Before changing visibility

- [ ] Clone a fresh **mirror** to an isolated machine and scan **all Git refs and commits**, not just `main`, for credentials using a dedicated scanner (e.g. Gitleaks). Example:
  ```sh
  git clone --mirror <REPOSITORY_CLONE_URL> aura-farmer-audit.git
  gitleaks git --repo-path aura-farmer-audit.git --report-format json --report-path findings.json
  ```
  Check the installed Gitleaks version's CLI syntax before running. Do not upload findings.json to GitHub or CI artifacts.
- [ ] Review all previous GitHub Actions run logs and downloadable artifacts for secrets or personal data: they become public when visibility changes.
- [ ] Check committed source and assets for `.env`, access tokens, private keys, cloud credentials, private Vercel or GitHub configuration, personal data, unlicensed assets, and third-party code or content.
- [ ] If a secret appeared at **any point** in Git history, rotate/revoke it FIRST. Deleting the current file or rewriting history alone is not sufficient.
- [ ] Evaluate dependency vulnerabilities with `npm audit --omit=dev` and a full `npm audit`; triage findings.
- [ ] Confirm the Vercel project has no production secrets exposed to frontend build output (`VITE_*` values are public). Review preview deployments and Git integration.
- [ ] Verify license, contributions policy and ownership of game graphics/audio/names before publication.
- [ ] Back up the repository and document the approved scan results **without storing discovered secrets**.
- [ ] Ensure GitHub repository settings prevent accidental paid use: standard runners only; no larger runners; verify account Actions spending settings and storage allowances.
- [ ] Review branch protection / rulesets **after** visibility change; GitHub may disable existing push rulesets on the transition. Require PR approval and passing checks before merge if available on the plan.

## After approval

The owner changes visibility in **Settings → General → Danger Zone → Change repository visibility** only after every security check is signed off. Recheck CI and Vercel on the first public PR.

## CI design

- PRs targeting `main` and pushes to `main` run TypeScript, Vitest, build, and Chromium Playwright.
- A fast validation failure prevents installing Chromium for unnecessary tests.
- A concurrency group cancels superseded runs for the same PR/ref.
- `contents: read` and checkout without persisted credentials limit workflow access.
- Failure artifacts are retained for 3 days.
- Public GitHub-hosted **standard** runners are free for execution minutes, but storage, external services, and larger runners are not necessarily free.
- Codex Cloud usage is still bound to the user's OpenAI subscription limits and is not unlimited.

## For AI contributions

AI agents work in branches, create PRs, record commands and results, and **never auto-merge**. Never copy secrets into prompts, PR descriptions, logs or comments. Do not accept CI changes proposed from untrusted forks without explicit review. Never use `pull_request_target` to execute untrusted PR code.
