# Project Overview

Weeth client is a club management/community service built on Next.js 16.

## Tech Stack

- React 19 + TypeScript, Next.js 16 (App Router)
- Tailwind CSS v4, class-variance-authority (cva)
- `cn()` from `@/lib/cn` — className merge utility
- Radix UI, shadcn/ui
- **pnpm** only (npm/yarn forbidden)
- tanstack query, zustand
- axios (API client), next/image, next/font
- tiptap 2.4.0 (`@tiptap/react`) — Rich text editor
- React Server Components (RSC) + Server Actions
- Auth: cookie-based (accessToken/refreshToken)
- **React Compiler** enabled (`reactCompiler: true`) — `useMemo`, `useCallback`, `React.memo` are unnecessary unless truly needed
- **No `forwardRef`** — React 19 passes `ref` as a regular prop. Refactor any existing `forwardRef` usage on sight.

## Project Structure

```text
src/
  app/globals.css        # Design tokens (CSS variables, @utility)
  components/ui/         # Reusable UI components, re-exported via index.ts
  lib/cn.ts              # className merge utility
```

→ Details: `.claude/rules/architecture.md`

## Design Tokens

No hardcoded values. Always use token classes first. Ask user before adding new tokens.

| Category   | Class examples                                                                                         |
| ---------- | ------------------------------------------------------------------------------------------------------ |
| Text       | `text-text-strong` `text-text-normal` `text-text-alternative` `text-text-disabled` `text-text-inverse` |
| Background | `bg-container-neutral` `bg-container-neutral-interaction`                                              |
| Button     | `bg-button-primary` `bg-button-neutral`                                                                |
| Typography | `typo-h1~h3` `typo-sub1~3` `typo-body1~2` `typo-caption1~2` `typo-button1~2`                           |
| Spacing    | `p-100~500` `gap-100~400`                                                                              |

→ Full token list: `.claude/rules/design-tokens.md`

## Component Pattern

```tsx
const variants = cva('base', { variants: { variant: {}, size: {} }, defaultVariants: {} });

interface Props extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof variants> {}

function Component({ className, variant, size, ...props }: Props) {
  return <div className={cn(variants({ variant, size }), className)} {...props} />;
}

export { Component, variants, type Props };
```

- Always expose `className`; support `asChild` when using Radix
- Add new components to `src/components/ui/index.ts`

→ Details: `.claude/rules/component-guide.md`

## Git Conventions

```text
feat / fix / style / refactor / ci / chore
```

Format: `[type]: commit message`

No direct commits to main branch.

## Commands

- **Lint:** `pnpm lint` / **Format check:** `pnpm format:check`
- **Dev:** `pnpm dev` / **Build:** `pnpm build`

## Detail Rules

Architecture, code style, component guide, state management, and git conventions are documented in `.claude/rules/`. Refer to those files for comprehensive guidance.

## Team Knowledge Base (`docs/`)

`docs/` is the team's shared Obsidian vault — decisions, domain glossary, ADRs, meeting notes, session logs, troubleshooting. When the user asks about *why* a pattern exists, what a domain term means, or what was decided, **read `docs/` first** before grepping code.

Key entry points:
- `docs/홈.md` — map of contents
- `docs/아키텍처/도메인-용어집.md` — Cardinal, Session, Board, etc.
- `docs/아키텍처/결정-기록/` — ADRs (the *why*)
- `docs/트러블슈팅/` — known pitfalls
- `docs/로그/세션로그-{name}-{date}.md` — daily session logs

When making notable decisions, hitting tricky bugs, or finishing a session, write to the appropriate `docs/` file. The user often asks for this explicitly ("ADR로 만들어줘", "트러블슈팅에 추가해줘", "오늘 세션로그 정리").
