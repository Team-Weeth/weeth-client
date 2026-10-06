import type { Transaction } from '@tiptap/pm/state';
import type { NodeViewProps } from '@tiptap/react';
import type { GroupImage } from './ImageGroup';

export const SUB_DRAG_TYPE = 'application/x-image-sub-drag';

// w-600 = var(--spacing-600) = 24px (DropZoneLine 너비)
export const DROP_ZONE_WIDTH = 24;

// gap-200 = 8px — 읽기 전용 모드에서 이미지 간 간격
export const READ_ONLY_GAP = 8;

export interface ViewLike {
  state: {
    doc: { nodeAt: (pos: number) => ReturnType<NodeViewProps['editor']['state']['doc']['nodeAt']> };
    tr: NodeViewProps['editor']['state']['tr'];
    schema: NodeViewProps['editor']['state']['schema'];
  };
  dispatch: (tr: Transaction) => void;
}

/** imageGroup 노드에서 이미지 1장을 제거. 결과가 0장이면 노드 삭제, 1장이면 inlineImage로 변환. */
export function removeImageFromGroup(view: ViewLike, groupPos: number, imageIdx: number) {
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
    view.dispatch(view.state.tr.setNodeMarkup(groupPos, undefined, { ...groupNode.attrs, images }));
  }
}
