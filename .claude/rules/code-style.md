# Code Style

## TypeScript

### Type vs Interface
- Props, object shapes → `interface` (extendable)
- Union, utility types → `type`

```ts
// Good
interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

type Status = 'DRAFT' | 'PUBLISHED';

// Bad - using type for Props
type ButtonProps = { variant?: string };
```

### Type Export
- Use named exports only; default exports are forbidden (including components)
- Exception: Next.js App Router special files require default export (framework requirement)
  - Includes: `page.tsx`, `layout.tsx`, `template.tsx`, `loading.tsx`, `error.tsx`, `global-error.tsx`, `not-found.tsx`, `default.tsx`

```ts
// components/ui/Button.tsx
export { Button, buttonVariants, type ButtonProps };

// app/(private)/(main)/home/page.tsx
// page files are an exception
export default function HomePage() { ... }
```

## Import

### Path Alias
- All imports must use the `@/` alias; relative paths (`../`) are forbidden

```ts
// Good
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui';

// Bad
import { cn } from '../../lib/cn';
```

### Import Order (auto-sorted by Prettier)
1. React, Next.js
2. External libraries
3. Internal modules (`@/`)
4. Types (`import type`)

## Naming Conventions

| Item | Rule | Example |
|------|------|---------|
| Component | PascalCase | `Button`, `TextField` |
| Hook | camelCase + `use` prefix | `usePostStore`, `useAutoScrollIntoView` |
| Utility function | camelCase | `cn`, `formatDate` |
| Constant | UPPER_SNAKE_CASE | `MAX_FILE_SIZE` |
| Type / Interface | PascalCase | `ButtonProps`, `FileItem` |
| SVG icon export | PascalCase + `Icon` suffix | `ArrowRightIcon` |
| Zustand store | `use{Name}Store` | `usePostStore` |

## File Naming

| File Type | Rule | Example |
|-----------|------|---------|
| Component | PascalCase.tsx | `Button.tsx`, `Header.tsx` |
| Hook | camelCase.ts | `useAutoScrollIntoView.ts` |
| Store | camelCase.ts | `usePostStore.ts` |
| Utility / Library | camelCase.ts | `cn.ts` |
| Next.js reserved files | lowercase | `page.tsx`, `layout.tsx` |

## Tailwind CSS

- Class order is auto-sorted by `prettier-plugin-tailwindcss`
- Use `cn()` for conditional classes

```tsx
// Good
<div className={cn('base-class', isActive && 'active-class', className)} />

// Bad
<div className={`base-class ${isActive ? 'active-class' : ''}`} />
```

## Responsive

Breakpoint prefix order: default (mobile) → `tablet:` → `desktop:`

```tsx
// Mobile first
<div className="flex-col tablet:flex-row desktop:gap-400" />
```

| Breakpoint | Value |
|------------|-------|
| mobile (default) | 360px |
| tablet | 696px |
| desktop | 1032px |
