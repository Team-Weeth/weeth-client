# Architecture Guide

## Folder Structure

```
src/
  app/                          # Next.js App Router
    (private)/
      (main)/                   # General user main layout (with Header)
        home/page.tsx
        board/page.tsx
        mypage/page.tsx
      admin/                    # Admin layout (data-admin attribute required)
        layout.tsx
        page.tsx
    (public)/
      (auth)/                   # Login / Sign up
      (landing)/                # Landing page
    globals.css                 # Design tokens (CSS variables, @utility)
    layout.tsx                  # Root layout

  components/
    ui/                         # Reusable shared UI components
      index.ts                  # Re-exports all UI components
    layout/                     # Shared layout components (Header, Footer)
    admin/                      # Admin-only components
    auth/                       # Auth-related components
    board/                      # Board-related components
    home/                       # Home-related components
    mypage/                     # My page related components

  lib/
    actions/                    # Next.js Server Actions ("use server")
    apis/                       # API call functions
    schemas/                    # Validation schemas (Zod, etc.)
    cn.ts                       # className merge utility

  stores/                       # Zustand global state
  hooks/                        # Custom React hooks
  types/                        # TypeScript type definitions
  constants/                    # Constants
  assets/
    icons/                      # SVG icons (organized by category folder)
      index.ts                  # Re-exports all icons
      admin/
      logo/
  providers/                    # React Context Provider collection
```

## Core Rules

### Component Placement
- Components used only within a specific domain → `components/{feature}/`
- UI reused across multiple places → `components/ui/`
- Layout components (Header, Footer, etc.) → `components/layout/`

### index.ts Re-export Required
Every folder must re-export through `index.ts`. Do not import directly from file paths outside the folder.

```ts
// Good
import { Button } from '@/components/ui';
import { ArrowRightIcon } from '@/assets/icons';

// Bad
import Button from '@/components/ui/Button';
import ArrowRightIcon from '@/assets/icons/arrow_right.svg';
```

### Data Flow
- Server state (fetch/mutate) → `@tanstack/react-query` + `lib/apis/`
- Server mutations → `lib/actions/` (Server Actions, "use server")
- Client UI state → Zustand (`stores/`)
- Local component state → `useState`

### Admin Context
The admin layout (`app/(private)/admin/layout.tsx`) must have the `data-admin` attribute on its root element. This attribute is required for the admin-specific typography scale to be applied.

```tsx
// app/(private)/admin/layout.tsx
export default function AdminLayout({ children }) {
  return <div data-admin>{children}</div>;
}
```

### Route Group Naming
- `(private)` — Pages that require authentication
- `(public)` — Pages that do not require authentication
- `(main)` — General user main layout
- `(auth)` — Login / sign-up layout
- `(landing)` — Landing page layout
