'use client';

import { useRef, useState } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { cn } from '@/lib/cn';
import { Loader2 } from 'lucide-react';
import { useImageResize, CORNER_STYLES, type Corner } from '@/hooks/board/useImageResize';
import { useToolbarPosition } from '@/hooks/board/useToolbarPosition';
import { ImageToolbar } from '../ImageToolbar';
import { GapZone } from '../GapZone';
import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import type { FullscreenImageViewerImage } from '@/components/ui/FullscreenImageViewer';
import { collectDocImages } from '@/utils/board/imageDocUtils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/Tooltip';

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
  const [sideDrop, setSideDrop] = useState<'left' | 'right' | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<FullscreenImageViewerImage[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerKey, setViewerKey] = useState(0);

  const { resizing, displayWidth, handleResizeStart } = useImageResize({
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

  const handleImageClick = () => {
    const nodePos = getPos();
    if (nodePos === undefined) return;
    const { images, clickedIndex } = collectDocImages(editor.state.doc, {
      kind: 'inline',
      pos: nodePos,
    });
    setViewerImages(images);
    setViewerIndex(clickedIndex);
    setViewerKey((k) => k + 1);
    setViewerOpen(true);
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
      <div
        className={cn('flex', alignClass)}
        data-drag-handle
        onDragOver={(e) => {
          if (!isEditable || !containerRef.current) return;
          const rect = containerRef.current.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const threshold = rect.width * 0.3;
          if (x < threshold) {
            e.preventDefault();
            setSideDrop('left');
          } else if (x > rect.width - threshold) {
            e.preventDefault();
            setSideDrop('right');
          } else {
            setSideDrop(null);
          }
        }}
        onDragLeave={() => setSideDrop(null)}
        onDrop={() => setSideDrop(null)}
      >
        <TooltipProvider>
          <Tooltip open={resizing && displayWidth !== null}>
            <TooltipTrigger asChild>
              <div
                ref={containerRef}
                className={cn(
                  'group relative m-200 inline-block',
                  !isEditable && !uploading && 'cursor-pointer',
                )}
                role={!isEditable && !uploading ? 'button' : undefined}
                tabIndex={!isEditable && !uploading ? 0 : undefined}
                aria-label={!isEditable && !uploading ? (alt ?? '이미지 보기') : undefined}
                onClick={!isEditable && !uploading ? handleImageClick : undefined}
                onKeyDown={
                  !isEditable && !uploading
                    ? (e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleImageClick();
                        }
                      }
                    : undefined
                }
              >
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
                    mode="image"
                    textAlign={textAlign}
                    toolbarBelow={toolbarBelow}
                    onAlign={(align) => updateAttributes({ textAlign: align })}
                    onDelete={deleteNode}
                  />
                )}

                {/* 사이드 드롭 인디케이터 */}
                {sideDrop === 'left' && (
                  <div className="bg-brand-primary pointer-events-none absolute inset-y-0 left-0 z-30 w-[2px]" />
                )}
                {sideDrop === 'right' && (
                  <div className="bg-brand-primary pointer-events-none absolute inset-y-0 right-0 z-30 w-[2px]" />
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
            </TooltipTrigger>
            <TooltipContent side="top" align="end" variant="sm">
              {displayWidth}px
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {!nodeAfter?.isTextblock && <GapZone isEditable={isEditable} onInsert={handleInsertAfter} />}

      <FullscreenImageViewer
        key={viewerKey}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        images={viewerImages}
        initialIndex={viewerIndex}
        showThumbnails
      />
    </NodeViewWrapper>
  );
}

export { InlineImageView };
