'use client';

import { EditorContent, FloatingMenu } from '@tiptap/react';
import { usePostEditor } from './usePostEditor';
import { BubbleMenuBar } from './EditorBubbleMenu';
import { SlashMenuContent } from './SlashMenu';
import { ImageList } from '../ImageList';
import { FileList } from '../FileList';
import { useFileUpload } from '@/hooks/useFileUpload';
import { createMediaItems } from '@/constants/editor';

/**
 * 주요 기능:
 * Tiptap 기반 에디터 컴포넌트
 *
 * - Slash Menu (/)
 * - Bubble Menu (텍스트 선택 시)
 * - 커스텀 키보드 단축키 (` 인라인 코드, Backspace 블록 정리)
 * - 이미지 붙여넣기 (Ctrl+V) 및 드래그앤드롭
 */

export default function Editor() {
  const { imageInputRef, fileInputRef, processFiles, picker, files, handlers } = useFileUpload();
  const { editor, showSlashMenu, closeSlashMenu, containerRef } = usePostEditor({
    processFiles,
  });

  const mediaGroups = [
    { title: '미디어', items: createMediaItems(picker.openImagePicker, picker.openFilePicker) },
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative w-full" onDragOver={handleDragOver} onDrop={handleDrop}>
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
        tippyOptions={{
          duration: 100,
          placement: 'bottom-start',
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
        }}
        shouldShow={({ state }) => {
          const { $from } = state.selection;
          const text = $from.nodeBefore?.textContent ?? '';
          return /(?:^|\s)\/[^\s]*$/.test(text);
        }}
      >
        {showSlashMenu && (
          <SlashMenuContent editor={editor} onClose={closeSlashMenu} extraGroups={mediaGroups} />
        )}
      </FloatingMenu>

      <div className="relative px-500">
        <EditorContent
          editor={editor}
          className="prose prose-gray max-w-none [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:focus:outline-none [&_.ProseMirror_h1]:leading-(--h1-line-height) [&_.ProseMirror_h1]:text-(--h1-size) [&_.ProseMirror_h2]:leading-(--h2-line-height) [&_.ProseMirror_h2]:text-(--h2-size) [&_.ProseMirror_h3]:leading-(--h3-line-height) [&_.ProseMirror_h3]:text-(--h3-size) [&_.ProseMirror_p.is-empty::before]:pointer-events-none [&_.ProseMirror_p.is-empty::before]:float-left [&_.ProseMirror_p.is-empty::before]:h-0 [&_.ProseMirror_p.is-empty::before]:text-gray-400 [&_.ProseMirror_p.is-empty::before]:content-[attr(data-placeholder)] [&_.ProseMirror_ul[data-type=taskList]]:my-0 [&_.ProseMirror_ul[data-type=taskList]]:list-none [&_.ProseMirror_ul[data-type=taskList]_li]:my-0 [&_.ProseMirror_ul[data-type=taskList]_li]:flex [&_.ProseMirror_ul[data-type=taskList]_li]:items-center [&_.ProseMirror_ul[data-type=taskList]_li]:gap-300 [&_.ProseMirror>*]:my-300"
        />

        {/* 게시글 하단 첨부 영역 */}
        <div className="flex flex-col gap-400">
          <ImageList files={files.imageFiles} removable onRemove={files.handleRemoveFile} />
          <FileList files={files.nonImageFiles} onRemove={files.handleRemoveFile} removable />
        </div>
      </div>
    </div>
  );
}
