import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { test } from 'node:test';
import { buildReadiness, validatePlan } from './poc-readiness.mjs';

const fixturePlan = () => ({
  schemaVersion: 1, sourceOfTruth: 'docs/GDD.md',
  checkpoints: [
    { id: 'first', title: 'First', dependsOn: [], acceptance: ['Evidence'] },
    { id: 'second', title: 'Second', dependsOn: ['first'], acceptance: ['Evidence'] },
  ],
});

test('plan rejects duplicate IDs, unresolved dependencies and cycles', () => {
  assert.equal(validatePlan(fixturePlan()), true);
  const duplicate = fixturePlan(); duplicate.checkpoints[1].id = 'first';
  assert.throws(() => validatePlan(duplicate), /duplicate/);
  const unknown = fixturePlan(); unknown.checkpoints[1].dependsOn = ['missing'];
  assert.throws(() => validatePlan(unknown), /Unknown checkpoint dependency/);
  const cycle = fixturePlan(); cycle.checkpoints[0].dependsOn = ['second'];
  assert.throws(() => validatePlan(cycle), /Cycle/);
});

test('missing canonical GDD fails closed', () => {
  const root = mkdtempSync(join(tmpdir(), 'aura-poc-no-gdd-'));
  try { assert.throws(() => buildReadiness(root), /Missing required repository files/); }
  finally { rmSync(root, { recursive: true, force: true }); }
});

test('inventory never claims a PoC is accepted without evidence and owner approval', () => {
  const root = mkdtempSync(join(tmpdir(), 'aura-poc-'));
  const fixtures = {
    'docs/GDD.md': '# Canonical specification\n',
    'AGENTS.md': 'Read docs/GDD.md. Merge only after the owner explicitly approves the PR.\n',
    'docs/DEVELOPMENT_CONTEXT.md': '# Handoff\n',
    '.github/workflows/ci.yml': 'npm run typecheck\nnpm test\nnpm run build\nnpm run test:browser\n',
    'package.json': JSON.stringify({ scripts: {
      typecheck: 'tsc', test: 'vitest', build: 'vite', 'test:browser': 'playwright',
    } }),
    'automation/poc-checkpoints.json': JSON.stringify(fixturePlan()),
  };
  try {
    for (const [name, value] of Object.entries(fixtures)) {
      const path = join(root, name);
      mkdirSync(dirname(path), { recursive: true });
      writeFileSync(path, value);
    }
    const report = buildReadiness(root);
    assert.equal(report.automationPrerequisitesValid, true);
    assert.equal(report.pocAccepted, false);
    assert.match(report.sourceOfTruth.sha256, /^[a-f0-9]{64}$/);
    assert.ok(report.checkpoints.every((c) => c.status === 'UNVERIFIED'));
  } finally { rmSync(root, { recursive: true, force: true }); }
});
