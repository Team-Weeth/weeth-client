'use client';

import { useEditor } from '@tiptap/react';
import { useState, useRef, useCallback } from 'react';
import { usePostStore } from '@/stores/usePostStore';
import { editorExtensions } from './extensions';

export function usePostEditor() {
  const setContent = usePostStore((state) => state.setContent);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  // ref로 최신 상태 유지 → useEditor 내부 handleKeyDown stale closure 방지
  const showSlashMenuRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const closeSlashMenu = useCallback(() => {
    showSlashMenuRef.current = false;
    setShowSlashMenu(false);
  }, []);

  const updateSlashMenuState = useCallback((isSlash: boolean) => {
    showSlashMenuRef.current = isSlash;
    setShowSlashMenu(isSlash);
  }, []);

  const editor = useEditor({
    extensions: editorExtensions,
    content: '',

    onUpdate: ({ editor }) => {
      setContent(editor.getHTML());
      const { $from } = editor.state.selection;
      updateSlashMenuState(($from.nodeBefore?.textContent ?? '').endsWith('/'));
    },

    // 커서 이동만으로 '/' 뒤를 벗어났을 때도 메뉴를 닫기 위해 추적
    onSelectionUpdate: ({ editor }) => {
      const { $from } = editor.state.selection;
      updateSlashMenuState(($from.nodeBefore?.textContent ?? '').endsWith('/'));
    },

    editorProps: {
      handleKeyDown: (view, event) => {
        // 슬래시 메뉴 우선 처리 (ref로 stale closure 없이 최신 값 참조)
        if (showSlashMenuRef.current) {
          if (event.key === 'Enter' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
            event.preventDefault();
            return true;
          }
        }

        const { state } = view;
        const { $from } = state.selection;

        // 백틱 인라인 코드 단축키
        if (event.key === '`') {
          const blockStart = $from.start();
          const textBefore = state.doc.textBetween(blockStart, $from.pos);
          const openIndex = textBefore.lastIndexOf('`');

          if (openIndex !== -1) {
            const innerText = textBefore.slice(openIndex + 1);

            if (innerText.length > 0) {
              event.preventDefault();
              const from = blockStart + openIndex;
              const to = $from.pos;
              const codeMark = state.schema.marks.code.create();
              const codeText = state.schema.text(innerText, [codeMark]);
              const tr = state.tr.replaceWith(from, to, codeText);
              tr.removeStoredMark(state.schema.marks.code);

              view.dispatch(tr);
              return true;
            }
          }
        }

        // Backspace UX 개선 (빈 헤딩 → 일반 단락으로 전환)
        if (event.key === 'Backspace') {
          if ($from.parentOffset === 0 && $from.parent.textContent === '') {
            if ($from.parent.type.name === 'heading') {
              view.dispatch(
                state.tr.setBlockType($from.pos, $from.pos, state.schema.nodes.paragraph),
              );
              return true;
            }
          }
        }

        return false;
      },
    },
  });

  return { editor, showSlashMenu, closeSlashMenu, containerRef };
}
