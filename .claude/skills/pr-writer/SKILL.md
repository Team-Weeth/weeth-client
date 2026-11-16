---
name: pr-writer
description: Creates or updates a PR title and body from the complete diff against its actual base.
---

# PR writer

Read `.claude/rules/git-workflow.md` for base selection, staging, authorization and draft handoff.

## Verify the relevant scope

Use the verification matrix in `AGENTS.md`. Documentation-only PRs do not require
an application build. Runtime changes require types, lint and affected tests; build
configuration changes also require a build. Run matching Playwright specs when
editor flows or E2E files change, with the required development credentials available.

Do not install dependencies as a generic response to every type error. Diagnose
missing packages versus stale generated Next types. Report exact failures and skipped
checks; do not claim they are pre-existing without baseline evidence.

## Describe the final change

1. Resolve and validate the explicit/PR/default base using the Git workflow.
2. Inspect `git diff "$BASE_REF"...HEAD`, `git log "$BASE_REF"..HEAD`, and local changes.
3. Follow `.github/pull_request_template.md`. Use a Korean title with the applicable
   [Feat], [Fix], [Refactor], [Docs] or [Chore] prefix. Include WTH only when it exists.
4. Explain the concrete problem, final behavior, verification and limitations.
   Do not copy example issue numbers or invent closing references.
5. Create/update only when authorized; pass explicit base/head and use draft when requested.
6. Verify the remote PR state. On subsequent changes, rewrite the body from the full
   current base-to-head diff; do not append a chronological history since last push.
