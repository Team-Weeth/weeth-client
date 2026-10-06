import { useState, useEffect } from 'react';
import type { Editor } from '@tiptap/core';
import type { Node } from '@tiptap/pm/model';

interface AdjacentNodes {
  nodeBefore: Node | null;
  nodeAfter: Node | null;
}

/**
 * 에디터 업데이트를 구독하여 인접 노드 정보를 최신으로 유지.
 * ProseMirror NodeView는 자기 노드 변경 시에만 리렌더링하므로,
 * 인접 노드 변경(예: GapZone으로 paragraph 삽입)을 감지하려면 별도 구독이 필요.
 */
function useAdjacentNodes(editor: Editor, getPos: () => number, nodeSize: number): AdjacentNodes {
  const [adjacent, setAdjacent] = useState<AdjacentNodes>(() =>
    resolveAdjacent(editor, getPos, nodeSize),
  );

  useEffect(() => {
    const onUpdate = () => {
      const next = resolveAdjacent(editor, getPos, nodeSize);
      setAdjacent((prev) => {
        if (prev.nodeBefore === next.nodeBefore && prev.nodeAfter === next.nodeAfter) return prev;
        return next;
      });
    };
    editor.on('update', onUpdate);
    return () => {
      editor.off('update', onUpdate);
    };
  }, [editor, getPos, nodeSize]);

  return adjacent;
}

function resolveAdjacent(editor: Editor, getPos: () => number, nodeSize: number): AdjacentNodes {
  try {
    const pos = getPos();
    const nodeBefore = editor.state.doc.resolve(pos).nodeBefore;
    const afterPos = pos + nodeSize;
    const nodeAfter =
      afterPos <= editor.state.doc.content.size
        ? editor.state.doc.resolve(afterPos).nodeAfter
        : null;
    return { nodeBefore, nodeAfter };
  } catch {
    return { nodeBefore: null, nodeAfter: null };
  }
}

export { useAdjacentNodes };
