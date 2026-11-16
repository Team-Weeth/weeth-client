# Git workflow

## Branch and scope

- Start with `git status --short --branch` and inspect both staged and unstaged diffs.
- Never commit directly to `main` or `develop`, or from detached HEAD. Use a task branch.
- Fetch before choosing a new branch base when network access is available. New ordinary
  work branches from `origin/develop`; release/hotfix or stacked work follows the explicit task base.
- Review base priority: user-specified base, existing PR `baseRefName`, then `origin/develop`.
  The repository default branch and the branch's upstream are not necessarily the PR base.
- Validate the ref before using it. If it cannot be resolved, report the missing base rather
  than silently reviewing an empty range. Do not interpolate untrusted arguments into shell code.
- Branch review uses `git diff <base>...HEAD` and `git log <base>..HEAD`.
  `--staged` means index only. Local verification also includes unstaged and untracked files.
- Separate independent PRs from the same base; use a stack only for real dependencies and
  state the merge order in every dependent PR.

## Preserve work and authority

- Stage explicit task-owned paths after reviewing their diff. No blanket `git add .`.
- If a file contains unrelated staged/unstaged edits, preserve them and stage only owned hunks;
  do not reset the user's index to simplify a commit.
- A request to finish and open a PR authorizes necessary staging, commits and pushing the task
  branch. Do not repeatedly ask for the same authorization. A review-only request authorizes none of these.
- Commit format: `<type>: <Korean summary>`; use feat, fix, style, refactor, test, ci, chore or docs.
  Include WTH identifiers when provided; never invent an issue number or closing reference.
- Do not bypass hooks, amend published commits, force-push, merge, or delete branches unless
  authorized for that operation. Prefer an additive fix commit for review findings.

## PR handoff

- Before pushing, inspect `git diff --check`, staged diff, branch range, and relevant test results.
- Specify `--base` and `--head` explicitly. Use `--draft` when requested.
- Follow `.github/pull_request_template.md`; use “없음” for absent issue/screenshot fields.
- Describe the final diff against the actual PR base. Updating a PR means rewriting its title/body
  to reflect the current result, not appending a conversation history or diff since last push.
- Record exact checks, failures, limitations and any dependency on another PR.
- Verify the remote PR head/base/draft state after creation; inspect CI results and report
  pending/failed checks honestly. Draft creation does not authorize merge or deployment.
- Use a body file or structured API argument for multiline PR text; never execute user text as shell code.
