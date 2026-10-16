import { spawnSync } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = process.cwd();
const dir = join(root, 'reports', 'validation');
mkdirSync(dir, { recursive: true });
const head = spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' });
const commit = head.status === 0 ? head.stdout.trim() : 'unknown';
const checks = [
  ['typecheck', ['run', 'typecheck']],
  ['unit', ['test', '--', '--reporter=default']],
  ['build', ['run', 'build']],
  ['browser', ['run', 'test:browser']],
];
const results = [];
for (const [name, args] of checks) {
  const started = Date.now();
  // On Windows npm.cmd is a batch script: spawnSync without a shell fails with EINVAL.
  // Use the command shell only on Windows; pass a fixed, internal command list.
  const command = process.platform === 'win32' ? process.env.ComSpec || 'cmd.exe' : 'npm';
  const commandArgs = process.platform === 'win32'
    ? ['/d', '/s', '/c', ['npm', ...args].join(' ')]
    : args;
  const run = spawnSync(command, commandArgs, { cwd: root, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024, timeout: 15 * 60 * 1000 });
  const output = [run.stdout ?? '', run.stderr ?? '', run.error ? String(run.error) : ''].filter(Boolean).join('\n');
  writeFileSync(join(dir, `${name}.log`), output);
  results.push({ name, passed: run.status === 0, exitCode: run.status, signal: run.signal, spawnError: run.error ? String(run.error) : null, durationSeconds: Math.round((Date.now() - started) / 1000), log: `reports/validation/${name}.log` });
  console.log(`${name}: ${run.status === 0 ? 'PASS' : 'FAIL'}`);
}
const report = { commit, generatedAt: new Date().toISOString(), passed: results.every(r => r.passed), checks: results };
writeFileSync(join(dir, 'summary.json'), JSON.stringify(report, null, 2) + '\n');
console.log(`HEAD: ${commit}\nReport: reports/validation/summary.json`);
if (!report.passed) process.exitCode = 1;
