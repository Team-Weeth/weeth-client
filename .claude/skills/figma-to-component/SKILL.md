---
name: figma-to-component
description: Converts Figma designs (URL or screenshot) into React components following the Weeth design system. Use when a Figma URL or screenshot is provided.
---

## Step 1. Analyze Design

Analyze the layout structure of the Figma design:
- Layout method (flex / grid)
- Fixed size vs dynamic size elements
- Text overflow handling locations

Output a mapping table of Figma properties to tokens:
```text
Figma Property  | Value      | Mapped Token/Class
--------------- | ---------- | -------------------------
Background      | #1E2125    | bg-container-neutral
Border Radius   | 8px        | rounded-lg
Font            | Sub1 Bold  | typo-sub1 text-text-strong
Padding         | 20px       | p-500
Gap             | 12px       | gap-300
```

**Token matching priority:**

1. Tailwind token classes (`bg-container-neutral`, `text-text-strong`)
2. CSS variables (`var(--color-primary)`)
3. If new token needed → propose to user and confirm

## Step 2. Check Existing Patterns

Read existing components in `src/components/ui/` to understand patterns.

## Step 3. Create Component

Generate the component based on [template.md](template.md) structure.

**Layout principles:**

- **Text overflow:** Use `truncate` for clipped text, add `min-w-0` to flex/grid children.
- **Spacing:** Use `gap-*` on parent. No unnecessary wrapper divs for spacing.
- **Fixed vs dynamic height:** Use `h-*` only for elements requiring uniform height (e.g. list rows). Otherwise keep dynamic height.
- **Hierarchy accuracy:** Accurately reflect Figma's nesting structure. e.g. pagination inside vs outside main area changes the structure.

**Other principles:**

- No hardcoded values
- Always expose `className`
- Support `asChild` when using Radix UI
- Add export to `src/components/ui/index.ts`
- Figma designs are assumed desktop (1032px) baseline
- Confirm with user if mobile/tablet responsiveness is not specified
- Breakpoints: `mobile(360px)`, `tablet(696px)`, `desktop(1032px)`

## Step 4. Summary
```text
✅ File created: src/components/ui/ComponentName.tsx
✅ Design tokens: N used
⚠️  New token needed: --token-name (suggested value)
```

**Self-check:**
- [ ] No hardcoded values
- [ ] className exposed
- [ ] Export added to index.ts
- [ ] Only design tokens used
