'use client';

import { useState, useRef, useEffect } from 'react';
import { NodeViewWrapper } from '@tiptap/react';
import type { NodeViewProps } from '@tiptap/react';
import { NodeSelection, TextSelection, type Transaction } from '@tiptap/pm/state';
import { Slice, Fragment } from '@tiptap/pm/model';
import { cn } from '@/lib/cn';
import { Loader2, X } from 'lucide-react';
import { GapZone } from '../GapZone';
import { MAX_GROUP_IMAGES } from './ImageGroup';
import type { GroupImage } from './ImageGroup';

const SUB_DRAG_TYPE = 'application/x-image-sub-drag';
// w-300 = var(--spacing-300) = 12px (DropZoneLine 너비)
const DROP_ZONE_WIDTH = 12;

type Dim = { w: number; h: number };

function ImageGroupView({ node, editor, selected, getPos, updateAttributes }: NodeViewProps) {
  const images = node.attrs.images as GroupImage[];
  const isEditable = editor.isEditable;

  const [subSelectedIdx, setSubSelectedIdx] = useState<number | null>(null);
  const [dropIndicatorIdx, setDropIndicatorIdx] = useState<number | null>(null);
  // src → 자연 크기 캐시 (이미지 재정렬 시에도 재측정 불필요)
  const [dimsBySrc, setDimsBySrc] = useState<Record<string, Dim>>({});
  const [containerWidth, setContainerWidth] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  // Capture view in a ref so event handlers always see the latest instance
  const pmViewRef = useRef(editor.view);
  useEffect(() => {
    pmViewRef.current = editor.view;
  });

  // 서브 선택 중 컨테이너 바깥 클릭 시 선택 해제
  useEffect(() => {
    if (subSelectedIdx === null) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSubSelectedIdx(null);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [subSelectedIdx]);

  // 컨테이너 너비 추적 (justified layout 계산용)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    setContainerWidth(el.getBoundingClientRect().width);
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) setContainerWidth(entry.contentRect.width);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // 이미지 자연 크기 기록
  const handleImageDimLoad = (src: string, e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (img.naturalWidth > 0 && img.naturalHeight > 0) {
      setDimsBySrc((prev) => {
        if (prev[src]) return prev;
        return { ...prev, [src]: { w: img.naturalWidth, h: img.naturalHeight } };
      });
    }
  };

  // Justified layout 계산
  // 편집 모드: DropZoneLine(12px) × (N+1)개가 공간을 차지함
  const dropZoneOverhead = isEditable ? DROP_ZONE_WIDTH * (images.length + 1) : 0;
  const allDimsLoaded = containerWidth > 0 && images.every((img) => dimsBySrc[img.src]);
  let targetH: number | null = null;
  let cellWidths: number[] | null = null;
  if (allDimsLoaded && images.length > 0) {
    const aspectSum = images.reduce((sum, img) => {
      const d = dimsBySrc[img.src]!;
      return sum + d.w / d.h;
    }, 0);
    targetH = (containerWidth - dropZoneOverhead) / aspectSum;
    // 각 flex-wrapper 너비 = 이미지 너비 + (편집 모드면 내부 DropZone 너비 포함)
    cellWidths = images.map((img) => {
      const d = dimsBySrc[img.src]!;
      return targetH! * (d.w / d.h) + (isEditable ? DROP_ZONE_WIDTH : 0);
    });
  }

  const updateImages = (newImages: GroupImage[]) => {
    if (newImages.length === 0) {
      // Delete the whole group
      const pos = getPos();
      editor.view.dispatch(editor.state.tr.delete(pos, pos + node.nodeSize));
    } else if (newImages.length === 1) {
      // Ungroup: replace with single inlineImage
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
    const newImages = images.filter((_, i) => i !== idx);
    updateImages(newImages);
  };

  const handleDoubleClick = (e: React.MouseEvent, idx: number) => {
    if (!isEditable) return;
    e.stopPropagation();
    setSubSelectedIdx(idx);
  };

  const handleContainerClick = (e: React.MouseEvent) => {
    // Click on container (not on an image) clears sub-selection
    if ((e.target as HTMLElement).closest('[data-group-image]')) return;
    setSubSelectedIdx(null);
  };

  const handleSubDragStart = (e: React.DragEvent, idx: number) => {
    // ProseMirror의 그룹 드래그 핸들러까지 버블링되지 않도록 차단
    e.stopPropagation();

    const image = images[idx];
    e.dataTransfer.setData(
      SUB_DRAG_TYPE,
      JSON.stringify({
        image,
        sourceGroupPos: getPos(),
        sourceIdx: idx,
      }),
    );
    e.dataTransfer.effectAllowed = 'move';

    // Set view.dragging so Dropcursor works
    // Use pmViewRef.current (not editor.view) to satisfy React Compiler's no-prop-mutation rule
    const inlineImageNode = editor.state.schema.nodes.inlineImage.create({
      src: image.src,
      alt: image.alt,
      width: image.width,
      uploadId: image.uploadId,
      uploading: image.uploading,
    });
    const pmView = pmViewRef.current as unknown as { dragging: unknown };
    pmView.dragging = {
      slice: new Slice(Fragment.from(inlineImageNode), 0, 0),
      move: true,
    };
  };

  const handleInternalDrop = (dataTransfer: DataTransfer, dropIdx: number) => {
    setDropIndicatorIdx(null);

    const subDragData = dataTransfer.getData(SUB_DRAG_TYPE);

    if (subDragData) {
      // 그룹 내부 또는 그룹 간 이미지 이동 (서브 드래그)
      const { image, sourceGroupPos, sourceIdx } = JSON.parse(subDragData) as {
        image: GroupImage;
        sourceGroupPos: number;
        sourceIdx: number;
      };

      const currentPos = getPos();

      if (sourceGroupPos === currentPos) {
        // Reorder within same group
        const newImages = [...images];
        newImages.splice(sourceIdx, 1);
        const adjustedIdx = dropIdx > sourceIdx ? dropIdx - 1 : dropIdx;
        newImages.splice(adjustedIdx, 0, image);
        updateAttributes({ images: newImages });
      } else {
        // Add from another group — reject if already full
        if (images.length >= MAX_GROUP_IMAGES) return;
        const newImages = [...images];
        newImages.splice(dropIdx, 0, image);
        updateAttributes({ images: newImages });

        // Remove from source group
        removeImageFromGroup(
          { state: editor.state, dispatch: (tr) => editor.view.dispatch(tr) },
          sourceGroupPos,
          sourceIdx,
        );
      }

      setSubSelectedIdx(null);
      return;
    }

    // 독립 inlineImage를 DropZoneLine에 직접 드롭 (그룹에 추가)
    const pmView = pmViewRef.current as unknown as {
      dragging?: {
        slice?: {
          content?: { firstChild?: { type: { name: string }; attrs: Record<string, unknown> } };
        };
      };
    };
    const draggedNode = pmView.dragging?.slice?.content?.firstChild;
    if (!draggedNode || draggedNode.type.name !== 'inlineImage') return;
    if (images.length >= MAX_GROUP_IMAGES) return;

    const newImage: GroupImage = {
      src: draggedNode.attrs.src as string,
      alt: (draggedNode.attrs.alt as string) ?? null,
      width: (draggedNode.attrs.width as number) ?? null,
      uploadId: (draggedNode.attrs.uploadId as string) ?? null,
      uploading: (draggedNode.attrs.uploading as boolean) ?? false,
    };
    const newImages = [...images];
    newImages.splice(dropIdx, 0, newImage);

    // 그룹 업데이트 + 소스 삭제를 하나의 트랜잭션으로 처리
    const groupPos = getPos();
    let sourcePos: number | null = null;
    let sourceNodeSize = 0;
    editor.state.doc.descendants((n, pos) => {
      if (sourcePos !== null) return false;
      if (n.type.name === 'inlineImage' && (n.attrs.src as string) === newImage.src) {
        sourcePos = pos;
        sourceNodeSize = n.nodeSize;
        return false;
      }
    });

    if (sourcePos === null) return;

    const tr = editor.state.tr.setNodeMarkup(groupPos, undefined, {
      ...node.attrs,
      images: newImages,
    });
    // setNodeMarkup은 크기를 변경하지 않으므로 mapping은 항등 변환
    const mappedSource = tr.mapping.map(sourcePos);
    tr.delete(mappedSource, mappedSource + sourceNodeSize);
    // 삭제된 소스가 선택 중이면 syncNodeSelection 충돌 → 그룹으로 안전하게 이동
    const mappedGroup = tr.mapping.map(groupPos);
    tr.setSelection(NodeSelection.create(tr.doc, mappedGroup));
    editor.view.dispatch(tr);
    setSubSelectedIdx(null);
  };

  // handleInternalDrop을 ref로 유지 → 네이티브 핸들러에서 최신 클로저 접근
  const handleDropRef = useRef(handleInternalDrop);
  useEffect(() => {
    handleDropRef.current = handleInternalDrop;
  });

  // Native dragover/dragleave/drop: React 이벤트 위임은 React root에서 처리되므로
  // view.dom의 dropcursor보다 늦게 실행됨. 네이티브 핸들러로 view.dom 도달 전에 차단.
  useEffect(() => {
    const el = containerRef.current;
    if (!el || !isEditable) return;

    const resolveDropIdx = (e: DragEvent): number | null => {
      const target = e.target as HTMLElement;
      const dropZone = target.closest('[data-drop-idx]') as HTMLElement | null;
      const imageCell = target.closest('[data-cell-idx]') as HTMLElement | null;

      if (dropZone) return Number(dropZone.dataset.dropIdx);
      if (imageCell) {
        const rect = imageCell.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const cellIdx = Number(imageCell.dataset.cellIdx);
        return x < rect.width / 2 ? cellIdx : cellIdx + 1;
      }
      return null;
    };

    // stopPropagation은 새 dragover가 view.dom에 도달하는 것만 막을 뿐,
    // 컨테이너 진입 직전에 설정된 dropcursor는 그대로 남음.
    // view.dom에 synthetic dragleave를 발행하여 dropcursor를 강제 해제.
    const clearDropcursor = () => {
      pmViewRef.current.dom.dispatchEvent(new DragEvent('dragleave', { bubbles: false }));
    };

    const onNativeDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      clearDropcursor();
      const idx = resolveDropIdx(e);
      if (idx !== null) setDropIndicatorIdx(idx);
    };

    const onNativeDragLeave = (e: DragEvent) => {
      if (!el.contains(e.relatedTarget as Node)) {
        setDropIndicatorIdx(null);
      }
    };

    const onNativeDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const idx = resolveDropIdx(e);
      if (idx !== null && e.dataTransfer) {
        handleDropRef.current(e.dataTransfer, idx);
      }
      setDropIndicatorIdx(null);
    };

    el.addEventListener('dragover', onNativeDragOver);
    el.addEventListener('dragleave', onNativeDragLeave);
    el.addEventListener('drop', onNativeDrop);
    return () => {
      el.removeEventListener('dragover', onNativeDragOver);
      el.removeEventListener('dragleave', onNativeDragLeave);
      el.removeEventListener('drop', onNativeDrop);
    };
  }, [isEditable]);

  // Insert paragraph before
  const handleInsertBefore = () => {
    const pos = getPos();
    const { state } = editor;
    const resolved = state.doc.resolve(pos);
    if (resolved.nodeBefore?.isTextblock) return;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(pos, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(pos + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  // Insert paragraph after
  const handleInsertAfter = () => {
    const pos = getPos();
    const insertAt = pos + node.nodeSize;
    const { state } = editor;
    const resolved = state.doc.resolve(insertAt);
    if (resolved.nodeAfter?.isTextblock) return;
    const paragraph = state.schema.nodes.paragraph.create();
    const tr = state.tr.insert(insertAt, paragraph);
    tr.setSelection(TextSelection.near(tr.doc.resolve(insertAt + 1)));
    editor.view.dispatch(tr);
    editor.view.focus();
  };

  // Check before/after nodes for GapZone
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
        )}
        style={targetH !== null ? { height: targetH } : undefined}
        {...(subSelectedIdx === null ? { 'data-drag-handle': '' } : {})}
        onClick={handleContainerClick}
      >
        {/* 그룹 선택 링: DropZoneLine 영역을 제외한 실제 이미지 범위에만 표시 */}
        {selected && subSelectedIdx === null && (
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
        {/* Leading drop zone */}
        <DropZoneLine idx={0} active={dropIndicatorIdx === 0} isEditable={isEditable} />

        {images.map((image, idx) => (
          <div
            key={`${image.src}-${idx}`}
            className={cn('flex', !cellWidths && 'min-w-0 flex-1')}
            style={cellWidths ? { width: cellWidths[idx] } : undefined}
          >
            <div
              data-group-image
              data-cell-idx={idx}
              className={cn(
                'relative flex-1 overflow-hidden rounded-sm',
                subSelectedIdx === idx && 'ring-brand-primary ring-2',
              )}
              onDoubleClick={(e) => handleDoubleClick(e, idx)}
              draggable={subSelectedIdx === idx && isEditable}
              onDragStart={subSelectedIdx === idx ? (e) => handleSubDragStart(e, idx) : undefined}
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
                셀 크기 = targetH × (w/h) × targetH → 자연 비율과 정확히 일치.
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

            {/* Drop zone after this image */}
            <DropZoneLine
              idx={idx + 1}
              active={dropIndicatorIdx === idx + 1}
              isEditable={isEditable}
            />
          </div>
        ))}
      </div>

      {!nodeAfter?.isTextblock && <GapZone isEditable={isEditable} onInsert={handleInsertAfter} />}
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

interface ViewLike {
  state: {
    doc: { nodeAt: (pos: number) => ReturnType<NodeViewProps['editor']['state']['doc']['nodeAt']> };
    tr: NodeViewProps['editor']['state']['tr'];
    schema: NodeViewProps['editor']['state']['schema'];
  };
  dispatch: (tr: Transaction) => void;
}

function removeImageFromGroup(view: ViewLike, groupPos: number, imageIdx: number) {
  const groupNode = view.state.doc.nodeAt(groupPos);
  if (!groupNode || groupNode.type.name !== 'imageGroup') return;

  const images = [...(groupNode.attrs.images as GroupImage[])];
  images.splice(imageIdx, 1);

  if (images.length === 0) {
    view.dispatch(view.state.tr.delete(groupPos, groupPos + groupNode.nodeSize));
  } else if (images.length === 1) {
    const img = images[0];
    const inlineImageNode = view.state.schema.nodes.inlineImage.create({
      src: img.src,
      alt: img.alt,
      width: img.width,
      uploadId: img.uploadId,
      uploading: img.uploading,
    });
    view.dispatch(
      view.state.tr.replaceWith(groupPos, groupPos + groupNode.nodeSize, inlineImageNode),
    );
  } else {
    view.dispatch(
      view.state.tr.setNodeMarkup(groupPos, undefined, {
        ...groupNode.attrs,
        images,
      }),
    );
  }
}

export { ImageGroupView, SUB_DRAG_TYPE, removeImageFromGroup };
export type { ViewLike };
