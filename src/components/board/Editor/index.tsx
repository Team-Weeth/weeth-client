'use client';

import { EditorContent, FloatingMenu } from '@tiptap/react';
import { usePostEditor } from './usePostEditor';
import { BubbleMenuBar } from './EditorBubbleMenu';
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
  const { editor, showSlashMenu, closeSlashMenu, containerRef } = usePostEditor();

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative w-full">
      <BubbleMenuBar editor={editor} containerRef={containerRef} />

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

      <div className="relative pl-800">
        <EditorContent
          editor={editor}
          className="prose prose-gray max-w-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_h1]:leading-(--h1-line-height) [&_.ProseMirror_h1]:text-(--h1-size) [&_.ProseMirror_h2]:leading-(--h2-line-height) [&_.ProseMirror_h2]:text-(--h2-size) [&_.ProseMirror_h3]:leading-(--h3-line-height) [&_.ProseMirror_h3]:text-(--h3-size) [&_.ProseMirror_p.is-empty::before]:pointer-events-none [&_.ProseMirror_p.is-empty::before]:float-left [&_.ProseMirror_p.is-empty::before]:h-0 [&_.ProseMirror_p.is-empty::before]:text-gray-400 [&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_ul[data-type=taskList]]:my-0 [&_.ProseMirror_ul[data-type=taskList]]:list-none [&_.ProseMirror_ul[data-type=taskList]_li]:my-0 [&_.ProseMirror_ul[data-type=taskList]_li]:flex [&_.ProseMirror_ul[data-type=taskList]_li]:items-center [&_.ProseMirror_ul[data-type=taskList]_li]:gap-3 [&_.ProseMirror>*]:my-3"
        />
      </div>
    </div>
  );
}
