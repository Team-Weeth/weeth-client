'use client';

import { useState, useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import type { EditorView } from '@tiptap/pm/view';
import type { NodeViewProps } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import { Slice, Fragment } from '@tiptap/pm/model';
import { MAX_GROUP_IMAGES } from './ImageGroup';
import type { GroupImage } from './ImageGroup';
import { SUB_DRAG_TYPE, removeImageFromGroup } from './imageGroupUtils';

interface UseImageGroupDropOptions {
  containerRef: RefObject<HTMLDivElement | null>;
  isEditable: boolean;
  images: GroupImage[];
  editor: Editor;
  getPos: () => number;
  node: NodeViewProps['node'];
  updateAttributes: NodeViewProps['updateAttributes'];
  setSubSelectedIdx: (idx: number | null) => void;
}

interface UseImageGroupDropResult {
  dropIndicatorIdx: number | null;
  pmViewRef: RefObject<EditorView>;
  handleSubDragStart: (e: React.DragEvent, idx: number) => void;
}

/**
 * imageGroup 의 드래그/드롭을 담당한다.
 *
 * - handleSubDragStart: 그룹 내 이미지의 서브 드래그 시작
 * - 네이티브 dragover/dragleave/drop 이벤트 바인딩 (React 이벤트 위임보다 먼저 실행)
 * - handleInternalDrop: 서브드래그 재정렬, 그룹 간 이동, 독립 inlineImage 흡수
 */
export function useImageGroupDrop({
  containerRef,
  isEditable,
  images,
  editor,
  getPos,
  node,
  updateAttributes,
  setSubSelectedIdx,
}: UseImageGroupDropOptions): UseImageGroupDropResult {
  const [dropIndicatorIdx, setDropIndicatorIdx] = useState<number | null>(null);

  // Capture view in a ref so event handlers always see the latest instance
  const pmViewRef = useRef(editor.view);
  useEffect(() => {
    pmViewRef.current = editor.view;
  });

  // ProseMirror의 그룹 드래그 핸들러까지 버블링되지 않도록 차단하고,
  // SUB_DRAG_TYPE 데이터와 view.dragging 슬라이스를 설정하여 Dropcursor가 동작하게 함.
  const handleSubDragStart = (e: React.DragEvent, idx: number) => {
    e.stopPropagation();

    const image = images[idx];
    e.dataTransfer.setData(
      SUB_DRAG_TYPE,
      JSON.stringify({ image, sourceGroupPos: getPos(), sourceIdx: idx }),
    );
    e.dataTransfer.effectAllowed = 'move';

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

  return { dropIndicatorIdx, pmViewRef, handleSubDragStart };
}
