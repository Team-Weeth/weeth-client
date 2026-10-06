'use client';

import { useState, useRef, useEffect } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import type { NodeViewProps } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';
import { MAX_GROUP_IMAGES } from '@/components/board/Editor/extensions/ImageGroup/ImageGroup';
import type { GroupImage } from '@/components/board/Editor/extensions/ImageGroup/ImageGroup';
import { SUB_DRAG_TYPE } from '@/utils/board/imageGroupUtils';

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
}

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

  const pmViewRef = useRef(editor.view);
  useEffect(() => {
    pmViewRef.current = editor.view;
  });

  // native dragstart 핸들러에서 항상 최신 값을 읽기 위한 ref
  const imagesRef = useRef(images);
  const getPosRef = useRef(getPos);
  useEffect(() => {
    imagesRef.current = images;
    getPosRef.current = getPos;
  });

  const handleInternalDrop = (dataTransfer: DataTransfer, dropIdx: number) => {
    setDropIndicatorIdx(null);

    const subDragData = dataTransfer.getData(SUB_DRAG_TYPE);

    if (subDragData) {
      const { image, sourceGroupPos, sourceIdx } = JSON.parse(subDragData) as {
        image: GroupImage;
        sourceGroupPos: number;
        sourceIdx: number;
      };

      const currentPos = getPos();

      // position은 드래그 중 다른 트랜잭션으로 밀릴 수 있으므로 이미지 존재 여부로도 판별
      const isSameGroup =
        sourceGroupPos === currentPos ||
        (sourceIdx < images.length && images[sourceIdx].src === image.src);

      if (isSameGroup) {
        // 같은 그룹 내 순서 변경
        const newImages = [...images];
        newImages.splice(sourceIdx, 1);
        const adjustedIdx = dropIdx > sourceIdx ? dropIdx - 1 : dropIdx;
        newImages.splice(adjustedIdx, 0, image);
        updateAttributes({ images: newImages });
      } else {
        // 다른 그룹에서 이동
        if (images.length >= MAX_GROUP_IMAGES) return;

        const sourceGroupNode = editor.state.doc.nodeAt(sourceGroupPos);
        if (!sourceGroupNode || sourceGroupNode.type.name !== 'imageGroup') return;

        const sourceImages = [...(sourceGroupNode.attrs.images as GroupImage[])];
        sourceImages.splice(sourceIdx, 1);

        const newImages = [...images];
        newImages.splice(dropIdx, 0, image);

        // 타깃 업데이트 + 소스 수정을 단일 트랜잭션으로 처리 (별개 dispatch 시 중복 key 발생)
        const tr = editor.state.tr.setNodeMarkup(currentPos, undefined, {
          ...node.attrs,
          images: newImages,
        });

        const mappedSourcePos = tr.mapping.map(sourceGroupPos);

        if (sourceImages.length === 0) {
          const mappedNode = tr.doc.nodeAt(mappedSourcePos);
          if (mappedNode) tr.delete(mappedSourcePos, mappedSourcePos + mappedNode.nodeSize);
        } else if (sourceImages.length === 1) {
          const img = sourceImages[0];
          const inlineImageNode = editor.state.schema.nodes.inlineImage.create({
            src: img.src,
            alt: img.alt,
            width: img.width,
            uploadId: img.uploadId,
            uploading: img.uploading,
          });
          const mappedNode = tr.doc.nodeAt(mappedSourcePos);
          if (mappedNode)
            tr.replaceWith(mappedSourcePos, mappedSourcePos + mappedNode.nodeSize, inlineImageNode);
        } else {
          tr.setNodeMarkup(mappedSourcePos, undefined, {
            ...sourceGroupNode.attrs,
            images: sourceImages,
          });
        }

        editor.view.dispatch(tr);
      }

      setSubSelectedIdx(null);
      return;
    }

    // 독립 inlineImage를 그룹에 흡수
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
    const mappedSource = tr.mapping.map(sourcePos);
    tr.delete(mappedSource, mappedSource + sourceNodeSize);
    // 삭제된 소스가 선택 중이면 syncNodeSelection 충돌 방지
    const mappedGroup = tr.mapping.map(groupPos);
    tr.setSelection(NodeSelection.create(tr.doc, mappedGroup));
    editor.view.dispatch(tr);
    setSubSelectedIdx(null);
  };

  const handleDropRef = useRef(handleInternalDrop);
  useEffect(() => {
    handleDropRef.current = handleInternalDrop;
  });

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

    // dropcursor가 컨테이너 진입 전에 설정될 수 있으므로 dragleave로 강제 해제
    const clearDropcursor = () => {
      pmViewRef.current.dom.dispatchEvent(new DragEvent('dragleave', { bubbles: false }));
    };

    // containerRef 네이티브 dragstart는 view.dom보다 먼저 실행됨.
    // stopPropagation으로 PM이 view.dragging을 설정하지 못하게 차단 →
    // GapZone 등 외부에 드롭해도 PM이 imageGroup을 삭제하지 않는다.
    const onNativeDragStart = (e: DragEvent) => {
      const target = e.target as HTMLElement;
      const cellEl = target.closest('[data-cell-idx]') as HTMLElement | null;
      if (!cellEl || !e.dataTransfer) return;
      const idx = Number(cellEl.dataset.cellIdx);
      const image = imagesRef.current[idx];
      if (!image) return;
      e.stopPropagation();
      e.dataTransfer.setData(
        SUB_DRAG_TYPE,
        JSON.stringify({ image, sourceGroupPos: getPosRef.current(), sourceIdx: idx }),
      );
      e.dataTransfer.effectAllowed = 'move';
    };

    const isInternalDrag = (e: DragEvent): boolean => {
      if (e.dataTransfer?.types.includes(SUB_DRAG_TYPE)) return true;
      const dragging = (
        pmViewRef.current as unknown as {
          dragging?: { slice?: { content?: { firstChild?: { type: { name: string } } } } };
        }
      ).dragging;
      return dragging?.slice?.content?.firstChild?.type.name === 'inlineImage';
    };

    const onNativeDragOver = (e: DragEvent) => {
      if (!isInternalDrag(e)) return; // 외부 파일은 PM에게 위임
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
      if (!isInternalDrag(e)) return; // 외부 파일은 PM에게 위임
      e.preventDefault();
      e.stopPropagation();
      const idx = resolveDropIdx(e);
      if (idx !== null && e.dataTransfer) {
        handleDropRef.current(e.dataTransfer, idx);
      }
      setDropIndicatorIdx(null);
    };

    el.addEventListener('dragstart', onNativeDragStart);
    el.addEventListener('dragover', onNativeDragOver);
    el.addEventListener('dragleave', onNativeDragLeave);
    el.addEventListener('drop', onNativeDrop);
    return () => {
      el.removeEventListener('dragstart', onNativeDragStart);
      el.removeEventListener('dragover', onNativeDragOver);
      el.removeEventListener('dragleave', onNativeDragLeave);
      el.removeEventListener('drop', onNativeDrop);
    };
  }, [containerRef, isEditable]);

  return { dropIndicatorIdx };
}
