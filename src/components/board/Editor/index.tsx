'use client';

import { EditorContent, FloatingMenu } from '@tiptap/react';
import { usePostEditor } from './usePostEditor';
import { useLinkPopup } from './useLinkPopup';
import { BubbleMenuBar } from './BubbleMenu';
import { TableMenu } from './TableMenu';
import { SlashMenuContent } from './SlashMenu';
import { LinkInput } from './LinkInput';
import { ImageList } from '../ImageList';
import { FileList } from '../FileList';
import { useFileUpload } from '@/hooks/useFileUpload';
import { createMediaItems, createLinkItem } from '@/constants/board/slashMenu';

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

interface EditorProps {
  initialContent?: string;
}

export default function Editor({ initialContent }: EditorProps = {}) {
  const { imageInputRef, fileInputRef, processFiles, picker, files, handlers } = useFileUpload();
  const { editor, showSlashMenu, closeSlashMenu, containerRef } = usePostEditor({
    processFiles,
    initialContent,
  });
  const {
    pos: linkInputPos,
    openFromSlashMenu,
    handleEditorClick,
    close: closeLinkInput,
  } = useLinkPopup(editor);

  if (!editor) return null;

  return (
    <div ref={containerRef} className="relative flex min-h-[400px] w-full flex-col overflow-hidden">
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
      <TableMenu editor={editor} containerRef={containerRef} />

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
                items: [
                  ...createMediaItems(picker.openImagePicker, picker.openFilePicker),
                  createLinkItem(openFromSlashMenu),
                ],
              },
            ]}
          />
        )}
      </FloatingMenu>

      {linkInputPos && (
        <div className="fixed z-50" style={{ top: linkInputPos.top, left: linkInputPos.left }}>
          <LinkInput editor={editor} onClose={closeLinkInput} />
        </div>
      )}

      <div className="relative" onClick={handleEditorClick}>
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
