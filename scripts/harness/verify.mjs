import { createHash } from 'node:crypto';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, readFileSync, realpathSync, writeFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const FORMATTABLE = /\.(?:md|json|ya?ml|[cm]?[jt]sx?|css)$/;
const LINTABLE = /\.[cm]?[jt]sx?$/;
const SECRET_NAME = /token|secret|password|api[_-]?key|authorization|headers/i;
const ENV_REFERENCE = /^\$\{[A-Za-z_][A-Za-z0-9_]*(?::-[^}]*)?\}$/;

export function changedFiles(cwd, base) {
  const git = (args) =>
    execFileSync('git', args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
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

// The shared .mcp.json used to be gitignored with personal tokens in it; reject inline credentials.
export function findInlineSecrets(config) {
  const found = [];
  for (const [name, server] of Object.entries(config?.mcpServers ?? {})) {
    for (const [key, value] of Object.entries({ ...server?.env, ...server?.headers })) {
      if (SECRET_NAME.test(key) && typeof value === 'string' && value && !ENV_REFERENCE.test(value))
        found.push(`${name}.${key}`);
    }
    for (const arg of server?.args ?? []) {
      const [flag, value] = String(arg).split(/=(.*)/s);
      if (flag.startsWith('--') && SECRET_NAME.test(flag) && value && !ENV_REFERENCE.test(value))
        found.push(`${name}.${flag}`);
    }
  }
  return found;
}

export function validateMetadata(files, cwd) {
  for (const file of files) {
    if (!['.claude/settings.json', '.mcp.json', 'package.json'].includes(file)) continue;
    if (!existsSync(path.join(cwd, file))) continue;
    let config;
    try {
      config = JSON.parse(readFileSync(path.join(cwd, file), 'utf8'));
    } catch {
      throw new Error(`Invalid JSON: ${file}`);
    }
    const secrets = file === '.mcp.json' ? findInlineSecrets(config) : [];
    if (secrets.length)
      throw new Error(
        `Inline credential in ${file}: ${secrets.join(', ')}. Use \${VAR} or Claude local/user scope.`,
      );
  }
}

function fingerprint(cwd, file) {
  const fullPath = path.join(cwd, file);
  if (!existsSync(fullPath)) return 'deleted';
  try {
    return createHash('sha1').update(readFileSync(fullPath)).digest('hex');
  } catch {
    return 'unreadable';
  }
}

export function snapshot(cwd, files) {
  return Object.fromEntries(files.map((file) => [file, fingerprint(cwd, file)]));
}

// Files whose content changed since the turn started, so pre-existing user WIP is not re-verified.
export function turnChanges(cwd, files, baseline) {
  return files.filter((file) => baseline[file] !== fingerprint(cwd, file));
}

export function statePath(sessionId) {
  if (typeof sessionId !== 'string' || !/^[\w-]{1,128}$/.test(sessionId)) return undefined;
  return path.join(os.tmpdir(), 'weeth-claude-harness', `${sessionId}.json`);
}

function saveBaseline(sessionId, cwd, files) {
  const file = statePath(sessionId);
  if (!file) return;
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, JSON.stringify({ cwd, files: snapshot(cwd, files) }));
}

function loadBaseline(sessionId, cwd) {
  const file = statePath(sessionId);
  if (!file || !existsSync(file)) return undefined;
  try {
    const state = JSON.parse(readFileSync(file, 'utf8'));
    return state.cwd === cwd ? state.files : undefined;
  } catch {
    return undefined;
  }
}

export function formatTarget(input, cwd) {
  const filePath = input?.tool_input?.file_path;
  if (typeof filePath !== 'string' || !existsSync(filePath)) return undefined;
  const relative = path.relative(realpathSync(cwd), realpathSync(filePath));
  if (!relative || relative.startsWith('..') || path.isAbsolute(relative)) return undefined;
  return FORMATTABLE.test(relative) ? relative : undefined;
}

export function verificationPlan(files, cwd, { full = false, hook = false } = {}) {
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
  // The Stop hook runs at every turn end with a 60s command limit; whole-suite checks belong to
  // `verify:changed --base` and CI.
  const wide = full || (!hook && (dependency || config));
  const plan = [];
  if (scriptChanged || full) plan.push(['node', ['--test', 'scripts/harness/verify.test.mjs']]);
  const format = existing.filter((file) => FORMATTABLE.test(file));
  if (full) plan.push(['pnpm', ['format:check']]);
  else if (format.length)
    plan.push(['pnpm', ['exec', 'prettier', '--check', '--', ...format.map((f) => `./${f}`)]]);
  if (full || runtime || dependency || config) {
    // Preserve Next route type validation; never delete a running dev server's output.
    plan.push(['pnpm', ['typecheck']]);
    const lintable = existing.filter((f) => LINTABLE.test(f));
    if (wide) plan.push(['pnpm', ['lint']]);
    else if (lintable.length)
      plan.push([
        'pnpm',
        ['exec', 'eslint', '--no-warn-ignored', '--', ...lintable.map((f) => `./${f}`)],
      ]);
    const changedSource = existing.filter((f) => /^src\/.*\.[jt]sx?$/.test(f));
    const removedSource = files.some((f) => f.startsWith('src/') && !existsSync(path.join(cwd, f)));
    if (wide || (!hook && removedSource)) plan.push(['pnpm', ['exec', 'jest', '--runInBand']]);
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
  if (wide) plan.push(['pnpm', ['build']]);
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

function formatEdited(input, cwd) {
  const target = formatTarget(input, cwd);
  if (!target) return;
  // Respects .prettierignore; formatting is best-effort and never blocks the edit.
  const result = spawnSync('pnpm', ['exec', 'prettier', '--write', '--', `./${target}`], {
    cwd,
    encoding: 'utf8',
    timeout: 30000,
  });
  if (result.status !== 0) console.error(`prettier skipped: ${target}`);
}

function main() {
  const args = process.argv.slice(2);
  const hook = args.includes('--stop-hook');
  const hookInput = hook || args.includes('--snapshot') || args.includes('--format-edited');
  const input = hookInput ? JSON.parse(readFileSync(0, 'utf8')) : {};
  if (hook && input.stop_hook_active) {
    console.error(stopResult(input, 0, '').message);
    return;
  }
  const cwd = execFileSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' }).trim();
  if (args.includes('--snapshot')) return saveBaseline(input.session_id, cwd, changedFiles(cwd));
  if (args.includes('--format-edited')) return formatEdited(input, cwd);
  const baseIndex = args.indexOf('--base');
  if (baseIndex >= 0 && !args[baseIndex + 1]) throw new Error('--base requires a ref');
  let files = changedFiles(cwd, baseIndex >= 0 ? args[baseIndex + 1] : undefined);
  if (hook) {
    // Without a turn baseline (e.g. the prompt hook failed), fall back to every working-tree change.
    const baseline = loadBaseline(input.session_id, cwd);
    if (baseline) files = turnChanges(cwd, files, baseline);
  }
  const full = args.includes('--full');
  const plan = verificationPlan(files, cwd, { full, hook });
  if (args.includes('--dry-run')) {
    console.log(JSON.stringify({ files, plan }, null, 2));
    return;
  }
  // These files can be excluded by .prettierignore; still reject malformed settings.
  validateMetadata(
    full ? [...files, '.claude/settings.json', '.mcp.json', 'package.json'] : files,
    cwd,
  );
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
    // Prompt/edit hooks must never block the user; only the Stop hook reports failure to Claude.
    const blocking = process.argv.includes('--stop-hook');
    const silent = process.argv.includes('--snapshot') || process.argv.includes('--format-edited');
    process.exitCode = blocking ? 2 : silent ? 0 : 1;
  }
}
