'use client';

import { useEditor, EditorContent, BubbleMenu, FloatingMenu } from '@tiptap/react';
import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import Heading from '@tiptap/extension-heading';
import Bold from '@tiptap/extension-bold';
import Italic from '@tiptap/extension-italic';
import Code from '@tiptap/extension-code';
import CodeBlock from '@tiptap/extension-code-block';
import Strike from '@tiptap/extension-strike';
import Blockquote from '@tiptap/extension-blockquote';
import BulletList from '@tiptap/extension-bullet-list';
import OrderedList from '@tiptap/extension-ordered-list';
import ListItem from '@tiptap/extension-list-item';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import HardBreak from '@tiptap/extension-hard-break';
import History from '@tiptap/extension-history';
import Dropcursor from '@tiptap/extension-dropcursor';
import Gapcursor from '@tiptap/extension-gapcursor';
import Placeholder from '@tiptap/extension-placeholder';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import Typography from '@tiptap/extension-typography';
import { useState, useRef, useCallback } from 'react';
import { usePostStore } from '@/stores/usePostStore';
import { SlashMenuContent } from './SlashMenu';

/**
 * 주요 기능:
 * Tiptap 기반 에디터 컴포넌트
 *
 * - Slash Menu (/)
 * - Bubble Menu (텍스트 선택 시)
 * - 커스텀 키보드 단축키 (` 인라인 코드, Backspace 블록 정리)
 */

export default function Editor() {
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
    extensions: [
      Document,
      Paragraph,
      Text,
      Heading.configure({ levels: [1, 2, 3] }),
      Bold,
      Italic,
      Code,
      CodeBlock,
      Strike,
      Blockquote,
      BulletList.configure({ keepMarks: true, keepAttributes: false }),
      OrderedList.configure({ keepMarks: true, keepAttributes: false }),
      ListItem,
      HorizontalRule,
      HardBreak,
      History,
      Dropcursor,
      Gapcursor,
      Typography,
      Placeholder.configure({ placeholder: "명령어는 '/'를 입력하세요." }),
      TaskList,
      TaskItem.configure({ nested: true, onReadOnlyChecked: () => false }),
    ],

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
        // listItem은 Tiptap ListItem extension이 자체 처리
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

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      {/* BubbleMenu */}
      <BubbleMenu
        editor={editor}
        tippyOptions={{
          duration: 100,
          appendTo: () => containerRef.current ?? document.body,
        }}
        className="border-line bg-container-neutral flex items-center gap-0.5 rounded-lg border p-1 shadow-md"
      >
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={`rounded px-2 py-1 text-sm font-bold transition-colors ${
            editor.isActive('bold')
              ? 'bg-button-primary text-text-inverse'
              : 'text-text-normal hover:bg-container-neutral-interaction'
          }`}
        >
          B
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={`rounded px-2 py-1 text-sm italic transition-colors ${
            editor.isActive('italic')
              ? 'bg-button-primary text-text-inverse'
              : 'text-text-normal hover:bg-container-neutral-interaction'
          }`}
        >
          I
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCode().run();
          }}
          className={`rounded px-2 py-1 font-mono text-sm transition-colors ${
            editor.isActive('code')
              ? 'bg-button-primary text-text-inverse'
              : 'text-text-normal hover:bg-container-neutral-interaction'
          }`}
        >
          {'<>'}
        </button>
        <div className="bg-line mx-1 h-4 w-px" />
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-button-primary text-text-inverse'
              : 'text-text-normal hover:bg-container-neutral-interaction'
          }`}
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-button-primary text-text-inverse'
              : 'text-text-normal hover:bg-container-neutral-interaction'
          }`}
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-button-primary text-text-inverse'
              : 'text-text-normal hover:bg-container-neutral-interaction'
          }`}
        >
          H3
        </button>
      </BubbleMenu>

      {/* FloatingMenu (슬래시 메뉴) */}
      <FloatingMenu
        editor={editor}
        tippyOptions={{
          duration: 100,
          placement: 'bottom-start',
          appendTo: () => containerRef.current ?? document.body,
        }}
        shouldShow={({ state }) => {
          const { $from } = state.selection;
          return ($from.nodeBefore?.textContent ?? '').endsWith('/');
        }}
      >
        {showSlashMenu && <SlashMenuContent editor={editor} onClose={closeSlashMenu} />}
      </FloatingMenu>

      {/* 에디터 본문 */}
      <div className="relative pl-14">
        <EditorContent
          editor={editor}
          className="prose prose-gray max-w-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_h1]:leading-(--h1-line-height) [&_.ProseMirror_h1]:text-(--h1-size) [&_.ProseMirror_h2]:leading-(--h2-line-height) [&_.ProseMirror_h2]:text-(--h2-size) [&_.ProseMirror_h3]:leading-(--h3-line-height) [&_.ProseMirror_h3]:text-(--h3-size) [&_.ProseMirror_p.is-empty::before]:pointer-events-none [&_.ProseMirror_p.is-empty::before]:float-left [&_.ProseMirror_p.is-empty::before]:h-0 [&_.ProseMirror_p.is-empty::before]:text-gray-400 [&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_ul[data-type=taskList]]:my-0 [&_.ProseMirror_ul[data-type=taskList]]:list-none [&_.ProseMirror_ul[data-type=taskList]_li]:my-0 [&_.ProseMirror_ul[data-type=taskList]_li]:flex [&_.ProseMirror_ul[data-type=taskList]_li]:items-center [&_.ProseMirror_ul[data-type=taskList]_li]:gap-3 [&_.ProseMirror>*]:my-3"
        />
      </div>
    </div>
  );
}
