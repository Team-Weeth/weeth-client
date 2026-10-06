import { TextSelection } from '@tiptap/pm/state';
import type { Transaction } from '@tiptap/pm/state';
import type { EditorView } from '@tiptap/pm/view';
import { SUB_DRAG_TYPE, removeImageFromGroup } from '@/utils/board/imageGroupUtils';
import { MAX_GROUP_IMAGES } from './extensions/ImageGroup/ImageGroup';
import type { GroupImage } from './extensions/ImageGroup/ImageGroup';

interface SideDropResult {
  targetPos: number;
  targetNodeType: string;
  side: 'left' | 'right';
}

function detectSideDrop(view: EditorView, event: DragEvent): SideDropResult | null {
  const coords = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!coords) return null;

  const pos = coords.inside >= 0 ? coords.inside : coords.pos;
  const node = view.state.doc.nodeAt(pos);
  if (!node) return null;

  if (node.type.name !== 'inlineImage' && node.type.name !== 'imageGroup') return null;

  const dom = view.nodeDOM(pos);
  if (!dom || !(dom instanceof HTMLElement)) return null;

  const rect = dom.getBoundingClientRect();
  const x = event.clientX - rect.left;
  const threshold = rect.width * 0.3;

  if (x < threshold) {
    return { targetPos: pos, targetNodeType: node.type.name, side: 'left' };
  } else if (x > rect.width - threshold) {
    return { targetPos: pos, targetNodeType: node.type.name, side: 'right' };
  }

  return null;
}

/**
 * 사이드 드롭 시 이미지를 타겟 위치에 추가하는 트랜잭션을 반환.
 * 타겟 그룹이 가득 찼거나 타겟 노드가 없으면 null 반환 (소스 이미지를 제거해선 안 됨).
 */
function buildSideDropTransaction(
  view: EditorView,
  result: SideDropResult,
  image: GroupImage,
): Transaction | null {
  const targetNode = view.state.doc.nodeAt(result.targetPos);
  if (!targetNode) return null;

  if (targetNode.type.name === 'inlineImage') {
    const targetImage: GroupImage = {
      src: targetNode.attrs.src as string,
      alt: (targetNode.attrs.alt as string) ?? null,
      width: (targetNode.attrs.width as number) ?? null,
      uploadId: (targetNode.attrs.uploadId as string) ?? null,
      uploading: (targetNode.attrs.uploading as boolean) ?? false,
    };
    const images = result.side === 'left' ? [image, targetImage] : [targetImage, image];
    const groupNode = view.state.schema.nodes.imageGroup.create({ images });
    return view.state.tr.replaceWith(
      result.targetPos,
      result.targetPos + targetNode.nodeSize,
      groupNode,
    );
  } else if (targetNode.type.name === 'imageGroup') {
    const existing = targetNode.attrs.images as GroupImage[];
    if (existing.length >= MAX_GROUP_IMAGES) return null;
    const images = result.side === 'left' ? [image, ...existing] : [...existing, image];
    return view.state.tr.setNodeMarkup(result.targetPos, undefined, {
      ...targetNode.attrs,
      images,
    });
  }
  return null;
}

function findNodePosByAttrs(
  view: EditorView,
  typeName: string,
  attrs: Record<string, unknown>,
): number | null {
  let foundPos: number | null = null;
  view.state.doc.descendants((node, pos) => {
    if (foundPos !== null) return false;
    if (node.type.name === typeName && node.attrs.src === attrs.src) {
      foundPos = pos;
      return false;
    }
  });
  return foundPos;
}

/** 외부 파일 드롭 처리 */
export function handleFileDrop(
  event: DragEvent,
  processFiles: ((files: File[]) => void) | undefined,
): boolean {
  const droppedFiles = event.dataTransfer?.files;
  if (!droppedFiles || droppedFiles.length === 0) return false;
  event.preventDefault();
  processFiles?.(Array.from(droppedFiles));
  return true;
}

