import { useEffect, useState } from 'react';
import type { RefObject } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';

const TOOLBAR_CLEARANCE = 56;

interface UseToolbarPositionOptions {
  isEditable: boolean;
  getPos: () => number;
  editor: Editor;
  nodeSize: number;
  containerRef: RefObject<HTMLDivElement | null>;
}

interface UseToolbarPositionResult {
  toolbarBelow: boolean;
  nodeBefore: Node | null;
  nodeAfter: Node | null;
}

function useToolbarPosition({
  isEditable,
  getPos,
  editor,
  nodeSize,
  containerRef,
}: UseToolbarPositionOptions): UseToolbarPositionResult {
  const [measuredBelow, setMeasuredBelow] = useState(false);

  const pos = getPos();
  const { nodeBefore } = editor.state.doc.resolve(pos);
  const isFirstNode = nodeBefore === null;
  const toolbarBelow = isFirstNode || measuredBelow;

  const afterPos = pos + nodeSize;
  const nodeAfter =
    afterPos < editor.state.doc.content.size ? editor.state.doc.resolve(afterPos).nodeAfter : null;

  // IntersectionObserver로 뷰포트 상단 여유를 추적 (콜백 안에서 setState → React Compiler 허용)
  // 선택 전에도 측정값이 준비되어 있어 선택 시 툴바 위치가 즉시 올바르게 표시됨
  useEffect(() => {
    if (!isEditable || isFirstNode) return;
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const below = entry.boundingClientRect.top < TOOLBAR_CLEARANCE;
        setMeasuredBelow((prev) => (prev === below ? prev : below));
      },
      { rootMargin: `-${TOOLBAR_CLEARANCE}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [isEditable, isFirstNode, containerRef]);

  return { toolbarBelow, nodeBefore, nodeAfter };
}

export { useToolbarPosition };
