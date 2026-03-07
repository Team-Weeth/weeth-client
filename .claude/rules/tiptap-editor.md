# Tiptap Editor Guide

Tiptap-based editor used for writing board posts. Located at `src/components/board/Editor/`.

## File Structure

```
components/board/Editor/
  index.tsx           # Editor root component (EditorContent, FloatingMenu, BubbleMenu)
  usePostEditor.ts    # Editor logic hook (editor instance, slash menu state)
  extensions.ts       # Tiptap extension list
  IndentExtension.ts  # Custom Indent extension
  EditorBubbleMenu.tsx # Format toolbar shown on text selection
  SlashMenu.tsx       # Block selection menu shown on '/' input
```

## Editor Features

- **Slash Menu (`/`)**: Typing `/` in an empty paragraph shows the block type selection menu
- **Bubble Menu**: Inline format toolbar (Bold, Italic, Strike, Code, etc.) shown on text selection
- **Custom Shortcuts**: `` ` `` → inline code, `Backspace` → clears empty blocks
- **Indent**: Indentation support via the custom `IndentExtension`

## Extension Addition Rules

1. Manage the extension list centrally in `extensions.ts`
2. Custom extensions must be separated into their own file (`{Name}Extension.ts`) and imported
3. Tiptap version is pinned to `2.4.0` (all `@tiptap/*` packages must be the same version)

```ts
// extensions.ts
import { StarterKit } from '@tiptap/starter-kit';
import { IndentExtension } from './IndentExtension';

export const extensions = [
  StarterKit,
  IndentExtension,
  // Add more extensions here...
];
```

## Editor Styles

Internal editor elements (`.ProseMirror`) are managed as global styles in `globals.css`. Inline Tailwind arbitrary selectors (`[&_.ProseMirror]:...`) are only allowed for layout-related styles; colors and typography must be added to the `.ProseMirror` rules in `globals.css`.

```css
/* globals.css - Editor styles go here */
.ProseMirror h1 { @apply typo-h1; }
.ProseMirror blockquote { border-left: 3px solid var(--line); }
```

## State Management

Editor form data (title, category, content, attachments, etc.) is managed in `usePostStore` (Zustand).

```ts
import { usePostStore } from '@/stores';

const { title, setTitle, content, setContent } = usePostStore();
```

## Version Pin Warning

All `@tiptap/*` packages are pinned to `2.4.0`. When updating, all packages must be aligned to the same version.
