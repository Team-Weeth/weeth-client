# Design Tokens

All tokens are defined in `src/app/globals.css`. Hardcoding values is forbidden; always use token classes.

## Spacing

`--spacing-N` → used as Tailwind's `p-N`, `m-N`, `gap-N`, `px-N`, `py-N`, etc.

| Token | Value | Tailwind Class Example |
|-------|-------|------------------------|
| 0 | 0px | `p-0`, `gap-0` |
| 100 | 4px | `p-100`, `gap-100` |
| 200 | 8px | `p-200`, `gap-200` |
| 300 | 12px | `p-300`, `gap-300` |
| 400 | 16px | `p-400`, `gap-400` |
| 450 | 18px | `p-450`, `gap-450` |
| 500 | 20px | `p-500`, `gap-500` |
| 600 | 24px | `p-600`, `gap-600` |
| 700 | 32px | `p-700`, `gap-700` |
| 800 | 40px | `p-800`, `gap-800` |

## Border Radius

| Token | Value | Tailwind Class |
|-------|-------|----------------|
| sm | 8px | `rounded-sm` |
| md | 12px | `rounded-md` |
| lg | 16px | `rounded-lg` |

## Typography

Composite classes defined with `@utility`. Includes font-size + line-height + font-weight.

| Class | Purpose | Default Size |
|-------|---------|--------------|
| `typo-h1` | Heading 1 | 40px / bold |
| `typo-h2` | Heading 2 | 32px / bold |
| `typo-h3` | Heading 3 | 24px / semibold |
| `typo-sub1` | Subheading 1 | 18px / semibold |
| `typo-sub2` | Subheading 2 | 16px / semibold |
| `typo-body1` | Body text 1 | 16px / 470 |
| `typo-body2` | Body text 2 | 14px / 450 |
| `typo-caption1` | Caption 1 | 12px / semibold |
| `typo-caption2` | Caption 2 | 12px / medium |
| `typo-button1` | Button text 1 | 16px / semibold |
| `typo-button2` | Button text 2 | 14px / semibold |

> In the `[data-admin]` context, the typography scale is one step smaller across all levels.

## Color Tokens

### Text
| Class | Purpose |
|-------|---------|
| `text-text-strong` | Emphasized text (black) |
| `text-text-normal` | Default text |
| `text-text-alternative` | Secondary text (gray) |
| `text-text-disabled` | Disabled text |
| `text-text-inverse` | Inverted text (white) |

### Container (Background)
| Class | Purpose |
|-------|---------|
| `bg-container-neutral` | Default container background |
| `bg-container-neutral-interaction` | hover / active state |
| `bg-container-neutral-alternative` | Secondary background |
| `bg-container-primary` | Primary color background |
| `bg-container-primary-alternative` | Light primary color background |
| `bg-container-secondary` | Secondary color background |
| `bg-container-secondary-alternative` | Light secondary color background |

### Button
| Class | Purpose |
|-------|---------|
| `bg-button-primary` | Primary button background |
| `bg-button-primary-interaction` | Primary button hover / active |
| `bg-button-neutral` | Neutral button background |
| `bg-button-neutral-interaction` | Neutral button hover / active |

### Icon
| Class | Purpose |
|-------|---------|
| `text-icon-normal` | Default icon color |
| `text-icon-strong` | Emphasized icon |
| `text-icon-alternative` | Secondary icon |
| `text-icon-disabled` | Disabled icon |
| `text-icon-inverse` | Inverted icon |

### Brand
| Class | Color |
|-------|-------|
| `text-brand-primary` / `bg-brand-primary` | Green (#00c8aa) |
| `text-brand-secondary` / `bg-brand-secondary` | Blue (#508fff) |
| `text-brand-purple` / `bg-brand-purple` | Purple (#7f5ae9) |
| `text-brand-pink` / `bg-brand-pink` | Pink (#ed72e7) |

### State
| Class | Purpose |
|-------|---------|
| `bg-state-success` / `text-state-success` | Success (blue) |
| `bg-state-caution` / `text-state-caution` | Caution (yellow) |
| `bg-state-error` / `text-state-error` | Error (red) |

## Dark Mode

Adding the `.dark` class to `html` or a parent element automatically applies dark tokens. Using only semantic tokens (without the `dark:` prefix) provides automatic switching.

## Adding New Tokens

If existing tokens are insufficient, do not hardcode values arbitrarily. Confirm with the user first, then add the token to `globals.css`.
