---
name: code-review
description: "Reviews PR/commit code changes. Detects bugs, security vulnerabilities, and performance issues, and provides actionable fix suggestions."
argument-hint: "[HEAD~1 | --staged | <commit-hash>]"
disable-model-invocation: true
allowed-tools: Glob, Grep, Read, Bash
---

# Code Review

Systematically analyzes code changes to detect issues and provide actionable fixes.
**All output must be written in Korean.**

## Arguments

Use `$ARGUMENTS` to specify the review scope. For a PR review, resolve the base using
`.claude/rules/git-workflow.md`; use `HEAD~1` only for an explicitly requested last-commit review.
Pass validated arguments as arguments, never as shell code.

- `/code-review` → diff against the resolved PR base
- `/code-review --staged` → `git diff --staged`
- `/code-review abc1234` → specific commit

## Workflow (follow in order)

### 1. Analyze changes

```bash
# Default PR scope: BASE_REF is resolved and validated using git-workflow.md.
git diff --name-only "$BASE_REF"...HEAD
git diff "$BASE_REF"...HEAD
```

For `--staged`, run `git diff --cached --name-only` and `git diff --cached` instead.
For an explicit single commit, validate it as a commit object and use `git show <commit>`;
do not interpret it as a diff from that commit to the current working tree.

- List changed files and assess impact
- Check whether related test files exist

### 2. Review by category (in order)

1. **Critical** — bugs, security vulnerabilities, data loss risk
2. **Major** — performance issues, architecture violations, missing tests
3. **Minor** — code style, naming, duplicate code
4. **Suggestion** — better implementations, idiomatic React/TS patterns

### 3. Output result

Output must strictly follow the format in `template.md`.

## Review Checklist

### Bug/Logic

- Falsy value exposed in conditional rendering (`count && <Comp />` renders "0" when count is 0)
- Missing async handling (loading/error state not handled)
- Missing or over-specified `useEffect` dependency arrays
- Event handler memory leaks (subscriptions or timers without cleanup)
- Misuse of `key` prop (using index, duplicate keys)

### Security

- XSS risk via `dangerouslySetInnerHTML`
- Sensitive data exposure (tokens/passwords in `console.log` or error messages)
- Exposed environment variables (watch for `NEXT_PUBLIC_` prefix)
- Unvalidated user input (missing form validation)
- Direct injection of external URLs (`href={userInput}` → `javascript:` attack)

### Performance

- Unnecessary re-renders supported by profiling or compiler diagnostics; follow the React Compiler policy in `AGENTS.md`
- Excessive bundle size (importing entire libraries unnecessarily)
- Missing image optimization (using `<img>` instead of `next/image`)
- Infinite loop risk (mutating dependent state inside `useEffect`)
- Expensive computations with demonstrated performance impact; choose optimization based on evidence

### Architecture

- Component hierarchy violation: Page → Feature component → UI component (no reverse dependencies)
- Business logic inside UI components (`src/components/ui/`) is forbidden
- Use design tokens first (hardcoded color or spacing values are forbidden)
- Not using `cn()` (direct string concatenation for className is forbidden)
- Not using cva variants (inline conditional className handling)
- Runtime imports must follow the direct-import policy in `AGENTS.md`; do not require barrel re-exports

### TypeScript

- Overuse of `any` type
- Excessive type assertions (`as`)
- Not using optional chaining (`?.`)
- Missing explicit return types (component Props, API response types)

### Accessibility (a11y)

- Missing `aria-label` on interactive elements (icon buttons, etc.)
- Keyboard inaccessible elements (`<div>` with only `onClick`, no `onKeyDown`)
- Non-semantic markup (`<div>` used as button or link)
- Missing or misused `alt` text on images
- `label` not associated with `input` in forms

## Rules

- **All output in Korean**
- Always provide concrete fix code (critique without fix is not allowed)
- Acknowledge well-written code
- Mark uncertain issues as "needs verification"
- If no issues found, explicitly state "Review complete — no issues"

## Supporting Files

- Output format: [template.md](template.md)
