'use client';

import { useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';
import { useImageResize, CORNER_STYLES, type Corner } from './useImageResize';
import { useToolbarPosition } from './useToolbarPosition';
import { ImageToolbar } from './ImageToolbar';
import { GapZone } from './GapZone';

function InlineImageView({
  node,
  updateAttributes,
  selected,
  editor,
  deleteNode,
  getPos,
}: NodeViewProps) {
  const { src, alt, textAlign, width, uploading } = node.attrs;
  const imgRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isEditable = editor.isEditable;

  const { resizing, handleResizeStart } = useImageResize({
    imgRef,
    width,
    updateAttributes,
    editor,
  });

  const { toolbarBelow, nodeBefore, nodeAfter } = useToolbarPosition({
    isEditable,
    getPos,
    editor,
    nodeSize: node.nodeSize,
    containerRef,
  });

  const handleInsertBefore = () => {
    if (nodeBefore?.isTextblock) return;
    const pos = getPos();
    const { state } = editor;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(pos, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  const handleInsertAfter = () => {
    if (nodeAfter?.isTextblock) return;
    const pos = getPos();
    const insertAt = pos + node.nodeSize;
    const { state } = editor;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(insertAt, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(insertAt + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  const alignClass =
    textAlign === 'left'
      ? 'justify-start'
      : textAlign === 'right'
        ? 'justify-end'
        : 'justify-center';

  const showHandles = isEditable && (selected || resizing);

  return (
    <NodeViewWrapper className="w-full">
      {!nodeBefore?.isTextblock && (
        <GapZone isEditable={isEditable} onInsert={handleInsertBefore} />
      )}

      {/* 이미지 본체 */}
      <div className={cn('flex', alignClass)} data-drag-handle>
        <div ref={containerRef} className="group relative m-200 inline-block">
          {/* 업로드 중 오버레이 */}
          {uploading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center rounded-sm bg-black/30">
              <Loader2 className="size-8 animate-spin text-white" />
            </div>
          )}

          {/* blob URL / 외부 S3 URL을 모두 지원해야 하므로 next/image 사용 불가 */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt={alt ?? ''}
            width={width ?? undefined}
            className={cn(
              'max-w-full rounded-sm',
              isEditable && 'cursor-grab',
              uploading && 'opacity-60',
              showHandles && 'ring-brand-primary ring-2',
            )}
            draggable={false}
          />

          {/* 선택 시 정렬/삭제 툴바 — 상단 공간 부족 시 아래 표시 */}
          {selected && isEditable && !resizing && (
            <ImageToolbar
              textAlign={textAlign}
              toolbarBelow={toolbarBelow}
              onAlign={(align) => updateAttributes({ textAlign: align })}
              onDelete={deleteNode}
            />
          )}

          {/* 4 꼭짓점 리사이즈 핸들 */}
          {showHandles &&
            (Object.keys(CORNER_STYLES) as Corner[]).map((corner) => (
              <div
                key={corner}
                className={cn('absolute z-20', CORNER_STYLES[corner])}
                onPointerDown={handleResizeStart(corner)}
                aria-label="이미지 크기 조절"
              >
                <div className="border-brand-primary size-[10px] border-2 bg-white shadow-sm" />
              </div>
            ))}
        </div>
      </div>

      {!nodeAfter?.isTextblock && (
        <GapZone isEditable={isEditable} onInsert={handleInsertAfter} />
      )}
    </NodeViewWrapper>
  );
}

export { InlineImageView };
