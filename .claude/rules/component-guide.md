# Component Guide

## Base Pattern (cva + cn)

React 19 passes `ref` directly as a prop — `forwardRef` is no longer needed.

```tsx
// Only when state or event handlers are used
'use client';

import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/cn';

const componentVariants = cva('base-classes', {
  variants: {
    variant: {
      primary: '...',
      secondary: '...',
    },
    size: {
      lg: '...',
      md: '...',
      sm: '...',
    },
  },
  defaultVariants: {
    variant: 'primary',
    size: 'md',
  },
});

interface ComponentProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof componentVariants> {
  ref?: React.Ref<HTMLElement>;
}

function Component({ className, variant, size, ref, ...props }: ComponentProps) {
  return (
    <div
      ref={ref}
      className={cn(componentVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Component, componentVariants, type ComponentProps };
```

## Rules

### Required
- Always expose the `className` prop (to allow external override)
- Shared UI components must expose `ref` via `React.Ref<T>` in the props interface (React 19 — no `forwardRef` needed)
- When using `cn()`, always merge the external `className` last (to guarantee override priority)
- Prefer importing shared UI components directly from their file path. Do not add new runtime exports to `components/ui/index.ts` unless there is a strong compatibility reason.

### 'use client' Directive
- Only add when using state (`useState`, `useReducer`), event handlers, or browser APIs
- Keep components that only render as Server Components

### Radix UI
- Support the `asChild` prop when using Radix primitives
- Import from the `radix-ui` package (not `@radix-ui/react-*`)

## Using SVG Icons

Pass the imported SVG object to the `src` prop of `next/image`.

```tsx
import Image from 'next/image';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';

<Image src={ArrowRightIcon} alt="right arrow" width={20} height={20} />
```

### Icon Addition Rules
1. Save the SVG file in the category folder: `src/assets/icons/{category}/ic_{category}_{name}.svg`
2. Import the SVG directly from the file where it is used.
3. Local import names should be PascalCase + `Icon` suffix: `ArrowRightIcon`, `MenuIcon`

## Type Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| Props type | `{Name}Props` | `ButtonProps` |
| variants variable | `{name}Variants` | `buttonVariants` |
| export | Named exports only | `export { Button, buttonVariants, type ButtonProps }` |

## Domain Components

Components under `components/{feature}/` may omit cva if not needed, but must follow these rules:
- Expose `className` prop
- Prefer direct imports from the owning component file instead of `index.ts` barrel imports
- Support `asChild` when using Radix