/** 그룹 내 서브 이미지를 에디터 외부로 드래그하는 경우 처리 */
export function handleSubImageDrop(view: EditorView, event: DragEvent): boolean {
  const subDragData = event.dataTransfer?.getData(SUB_DRAG_TYPE);
  if (!subDragData) return false;

  const { image, sourceGroupPos, sourceIdx } = JSON.parse(subDragData) as {
    image: GroupImage;
    sourceGroupPos: number;
    sourceIdx: number;
  };

  // 드롭 대상이 imageGroup NodeView 내부인지 확인.
  // GapZone 등 containerRef 외부지만 같은 NodeView 내부에 드롭된 경우
  // 이미지를 제거하면 안 되므로 no-op 처리.
  // (containerRef 내부의 드롭은 onNativeDrop에서 stopPropagation되어 여기 도달하지 않음)
  const target = event.target as HTMLElement;
  if (target.closest('.node-imageGroup')) {
    event.preventDefault();
    return true;
  }

  // 사이드 드롭 확인
  const sideResult = detectSideDrop(view, event);
  if (sideResult) {
    event.preventDefault();
    // 원본 그룹 자체에 드롭 → 취소
    if (sideResult.targetPos === sourceGroupPos) return true;
    const sideTr = buildSideDropTransaction(view, sideResult, image);
    if (sideTr) {
      // sourceGroupPos를 사이드 드롭 트랜잭션의 매핑으로 보정한 후 제거
      const mappedSourceGroupPos = sideTr.mapping.map(sourceGroupPos);
      view.dispatch(sideTr);
      removeImageFromGroup(view, mappedSourceGroupPos, sourceIdx);
    }
    // sideTr === null: 대상 그룹이 가득 참 → 소스 이미지 유지
    return true;
  }

  // 일반 위치에 독립 이미지로 배치
  // dropPos를 제거 전에 먼저 계산해야 이미지 유실 및 레이아웃 밀림을 방지할 수 있다.
  event.preventDefault();
  const dropPos = view.posAtCoords({ left: event.clientX, top: event.clientY });
  if (!dropPos) return true; // 에디터 밖에 드롭 → 이미지 유실 방지

  const groupNode = view.state.doc.nodeAt(sourceGroupPos);
  if (!groupNode || groupNode.type.name !== 'imageGroup') return true;

  const remaining = [...(groupNode.attrs.images as GroupImage[])];
  remaining.splice(sourceIdx, 1);

  let removeTr: Transaction;
  if (remaining.length === 0) {
    removeTr = view.state.tr.delete(sourceGroupPos, sourceGroupPos + groupNode.nodeSize);
  } else if (remaining.length === 1) {
    const img = remaining[0];
    const singleNode = view.state.schema.nodes.inlineImage.create({
      src: img.src,
      alt: img.alt,
      width: img.width,
      uploadId: img.uploadId,
      uploading: img.uploading,
    });
    removeTr = view.state.tr.replaceWith(
      sourceGroupPos,
      sourceGroupPos + groupNode.nodeSize,
      singleNode,
    );
  } else {
    removeTr = view.state.tr.setNodeMarkup(sourceGroupPos, undefined, {
      ...groupNode.attrs,
      images: remaining,
    });
  }

  // 제거 트랜잭션의 매핑으로 삽입 위치를 보정한 뒤 같은 트랜잭션에 append
  const insertPos = removeTr.mapping.map(dropPos.pos);
  const inlineImageNode = view.state.schema.nodes.inlineImage.create({
    src: image.src,
    alt: image.alt,
    width: image.width,
    uploadId: image.uploadId,
    uploading: image.uploading,
  });
  removeTr.insert(insertPos, inlineImageNode);
  view.dispatch(removeTr);
  return true;
}

/** inlineImage를 다른 이미지 옆에 사이드 드롭하여 그룹화하는 경우 처리 */
export function handleInlineImageGroupDrop(view: EditorView, event: DragEvent): boolean {
  const dragging = (
    view as unknown as {
      dragging?: {
        slice?: {
          content?: {
            firstChild?: { type: { name: string }; attrs: Record<string, unknown> };
          };
        };
      };
    }
  ).dragging;
  const draggedNode = dragging?.slice?.content?.firstChild;
  if (!draggedNode || draggedNode.type.name !== 'inlineImage') return false;

  const sideResult = detectSideDrop(view, event);
  if (!sideResult) return false;

  event.preventDefault();
  const draggedImage: GroupImage = {
    src: draggedNode.attrs.src as string,
    alt: (draggedNode.attrs.alt as string) ?? null,
    width: (draggedNode.attrs.width as number) ?? null,
    uploadId: (draggedNode.attrs.uploadId as string) ?? null,
    uploading: (draggedNode.attrs.uploading as boolean) ?? false,
  };

  const sourcePos = findNodePosByAttrs(view, 'inlineImage', draggedNode.attrs);
  if (sourcePos === null) return true;

  // 원본 이미지 자체에 드롭 → 취소 (삭제 후 다음 노드에 그룹화되는 오작동 방지)
  if (sideResult.targetPos === sourcePos) return true;

  const sourceNode = view.state.doc.nodeAt(sourcePos);
  if (!sourceNode) return true;

  // 소스 삭제 후 target 위치를 mapping으로 보정 (DOM 재탐색 불필요)
  const deleteTr = view.state.tr.delete(sourcePos, sourcePos + sourceNode.nodeSize);
  const mappedTargetPos = deleteTr.mapping.map(sideResult.targetPos);
  // 삭제된 소스가 선택 중이면 syncNodeSelection 충돌 방지
  deleteTr.setSelection(
    TextSelection.near(deleteTr.doc.resolve(Math.min(sourcePos, deleteTr.doc.content.size))),
  );
  view.dispatch(deleteTr);

  if (view.state.doc.nodeAt(mappedTargetPos)) {
    const sideTr = buildSideDropTransaction(
      view,
      { ...sideResult, targetPos: mappedTargetPos },
      draggedImage,
    );
    if (sideTr) view.dispatch(sideTr);
  }
  return true;
}
