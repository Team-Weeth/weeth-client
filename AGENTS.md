# Weeth client

Next.js App Router club/community application. React 19, TypeScript, Tailwind v4,
React Query, Zustand, Axios and Tiptap. Use pnpm.

## Working agreements

- Inspect the current changes before editing; preserve unrelated user work.
- Keep edits scoped to the request. Do not refactor adjacent code solely to satisfy a convention.
- Prefer direct runtime imports from the owning file. Do not add runtime barrel exports
  for components, hooks, icons or APIs. Preserve existing compatibility exports unless
  their removal is part of the task. Type-only barrels with `import type` are allowed.
- React Compiler is enabled. Do not add manual memoization by default or remove it
  mechanically. Keep it when an external API needs stable identity or measured behavior
  justifies it; investigate compiler/lint diagnostics before changing dependencies.
- New React components use ref props. Migrate existing forwardRef only within task scope.
- Use existing design tokens and `cn()`; propose new tokens before adding them.
- Keep server-only APIs out of client dependency graphs.

## Task-specific references

Read the relevant document when the task needs it, not the entire list every time.

| Task                                   | Reference                                                            |
| -------------------------------------- | -------------------------------------------------------------------- |
| Branch, commit, PR, review range       | `.claude/rules/git-workflow.md`                                      |
| Folder placement and boundaries        | `.claude/rules/architecture.md`                                      |
| Components and tokens                  | `.claude/rules/component-guide.md`, `.claude/rules/design-tokens.md` |
| TypeScript conventions                 | `.claude/rules/code-style.md`                                        |
| API calls and server/client boundaries | `.claude/rules/data-fetching.md`                                     |
| State and feature flags                | `.claude/rules/state-management.md`, `.claude/rules/feature-flag.md` |
| Tests and mocks                        | `.claude/rules/testing.md`, `TESTING.md`                             |

Existing workflow instructions live in `.claude/skills/`; consult the relevant
`SKILL.md` for API integration, Figma implementation, testing or PR review.
This location is a reference for other tools, not a claim of automatic skill discovery.
Repository-specific agreements above take precedence over generic vendored advice.

## Verification

- Documentation-only changes: check changed Markdown and referenced paths/commands.
- Runtime changes: `pnpm typecheck`, `pnpm lint`, and affected Jest tests
  (`pnpm exec jest --runInBand --runTestsByPath <test-path>`).
- Before handing off build/configuration changes: also run `pnpm build` and relevant tests.
- Full application checks: `pnpm format:check`, `pnpm typecheck`, `pnpm lint`, `pnpm test:ci`, `pnpm build`.
- Do not run the entire application suite for every edit. Report checks not run and
  distinguish observed failures from assumptions about their cause.
- If generated Next types reference removed routes, inspect generated state and the
  running dev server before recovery. Do not silently exclude route types or delete an
  active dev server's `.next` directory.

## Team knowledge

Use the existing `docs/` vault for durable knowledge; do not create a competing log system.
Start with `docs/홈.md` for decisions/domain questions, then the relevant ADR,
`docs/아키텍처/도메인-용어집.md` or troubleshooting note.
Record material decisions with evidence; avoid copying command output or conversation transcripts.
