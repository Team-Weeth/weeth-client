'use client';

import { useEditor } from '@tiptap/react';
import { useState, useRef, useEffect } from 'react';
import { usePostStore } from '@/stores/usePostStore';
import { editorExtensions } from '@/components/board/Editor/extensions';
import {
  handleFileDrop,
  handleSubImageDrop,
  handleInlineImageGroupDrop,
} from '@/lib/board/editor/postEditorDropHandlers';
import { createPasteHandler } from '@/lib/board/editor/postEditorPasteHandler';
import { createKeyDownHandler } from '@/lib/board/editor/postEditorKeyHandlers';

interface UsePostEditorOptions {
  processFilesInline?: (files: File[]) => void;
  initialContent?: string;
}

export function usePostEditor({ processFilesInline, initialContent }: UsePostEditorOptions = {}) {
  const setContent = usePostStore((state) => state.setContent);
  // 마운트 시점에 한 번만 초기 content 고정 (수정 페이지용)
  const [initialContentValue] = useState(() => initialContent ?? '');
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  // ref로 최신 상태 유지 → useEditor 내부 handleKeyDown stale closure 방지
  const showSlashMenuRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const processFilesRef = useRef(processFilesInline);
  useEffect(() => {
    processFilesRef.current = processFilesInline;
  });

  const closeSlashMenu = () => {
    showSlashMenuRef.current = false;
    setShowSlashMenu(false);
  };

  const updateSlashMenuState = (isSlash: boolean) => {
    showSlashMenuRef.current = isSlash;
    setShowSlashMenu(isSlash);
  };

  const editor = useEditor({
    extensions: editorExtensions,
    content: initialContentValue,

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      const { $from } = editor.state.selection;
      const text = $from.nodeBefore?.textContent ?? '';
      updateSlashMenuState(/\/[^\s]*$/.test(text));
    },

    // 커서 이동만으로 '/' 뒤를 벗어났을 때도 메뉴를 닫기 위해 추적
    onSelectionUpdate: ({ editor }) => {
      if (!showSlashMenuRef.current) return;
      const { $from } = editor.state.selection;
      const text = $from.nodeBefore?.textContent ?? '';
      if (!/\/[^\s]*$/.test(text)) {
        closeSlashMenu();
      }
    },

    editorProps: {
      handlePaste: createPasteHandler(() => processFilesRef.current),
      handleDrop: (view, event) =>
        handleFileDrop(view, event, processFilesRef.current) ||
        handleSubImageDrop(view, event) ||
        handleInlineImageGroupDrop(view, event),
      handleKeyDown: createKeyDownHandler(() => showSlashMenuRef.current),
    },
  });

  return { editor, showSlashMenu, closeSlashMenu, containerRef };
}
