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
| Typography | `typo-h1~h3` `typo-sub1~2` `typo-body1~2` `typo-caption1~2` `typo-button1~2`                           |
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
