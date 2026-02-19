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
import { useState, useRef } from 'react';
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
  const containerRef = useRef<HTMLDivElement>(null);

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
      const currentLineText = $from.nodeBefore?.textContent ?? '';

      setShowSlashMenu(currentLineText.endsWith('/'));
    },
    editorProps: {
      handleKeyDown: (view, event) => {
        // 슬래시 메뉴 우선 처리
        if (showSlashMenu) {
          if (event.key === 'Enter') {
            event.preventDefault();
            return true;
          }

          if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
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

        // Backspace UX 개선 (빈 리스트 아이템/헤딩 → 일반 단락으로 전환)
        if (event.key === 'Backspace') {
          if ($from.parentOffset === 0 && $from.parent.textContent === '') {
            if ($from.parent.type.name === 'listItem') {
              const depth = $from.depth;
              const pos = $from.before(depth);

              view.dispatch(state.tr.setBlockType(pos, pos, state.schema.nodes.paragraph));
              return true;
            }
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
        className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-white p-1 shadow-md"
      >
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleBold().run();
          }}
          className={`rounded px-2 py-1 text-sm font-bold transition-colors ${
            editor.isActive('bold') ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          B
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleItalic().run();
          }}
          className={`rounded px-2 py-1 text-sm italic transition-colors ${
            editor.isActive('italic') ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          I
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleCode().run();
          }}
          className={`rounded px-2 py-1 font-mono text-sm transition-colors ${
            editor.isActive('code') ? 'bg-gray-900 text-white' : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {'<>'}
        </button>
        <div className="mx-1 h-4 w-px bg-gray-200" />
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive('heading', { level: 1 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H1
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive('heading', { level: 2 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          H2
        </button>
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            editor.chain().focus().toggleHeading({ level: 3 }).run();
          }}
          className={`rounded px-2 py-1 text-sm transition-colors ${
            editor.isActive('heading', { level: 3 })
              ? 'bg-gray-900 text-white'
              : 'text-gray-700 hover:bg-gray-100'
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
          const isSlash = ($from.nodeBefore?.textContent ?? '').endsWith('/');
          setShowSlashMenu(isSlash);
          return isSlash;
        }}
      >
        {showSlashMenu && (
          <SlashMenuContent editor={editor} onClose={() => setShowSlashMenu(false)} />
        )}
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
