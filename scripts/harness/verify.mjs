import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export function changedFiles(cwd, base) {
  const git = (args) => execFileSync('git', args, { cwd, encoding: 'utf8' });
  const lists = [
    git(['diff', '--name-only', '-z', '--diff-filter=ACMRD']),
    git(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMRD']),
    git(['ls-files', '--others', '--exclude-standard', '-z']),
  ];
  if (base) {
    if (base.startsWith('-')) throw new Error('Base must be a Git ref, not an option');
    const sha = git(['rev-parse', '--verify', '--end-of-options', `${base}^{commit}`]).trim();
    lists.push(git(['diff', '--name-only', '-z', '--diff-filter=ACMRD', `${sha}...HEAD`]));
  }
  return [...new Set(lists.flatMap((list) => list.split('\0').filter(Boolean)))].sort();
}

export function verificationPlan(files, cwd, full = false) {
  const existing = files.filter((file) => existsSync(path.join(cwd, file)));
  const scriptChanged = files.some((file) => file.startsWith('scripts/harness/'));
  const runtime = files.some(
    (file) =>
      /^(src\/|e2e\/)|\.(?:[cm]?[jt]sx?|css)$/.test(file) && !file.startsWith('scripts/harness/'),
  );
  const dependency = files.some((file) =>
    /^(package\.json|pnpm-lock\.yaml|pnpm-workspace\.yaml)$/.test(file),
  );
  const config = files.some((file) =>
    /^(next|jest|playwright|eslint|postcss).*config\.|^tsconfig.*\.json$|^jest\.(setup|polyfills)/.test(
      file,
    ),
  );
  const plan = [];
  if (scriptChanged || full) plan.push(['node', ['--test', 'scripts/harness/verify.test.mjs']]);
  const format = existing.filter((file) => /\.(?:md|json|ya?ml|[cm]?[jt]sx?|css)$/.test(file));
  if (full) plan.push(['pnpm', ['format:check']]);
  else if (format.length)
    plan.push(['pnpm', ['exec', 'prettier', '--check', '--', ...format.map((f) => `./${f}`)]]);
  if (full || runtime || dependency || config) {
    // Preserve Next route type validation; never delete a running dev server's output.
    plan.push(['pnpm', ['typecheck']], ['pnpm', ['lint']]);
    const changedSource = existing.filter((f) => /^src\/.*\.[jt]sx?$/.test(f));
    const removedSource = files.some((f) => f.startsWith('src/') && !existsSync(path.join(cwd, f)));
    if (full || dependency || config || removedSource)
      plan.push(['pnpm', ['exec', 'jest', '--runInBand']]);
    else if (changedSource.length)
      plan.push([
        'pnpm',
        [
          'exec',
          'jest',
          '--runInBand',
          '--passWithNoTests',
          '--findRelatedTests',
          ...changedSource.map((f) => `./${f}`),
        ],
      ]);
  }
  if (full || dependency || config) plan.push(['pnpm', ['build']]);
  return plan;
}

export function stopResult(input, status, output) {
  if (input.stop_hook_active)
    return {
      code: 0,
      message: 'Verification retry already active; report unresolved checks in the handoff.',
    };
  return status === 0
    ? { code: 0, message: '' }
    : {
        code: 2,
        message: `Verification failed. Fix task-owned failures or report unrelated/environment failures; do not edit unrelated user work.\n${output.slice(-8000)}`,
      };
}

function main() {
  const args = process.argv.slice(2);
  const hook = args.includes('--stop-hook');
  const input = hook ? JSON.parse(readFileSync(0, 'utf8')) : {};
  if (hook && input.stop_hook_active) {
    console.error(stopResult(input, 0, '').message);
    return;
  }
  const cwd = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  const baseIndex = args.indexOf('--base');
  if (baseIndex >= 0 && !args[baseIndex + 1]) throw new Error('--base requires a ref');
  const files = changedFiles(cwd, baseIndex >= 0 ? args[baseIndex + 1] : undefined);
  const plan = verificationPlan(files, cwd, args.includes('--full'));
  if (args.includes('--dry-run')) {
    console.log(JSON.stringify({ files, plan }, null, 2));
    return;
  }
  let status = 0;
  let output = '';
  for (const [command, commandArgs] of plan) {
    const result = spawnSync(command, commandArgs, {
      cwd,
      encoding: 'utf8',
      timeout: hook ? 60000 : 600000,
      maxBuffer: 8 * 1024 * 1024,
      stdio: hook ? 'pipe' : 'inherit',
    });
    if (result.status !== 0) {
      status = 1;
      output = `${command} ${commandArgs.join(' ')}\n${result.error?.message ?? ''}\n${result.stdout ?? ''}\n${result.stderr ?? ''}`;
      break;
    }
  }
  if (hook) {
    const result = stopResult(input, status, output);
    if (result.message) console.error(result.message);
    process.exitCode = result.code;
  } else process.exitCode = status;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = process.argv.includes('--stop-hook') ? 2 : 1;
  }
}
