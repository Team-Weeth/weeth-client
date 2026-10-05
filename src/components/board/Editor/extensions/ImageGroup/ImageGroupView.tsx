'use client';

import { useState, useRef } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { TextSelection } from '@tiptap/pm/state';
import { cn } from '@/lib/cn';
import { Loader2, Trash2, X } from 'lucide-react';
import { GapZone } from '../GapZone';
import type { GroupImage } from './ImageGroup';
import { FullscreenImageViewer } from '@/components/ui/FullscreenImageViewer';
import type { FullscreenImageViewerImage } from '@/components/ui/FullscreenImageViewer';
import { collectDocImages } from '../imageDocUtils';
import { DROP_ZONE_WIDTH } from './imageGroupUtils';
import { useJustifiedLayout } from './useJustifiedLayout';
import { useSubSelection } from './useSubSelection';
import { useImageGroupDrop } from './useImageGroupDrop';
import { usePostStore } from '@/stores/usePostStore';

function ImageGroupView({ node, editor, selected, getPos, updateAttributes }: NodeViewProps) {
  const images = node.attrs.images as GroupImage[];
  const isEditable = editor.isEditable;

  const containerRef = useRef<HTMLDivElement>(null);

  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerImages, setViewerImages] = useState<FullscreenImageViewerImage[]>([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [viewerKey, setViewerKey] = useState(0);

  const { targetH, cellWidths, handleImageDimLoad } = useJustifiedLayout(
    images,
    isEditable,
    containerRef,
  );

  const { subSelectedIdx, setSubSelectedIdx, handleDoubleClick, handleContainerClick } =
    useSubSelection(isEditable, containerRef);

  const { dropIndicatorIdx } = useImageGroupDrop({
    containerRef,
    isEditable,
    images,
    editor,
    getPos,
    node,
    updateAttributes,
    setSubSelectedIdx,
  });

  const handleImageClick = (clickedGroupIdx: number) => {
    const groupPos = getPos();
    if (groupPos === undefined) return;
    const { images: viewerImgs, clickedIndex } = collectDocImages(editor.state.doc, {
      kind: 'group',
      pos: groupPos,
      idx: clickedGroupIdx,
    });
    setViewerImages(viewerImgs);
    setViewerIndex(clickedIndex);
    setViewerKey((k) => k + 1);
    setViewerOpen(true);
  };

  const updateImages = (newImages: GroupImage[]) => {
    if (newImages.length === 0) {
      const pos = getPos();
      editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
    } else if (newImages.length === 1) {
      const pos = getPos();
      const img = newImages[0];
      const inlineImageNode = editor.state.schema.nodes.inlineImage.create({
        src: img.src,
        alt: img.alt,
        width: img.width,
        uploadId: img.uploadId,
        uploading: img.uploading,
      });
      editor.view.dispatch(editor.state.tr.replaceWith(pos, pos + node.nodeSize, inlineImageNode));
    } else {
      updateAttributes({ images: newImages });
    }
    setSubSelectedIdx(null);
  };

  const handleSubDelete = (idx: number) => {
    const uploadId = images[idx].uploadId;
    if (uploadId) usePostStore.getState().removeFile(uploadId);
    updateImages(images.filter((_, i) => i !== idx));
  };

  const handleInsertBefore = () => {
    const pos = getPos();
    const { state } = editor;
    if (state.doc.resolve(pos).nodeBefore?.isTextblock) return;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(pos, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  const handleInsertAfter = () => {
    const pos = getPos();
    const insertAt = pos + node.nodeSize;
    const { state } = editor;
    if (state.doc.resolve(insertAt).nodeAfter?.isTextblock) return;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(insertAt, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(insertAt + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  // getPos()는 ProseMirror view 업데이트 중 stale 위치를 반환할 수 있으므로 안전하게 resolve
  let nodeBefore: ReturnType<typeof editor.state.doc.resolve>['nodeBefore'] = null;
  let nodeAfter: ReturnType<typeof editor.state.doc.resolve>['nodeAfter'] = null;
  try {
    const pos = getPos();
    nodeBefore = editor.state.doc.resolve(pos).nodeBefore;
    nodeAfter = editor.state.doc.resolve(pos + node.nodeSize).nodeAfter;
  } catch {
    // Position stale during mid-update re-render — skip GapZone logic
  }

  return (
    <NodeViewWrapper
      className={cn(
        'w-full',
        // textblock 인접 시 GapZone이 숨겨지므로, figure margin(spacing-400)에 맞춰 여백 보정
        nodeBefore?.isTextblock && 'mt-400',
        nodeAfter?.isTextblock && 'mb-400',
      )}
    >
      {!nodeBefore?.isTextblock && (
        <GapZone isEditable={isEditable} onInsert={handleInsertBefore} />
      )}

      <div
        ref={containerRef}
        className={cn(
          'relative flex w-full',
          // items-stretch는 CSS 기본값이지만, justified 미확정 시 placeholder 방식 사용
          !targetH && 'items-stretch',
          isEditable && 'cursor-grab',
          !isEditable && 'gap-200',
        )}
        style={targetH !== null ? { height: targetH } : undefined}
        {...(subSelectedIdx === null ? { 'data-drag-handle': '' } : {})}
        onClick={handleContainerClick}
      >
        {/* 그룹 선택 링: DropZoneLine 영역을 제외한 실제 이미지 범위에만 표시 */}
        {selected && isEditable && subSelectedIdx === null && (
          <div
            className="ring-brand-primary pointer-events-none absolute rounded-sm ring-2"
            style={{
              top: 0,
              bottom: 0,
              left: isEditable ? DROP_ZONE_WIDTH : 0,
              right: isEditable ? DROP_ZONE_WIDTH : 0,
            }}
          />
        )}

        {/* 그룹 선택 시 삭제 툴바 */}
        {selected && isEditable && subSelectedIdx === null && (
          <div className="border-line bg-container-neutral absolute bottom-full left-1/2 z-20 mb-200 flex -translate-x-1/2 items-center rounded-md border p-100 shadow-md">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                images.forEach((img) => {
                  if (img.uploadId) usePostStore.getState().removeFile(img.uploadId);
                });
                editor.chain().focus().deleteSelection().run();
              }}
              className="text-state-error hover:bg-container-neutral-interaction cursor-pointer rounded px-200 py-100 transition-colors"
              aria-label="이미지 그룹 삭제"
            >
              <Trash2 size={15} />
            </button>
          </div>
        )}

        <DropZoneLine idx={0} active={dropIndicatorIdx === 0} isEditable={isEditable} />

        {images.map((image, idx) => (
          <div
            key={image.uploadId ?? image.src}
            className={cn('flex', !cellWidths && 'min-w-0 flex-1')}
            style={cellWidths ? { width: cellWidths[idx] } : undefined}
          >
            <div
              data-group-image
              data-cell-idx={idx}
              className={cn(
                'relative flex-1 overflow-hidden rounded-sm',
                subSelectedIdx === idx && 'ring-brand-primary ring-2',
                !isEditable && 'cursor-pointer',
              )}
              onClick={!isEditable ? () => handleImageClick(idx) : undefined}
              onDoubleClick={(e) => handleDoubleClick(e, idx)}
              draggable={subSelectedIdx === idx && isEditable}
            >
              {/*
                크기 미확정 시 폴백:
                hidden placeholder img(w-full h-auto)로 셀 높이를 결정하고,
                absolute display img(object-cover)로 채움.
                onLoad에서 자연 크기를 기록 → 전체 로드 완료 후 justified 전환.
              */}
              {!cellWidths && (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt=""
                    aria-hidden="true"
                    className="pointer-events-none block w-full opacity-0 select-none"
                    draggable={false}
                    onLoad={(e) => handleImageDimLoad(image.src, e)}
                  />
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.src}
                    alt={image.alt ?? ''}
                    className={cn(
                      'absolute inset-0 h-full w-full object-cover',
                      image.uploading && 'opacity-60',
                    )}
                    draggable={false}
                  />
                </>
              )}

              {/*
                Justified 레이아웃:
                셀 크기 = targetH × (w/h) → 자연 비율과 정확히 일치.
                w-full h-full로 채우면 object-fit 불필요 → 크롭 없음.
              */}
              {cellWidths && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={image.src}
                  alt={image.alt ?? ''}
                  className={cn('h-full w-full', image.uploading && 'opacity-60')}
                  draggable={false}
                />
              )}

              {/* 업로드 중 오버레이 */}
              {image.uploading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/30">
                  <Loader2 className="size-8 animate-spin text-white" />
                </div>
              )}

              {/* Sub-selection delete button */}
              {subSelectedIdx === idx && isEditable && (
                <button
                  type="button"
                  className="bg-state-error absolute top-200 right-200 z-20 flex size-5 items-center justify-center rounded-full text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSubDelete(idx);
                  }}
                  aria-label="이미지 삭제"
                >
                  <X className="size-3" />
                </button>
              )}
            </div>

            <DropZoneLine
              idx={idx + 1}
              active={dropIndicatorIdx === idx + 1}
              isEditable={isEditable}
            />
          </div>
        ))}
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

interface DropZoneLineProps {
  idx: number;
  active: boolean;
  isEditable: boolean;
}

function DropZoneLine({ idx, active, isEditable }: DropZoneLineProps) {
  if (!isEditable) return null;

  return (
    <div data-drop-idx={idx} className="relative z-10 h-full w-300 shrink-0">
      {active && (
        <div className="bg-brand-primary absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2" />
      )}
    </div>
  );
}

export { ImageGroupView };
