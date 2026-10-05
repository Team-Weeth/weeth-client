import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { FullscreenImageViewerImage } from '@/components/ui/FullscreenImageViewer';
import type { GroupImage } from './ImageGroup/ImageGroup';

type ImageAnchor = { kind: 'inline'; pos: number } | { kind: 'group'; pos: number; idx: number };

/**
 * 문서 전체를 순회하여 전체화면 뷰어용 이미지 목록과 클릭된 이미지 인덱스를 반환.
 * inlineImage / imageGroup 두 노드 타입을 모두 수집한다.
 */
export function collectDocImages(
  doc: ProseMirrorNode,
  anchor: ImageAnchor,
): { images: FullscreenImageViewerImage[]; clickedIndex: number } {
  const allImages: FullscreenImageViewerImage[] = [];
  let clickedIndex = 0;

  doc.descendants((node, pos) => {
    if (node.type.name === 'inlineImage') {
      if (anchor.kind === 'inline' && pos === anchor.pos) {
        clickedIndex = allImages.length;
      }
      allImages.push({
        url: node.attrs.src as string,
        alt: (node.attrs.alt as string) ?? undefined,
      });
    } else if (node.type.name === 'imageGroup') {
      const imgs = node.attrs.images as GroupImage[];
      imgs.forEach((img, imgIdx) => {
        if (anchor.kind === 'group' && pos === anchor.pos && imgIdx === anchor.idx) {
          clickedIndex = allImages.length;
        }
        allImages.push({ url: img.src, alt: img.alt ?? undefined });
      });
    }
  });

  return { images: allImages, clickedIndex };
}
