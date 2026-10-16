# Vitest security upgrade validation

This PR targets the three advisories reported by the owner's local `npm audit`: one moderate advisory in `@vitest/mocker` and two critical advisories in `tinypool`. The audit recommended Vitest 5.0.5, a potentially breaking major upgrade.

## Required before approval

On a clean checkout of this PR branch, using Node.js >=20.19:

```powershell
npm install
npm audit
npx playwright install chromium
npm run validate:local
```

Commit the resulting `package-lock.json` to **this branch** before running the final `npm ci` and validation. Do not use `npm audit fix --force`. If test failures occur, adjust test code only as needed for Vitest 5 compatibility and revalidate.

The PR is **not ready** while the lockfile is inconsistent with `package.json`, audit advisories remain unresolved, or any validation check fails. Keep the scope limited to test tooling and security. No graphics or gameplay changes.
