# Component Guide

## Base Pattern (cva + cn + forwardRef)

```tsx
// Only when state or event handlers are used
'use client';

import { forwardRef } from 'react';
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
    VariantProps<typeof componentVariants> {}

const Component = forwardRef<HTMLElement, ComponentProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(componentVariants({ variant, size }), className)}
        {...props}
      />
    );
  },
);

Component.displayName = 'Component';

export { Component, componentVariants, type ComponentProps };
```

## Rules

### Required
- Always expose the `className` prop (to allow external override)
- Shared UI components must use `forwardRef` + `displayName`
- When using `cn()`, always merge the external `className` last (to guarantee override priority)
- When creating a new component, add its export to `components/ui/index.ts`

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
import { ArrowRightIcon } from '@/assets/icons';

<Image src={ArrowRightIcon} alt="right arrow" width={20} height={20} />
```

### Icon Addition Rules
1. Save the SVG file in the category folder: `src/assets/icons/{category}/ic_{category}_{name}.svg`
2. Add a named export to `src/assets/icons/index.ts`
3. Export name must be PascalCase + `Icon` suffix: `ArrowRightIcon`, `MenuIcon`

```ts
// src/assets/icons/index.ts
export { default as AdminUserIcon } from './admin/ic_admin_user.svg';
```

## Type Naming Conventions

| Item | Pattern | Example |
|------|---------|---------|
| Props type | `{Name}Props` | `ButtonProps` |
| variants variable | `{name}Variants` | `buttonVariants` |
| export | Named exports only | `export { Button, buttonVariants, type ButtonProps }` |

## Domain Components

Components under `components/{feature}/` may omit cva if not needed, but must follow these rules:
- Expose `className` prop
- Re-export via `index.ts`
- Support `asChild` when using Radix
