'use client';

import { EditorContent, FloatingMenu } from '@tiptap/react';
import { usePostEditor } from './usePostEditor';
import { BubbleMenuBar } from './BubbleMenu';
import { SlashMenuContent } from './SlashMenu';
import { ImageList } from '../ImageList';
import { FileList } from '../FileList';
import { useFileUpload } from '@/hooks/useFileUpload';
import { createMediaItems } from '@/constants/board/slashMenu';

const floatingMenuTippyOptions = {
  duration: 100,
  placement: 'bottom-start' as const,
  appendTo: () => document.body,
  popperOptions: {
    modifiers: [
      {
        name: 'flip',
        options: {
          boundary: 'clippingParents',
          rootBoundary: 'viewport',
          fallbackPlacements: ['top-start'],
          padding: 16,
        },
      },
      {
        name: 'preventOverflow',
        options: {
          boundary: 'clippingParents',
          rootBoundary: 'viewport',
          padding: 16,
        },
      },
    ],
  },
};

/**
 * 주요 기능:
 * Tiptap 기반 에디터 컴포넌트
 *
 * - Slash Menu (/)
 * - Bubble Menu (텍스트 선택 시)
 * - 커스텀 키보드 단축키 (` 인라인 코드, Backspace 블록 정리)
 * - 이미지 붙여넣기 (Ctrl+V) 및 드래그앤드롭
 */

interface EditorProps {
  initialContent?: string;
}

export default function Editor({ initialContent }: EditorProps = {}) {
  const { imageInputRef, fileInputRef, processFiles, picker, files, handlers } = useFileUpload();
  const { editor, showSlashMenu, closeSlashMenu, containerRef } = usePostEditor({
    processFiles,
    initialContent,
  });

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative flex min-h-[400px] w-full flex-col">
      {/* 숨겨진 파일 input — 슬래시 메뉴에서 각 ref를 통해 트리거 */}
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlers.handleInputChange}
        aria-hidden="true"
      />
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handlers.handleInputChange}
        aria-hidden="true"
      />

      <BubbleMenuBar editor={editor} containerRef={containerRef} />

      <FloatingMenu
        editor={editor}
        tippyOptions={floatingMenuTippyOptions}
        shouldShow={({ state }) => {
          const { $from } = state.selection;
          const text = $from.nodeBefore?.textContent ?? '';
          return /(?:^|\s)\/[^\s]*$/.test(text);
        }}
      >
        {showSlashMenu && (
          <SlashMenuContent
            editor={editor}
            onClose={closeSlashMenu}
            extraGroups={[
              {
                title: '미디어',
                items: createMediaItems(picker.openImagePicker, picker.openFilePicker),
              },
            ]}
          />
        )}
      </FloatingMenu>

      <div className="relative">
        <EditorContent editor={editor} className="max-w-none" />
      </div>

      {/* 게시글 하단 첨부 영역 */}
      <div className="mt-auto flex flex-col gap-400 pt-400">
        <ImageList files={files.imageFiles} removable onRemove={files.handleRemoveFile} />
        <FileList files={files.nonImageFiles} onRemove={files.handleRemoveFile} editable />
      </div>
    </div>
  );
}
