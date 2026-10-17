import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const REQUIRED = ['docs/GDD.md', 'AGENTS.md', 'docs/DEVELOPMENT_CONTEXT.md', '.github/workflows/ci.yml', 'package.json'];
const REQUIRED_SCRIPTS = ['typecheck', 'test', 'build', 'test:browser'];

function fail(message) { throw new Error(message); }

export function validatePlan(plan) {
  if (plan?.schemaVersion !== 1 || plan.sourceOfTruth !== 'docs/GDD.md') {
    fail('Checkpoint plan must use schema v1 and docs/GDD.md as source of truth.');
  }
  if (!Array.isArray(plan.checkpoints) || plan.checkpoints.length === 0) fail('Missing checkpoints.');
  const byId = new Map();
  for (const item of plan.checkpoints) {
    if (typeof item.id !== 'string' || !/^[a-z0-9-]+$/.test(item.id) || byId.has(item.id)) {
      fail('Invalid or duplicate checkpoint ID: ' + item.id);
    }
    if (typeof item.title !== 'string' || !item.title || !Array.isArray(item.dependsOn) ||
        !Array.isArray(item.acceptance) || item.acceptance.length === 0 ||
        !item.acceptance.every((a) => typeof a === 'string' && a.length > 0)) {
      fail('Invalid checkpoint fields: ' + item.id);
    }
    byId.set(item.id, item);
  }
  const active = new Set(), finished = new Set();
  function visit(id) {
    if (active.has(id)) fail('Cycle in checkpoint dependencies: ' + id);
    if (finished.has(id)) return;
    const item = byId.get(id);
    if (!item) fail('Unknown checkpoint dependency: ' + id);
    active.add(id);
    for (const dep of item.dependsOn) visit(dep);
    active.delete(id);
    finished.add(id);
  }
  for (const id of byId.keys()) visit(id);
  return true;
}

export function buildReadiness(root = REPO_ROOT) {
  const missing = REQUIRED.filter((p) => !existsSync(resolve(root, p)));
  if (missing.length) fail('Missing required repository files: ' + missing.join(', '));
  const gdd = readFileSync(resolve(root, 'docs/GDD.md'));
  const agents = readFileSync(resolve(root, 'AGENTS.md'), 'utf8');
  if (!agents.includes('docs/GDD.md') || !agents.includes('owner explicitly approves')) {
    fail('AGENTS.md GDD authority or owner approval policy changed; stop for manual review.');
  }
  const plan = JSON.parse(readFileSync(resolve(root, 'automation/poc-checkpoints.json'), 'utf8'));
  validatePlan(plan);
  const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8'));
  const ci = readFileSync(resolve(root, '.github/workflows/ci.yml'), 'utf8');
  const checks = REQUIRED_SCRIPTS.map((name) => ({
    name,
    scriptExists: typeof pkg.scripts?.[name] === 'string',
    referencedByCI: ci.includes(name === 'test' ? 'npm test' : 'npm run ' + name),
  }));
  return {
    schemaVersion: 1,
    generatedAtUtc: new Date().toISOString(),
    mode: 'READ_ONLY_NO_AI_NO_PAID_APIS',
    sourceOfTruth: { path: 'docs/GDD.md', sha256: createHash('sha256').update(gdd).digest('hex') },
    automationPrerequisitesValid: checks.every((item) => item.scriptExists && item.referencedByCI),
    automationPrerequisites: checks,
    pocAccepted: false,
    disclaimer: 'Inventory only. No tests or deployments have been run or verified by this tool. No PRs or owner approvals were checked.',
    checkpoints: plan.checkpoints.map((item) => ({
      id: item.id, title: item.title, dependsOn: item.dependsOn,
      status: 'UNVERIFIED', acceptance: item.acceptance,
    })),
    nextAction: 'Reconcile current GDD, existing PRs and verified CI/preview evidence. Obtain owner approval before merging.',
  };
}

function main(args) {
  if (args.includes('--help')) { console.log('Usage: node automation/poc-readiness.mjs [--output reports/path.json]'); return; }
  if (args.length !== 0 && (args.length !== 2 || args[0] !== '--output' || !args[1])) fail('Unknown arguments.');
  const report = buildReadiness();
  const rendered = JSON.stringify(report, null, 2) + '\n';
  if (args.length) {
    const target = resolve(REPO_ROOT, args[1]);
    const reportDir = resolve(REPO_ROOT, 'reports');
    if (!target.startsWith(reportDir + sep)) fail('Output must be inside reports/.');
    mkdirSync(dirname(target), { recursive: true });
    writeFileSync(target, rendered);
  }
  console.log(rendered);
  if (!report.automationPrerequisitesValid) process.exitCode = 1;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { main(process.argv.slice(2)); }
  catch (err) { console.error('PoC readiness failed: ' + err.message); process.exitCode = 1; }
}
