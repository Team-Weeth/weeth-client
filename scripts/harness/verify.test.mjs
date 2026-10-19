import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, mkdirSync, rmSync, unlinkSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { changedFiles, verificationPlan, stopResult, validateMetadata } from './verify.mjs';

const cli = fileURLToPath(new URL('./verify.mjs', import.meta.url));

test('malformed harness JSON fails even when format ignores the file', (t) => {
  const { cwd, write } = fixture(t);
  write('.claude/settings.json', '{');
  assert.throws(() => validateMetadata(['.claude/settings.json'], cwd), /Invalid JSON/);
  write('.claude/settings.json', '{}');
  assert.doesNotThrow(() => validateMetadata(['.claude/settings.json', '.mcp.json'], cwd));
});

test('Stop CLI reports command failure with exit 2 and handles its retry before Git access', (t) => {
  const { cwd, git, write } = fixture(t);
  write('note.md');
  git('add', 'note.md');
  git('commit', '-m', 'base');
  write('note.md', 'changed\n');
  const fakeBin = path.join(cwd, 'bin');
  mkdirSync(fakeBin);
  writeFileSync(
    path.join(fakeBin, 'pnpm'),
    '#!/bin/sh\necho fixture-verification-failed >&2\nexit 1\n',
    { mode: 0o755 },
  );
  const failure = spawnSync(process.execPath, [cli, '--stop-hook'], {
    cwd,
    encoding: 'utf8',
    input: '{}',
    env: { ...process.env, PATH: `${fakeBin}:${process.env.PATH}` },
  });
  assert.equal(failure.status, 2);
  assert.match(failure.stderr, /fixture-verification-failed/);
  const retry = spawnSync(process.execPath, [cli, '--stop-hook'], {
    cwd: os.tmpdir(),
    encoding: 'utf8',
    input: '{"stop_hook_active":true}',
  });
  assert.equal(retry.status, 0);
  const malformed = spawnSync(process.execPath, [cli, '--stop-hook'], {
    cwd,
    encoding: 'utf8',
    input: '{',
  });
  assert.equal(malformed.status, 2);
});

function fixture(t) {
  const cwd = mkdtempSync(path.join(os.tmpdir(), 'weeth-verify-'));
  t.after(() => rmSync(cwd, { recursive: true, force: true }));
  const git = (...args) => execFileSync('git', args, { cwd, stdio: 'pipe' }).toString().trim();
  git('init');
  git('config', 'user.email', 'test@example.invalid');
  git('config', 'user.name', 'Harness Test');
  const write = (name, value = 'text\n') => {
    mkdirSync(path.dirname(path.join(cwd, name)), { recursive: true });
    writeFileSync(path.join(cwd, name), value);
  };
  return { cwd, git, write };
}

test('collects branch, staged, unstaged, untracked, renamed and deleted paths without splitting names', (t) => {
  const { cwd, git, write } = fixture(t);
  for (const f of ['old.ts', 'deleted.ts', 'unstaged.ts', 'staged.ts']) write(f);
  git('add', '.');
  git('commit', '-m', 'base');
  const base = git('rev-parse', 'HEAD');
  write('committed.ts');
  git('add', 'committed.ts');
  git('commit', '-m', 'change');
  git('mv', 'old.ts', 'renamed space.ts');
  unlinkSync(path.join(cwd, 'deleted.ts'));
  write('staged.ts', 'staged\n');
  git('add', 'staged.ts');
  write('unstaged.ts', 'unstaged\n');
  write('한국어 space.ts');
  write('line\nbreak.ts');
  const files = changedFiles(cwd, base);
  for (const f of [
    'committed.ts',
    'deleted.ts',
    'staged.ts',
    'unstaged.ts',
    'renamed space.ts',
    '한국어 space.ts',
    'line\nbreak.ts',
  ])
    assert.ok(files.includes(f), f);
  assert.equal(files.length, new Set(files).size);
  assert.throws(() => changedFiles(cwd, 'missing-ref'));
  assert.throws(() => changedFiles(cwd, '--help'));
});

test('docs-only checks do not run application tests or build', (t) => {
  const { cwd, write } = fixture(t);
  write('note.md');
  const plan = verificationPlan(['note.md'], cwd);
  assert.deepEqual(plan, [['pnpm', ['exec', 'prettier', '--check', '--', './note.md']]]);
  assert.deepEqual(verificationPlan([], cwd), []);
});

test('source edits select related tests and deleted source selects all tests', (t) => {
  const { cwd, write } = fixture(t);
  write('src/example.ts');
  const commands = verificationPlan(['src/example.ts'], cwd);
  assert.ok(commands.some(([, args]) => args.includes('--findRelatedTests')));
  assert.ok(!commands.some(([, args]) => args.includes('build')));
  const deleted = verificationPlan(['src/deleted.ts'], cwd);
  assert.ok(
    deleted.some(([, args]) => args.includes('jest') && !args.includes('--findRelatedTests')),
  );
});

test('dependency/config and full verification include a build', (t) => {
  const { cwd } = fixture(t);
  for (const file of ['package.json', 'pnpm-lock.yaml', 'next.config.ts']) {
    assert.ok(verificationPlan([file], cwd).some(([, args]) => args.includes('build')));
  }
  assert.ok(verificationPlan([], cwd, true).some(([, args]) => args.includes('build')));
});

test('Stop failures block once, preserve diagnostics, and cannot cause an infinite retry loop', () => {
  assert.equal(stopResult({}, 0, '').code, 0);
  const failed = stopResult({}, 1, 'type failure');
  assert.equal(failed.code, 2);
  assert.match(failed.message, /type failure/);
  assert.equal(stopResult({ stop_hook_active: true }, 1, 'failure').code, 0);
});
