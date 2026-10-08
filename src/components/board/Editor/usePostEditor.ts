'use client';

import { useEditor } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { useState, useRef, useEffect } from 'react';
import { usePostStore } from '@/stores/usePostStore';
import { editorExtensions } from './extensions';
import {
  handleFileDrop,
  handleSubImageDrop,
  handleInlineImageGroupDrop,
} from './postEditorDropHandlers';

const LIST_TYPES = ['bulletList', 'orderedList', 'taskList'];

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
      handlePaste: (view, event, slice) => {
        const clipboardFiles = event.clipboardData?.files;
        if (clipboardFiles && clipboardFiles.length > 0) {
          processFilesRef.current?.(Array.from(clipboardFiles));
          return true;
        }

        // files가 비어있을 때 items에서 이미지 추출
        // (브라우저 이미지 복사·스크린샷 등은 files 대신 items에만 존재)
        const items = event.clipboardData?.items;
        if (items) {
          const imageFiles = Array.from(items)
            .filter((item) => item.kind === 'file' && item.type.startsWith('image/'))
            .map((item) => item.getAsFile())
            .filter((f): f is File => f !== null);
          if (imageFiles.length > 0) {
            processFilesRef.current?.(imageFiles);
            return true;
          }
        }

        // NodeSelection 상태에서 tiptap 기본 동작은 선택된 노드를 붙여넣기 내용으로
        // 교체(replaceWith)한다. 직접 slice를 선택 노드 하단에 삽입하여 교체를 방지한다.
        const { selection } = view.state;
        if ('node' in selection && slice) {
          const tr = view.state.tr;
          tr.replaceRange(selection.to, selection.to, slice);
          tr.scrollIntoView();
          view.dispatch(tr);
          return true;
        }

        return false;
      },

      handleDrop: (view, event) =>
        handleFileDrop(view, event, processFilesRef.current) ||
        handleSubImageDrop(view, event) ||
        handleInlineImageGroupDrop(view, event),

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

        // Backspace UX 개선
        if (event.key === 'Backspace') {
          if ($from.parentOffset === 0 && $from.parent.textContent === '') {
            // 빈 헤딩 → 일반 단락으로 전환
            if ($from.parent.type.name === 'heading') {
              view.dispatch(
                state.tr.setBlockType($from.pos, $from.pos, state.schema.nodes.paragraph),
              );
              return true;
            }

            // 빈 paragraph가 리스트 바로 뒤에 있을 때 리스트 재진입 방지
            if ($from.depth < 1) return false;
            const resolvedPos = state.doc.resolve($from.before());
            const nodeBefore = resolvedPos.nodeBefore;

            if (
              $from.parent.type.name === 'paragraph' &&
              nodeBefore &&
              LIST_TYPES.includes(nodeBefore.type.name)
            ) {
              const paragraphStart = $from.before();
              const paragraphEnd = $from.after();
              const endOfPrevNode = paragraphStart - 1;
              const tr = state.tr.delete(paragraphStart, paragraphEnd);
              const mappedPos = tr.mapping.map(endOfPrevNode);
              tr.setSelection(TextSelection.near(tr.doc.resolve(mappedPos), -1));
              view.dispatch(tr);
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
