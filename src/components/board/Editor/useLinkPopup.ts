import { useState } from 'react';
import type { Editor } from '@tiptap/core';

interface LinkPopupPos {
  top: number;
  left: number;
}

function useLinkPopup(editor: Editor | null) {
  const [pos, setPos] = useState<LinkPopupPos | null>(null);

  const openFromSlashMenu = () => {
    if (!editor) return;
    const { from } = editor.state.selection;
    const coords = editor.view.coordsAtPos(from);
    setPos({ top: coords.bottom + 8, left: coords.left });
  };

  const handleEditorClick = (e: React.MouseEvent) => {
    const linkEl = (e.target as HTMLElement).closest('a[href]');
    if (!linkEl) return;
    const rect = linkEl.getBoundingClientRect();
    setPos({ top: rect.bottom + 8, left: rect.left });
  };

  const close = () => setPos(null);

  return { pos, openFromSlashMenu, handleEditorClick, close };
}

export { useLinkPopup };
