'use client';

import { useEffect } from 'react';
import { EditorContent, FloatingMenu } from '@tiptap/react';
import { usePostEditor } from '@/hooks/board/usePostEditor';
import { useLinkPopup } from './useLinkPopup';
import { BubbleMenuBar } from './BubbleMenu';
import { TableMenu } from './TableMenu';
import { SlashMenuContent } from './SlashMenu';
import { LinkInput } from './LinkInput';
import { useInlineFileUpload } from '@/hooks/useInlineFileUpload';
import { BlockAddMenu } from './BlockAddMenu';
import { ImageInsertModeDialog } from './ImageInsertModeDialog';
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
  const {
    imageInputRef,
    fileInputRef,
    setEditor,
    processFilesInline,
    picker,
    handlers,
    pendingImageItems,
    confirmImageInsertMode,
    cancelImageInsertMode,
  } = useInlineFileUpload();

  const { editor, showSlashMenu, closeSlashMenu, containerRef } = usePostEditor({
    processFilesInline,
    initialContent,
  });

  // Wire the editor instance into the inline upload hook
  useEffect(() => {
    setEditor(editor);
  }, [editor, setEditor]);

  const {
    pos: linkInputPos,
    openFromSlashMenu,
    handleEditorClick,
    close: closeLinkInput,
  } = useLinkPopup(editor);

  if (!editor) return null;

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-[400px] w-full flex-1 flex-col"
      onDragOver={(e) => {
        // 에디터 콘텐츠 영역 밖(하단 빈 공간)에서도 파일 드롭을 허용
        if (Array.from(e.dataTransfer.types).includes('Files')) e.preventDefault();
      }}
      onDrop={(e) => {
        // TipTap(ProseMirror)이 이미 처리한 드롭은 defaultPrevented가 true → 스킵
        if (e.defaultPrevented) return;
        const files = e.dataTransfer?.files;
        if (!files || files.length === 0) return;
        e.preventDefault();
        // 드롭 좌표로 selection 설정. 좌표를 resolve하지 못하면 문서 끝으로 이동.
        const dropPos = editor.view.posAtCoords({ left: e.clientX, top: e.clientY });
        if (dropPos) {
          editor.commands.setTextSelection(dropPos.pos);
        } else {
          editor.commands.focus('end');
        }
        processFilesInline(Array.from(files));
      }}
    >
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
      <BlockAddMenu
        editor={editor}
        containerRef={containerRef}
        onImageUpload={picker.openImagePicker}
        onFileUpload={picker.openFilePicker}
      />

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

      <ImageInsertModeDialog
        open={pendingImageItems !== null}
        onIndividual={() => confirmImageInsertMode('individual')}
        onGroup={() => confirmImageInsertMode('group')}
        onCancel={cancelImageInsertMode}
      />
    </div>
  );
}
