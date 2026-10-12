import { collectDocImages } from '@/utils/board/imageDocUtils';
import type { GroupImage } from '@/components/board/Editor/extensions/ImageGroup/ImageGroup';

type MockNode = {
  type: { name: string };
  attrs: Record<string, unknown>;
};

function makeDoc(nodes: Array<{ typeName: string; pos: number; attrs: Record<string, unknown> }>) {
  return {
    descendants: (cb: (node: MockNode, pos: number) => boolean | void) => {
      for (const { typeName, pos, attrs } of nodes) {
        cb({ type: { name: typeName }, attrs }, pos);
      }
    },
  };
}

describe('collectDocImages', () => {
  describe('inlineImage 노드', () => {
    it('빈 문서는 빈 이미지 목록과 clickedIndex 0을 반환한다', () => {
      const doc = makeDoc([]);
      const { images, clickedIndex } = collectDocImages(doc as never, { kind: 'inline', pos: 0 });
      expect(images).toEqual([]);
      expect(clickedIndex).toBe(0);
    });

    it('단일 inlineImage를 클릭하면 clickedIndex가 0이다', () => {
      const doc = makeDoc([
        { typeName: 'inlineImage', pos: 5, attrs: { src: 'https://a.com/1.png', alt: '이미지' } },
      ]);
      const { images, clickedIndex } = collectDocImages(doc as never, { kind: 'inline', pos: 5 });
      expect(images).toEqual([{ url: 'https://a.com/1.png', alt: '이미지' }]);
      expect(clickedIndex).toBe(0);
    });

    it('두 번째 inlineImage를 클릭하면 clickedIndex가 1이다', () => {
      const doc = makeDoc([
        { typeName: 'inlineImage', pos: 5, attrs: { src: 'https://a.com/1.png', alt: null } },
        { typeName: 'inlineImage', pos: 10, attrs: { src: 'https://a.com/2.png', alt: null } },
      ]);
      const { images, clickedIndex } = collectDocImages(doc as never, { kind: 'inline', pos: 10 });
      expect(images).toHaveLength(2);
      expect(clickedIndex).toBe(1);
    });

    it('alt가 null이면 url 객체에서 alt가 undefined가 된다', () => {
      const doc = makeDoc([
        { typeName: 'inlineImage', pos: 5, attrs: { src: 'https://a.com/1.png', alt: null } },
      ]);
      const { images } = collectDocImages(doc as never, { kind: 'inline', pos: 5 });
      expect(images[0].alt).toBeUndefined();
    });
  });

  describe('imageGroup 노드', () => {
    it('imageGroup 내 첫 번째 이미지를 클릭하면 clickedIndex가 0이다', () => {
      const groupImages: GroupImage[] = [
        { src: 'https://a.com/g1.png', alt: null, width: null, uploadId: null, uploading: false },
        { src: 'https://a.com/g2.png', alt: null, width: null, uploadId: null, uploading: false },
      ];
      const doc = makeDoc([{ typeName: 'imageGroup', pos: 5, attrs: { images: groupImages } }]);
      const { images, clickedIndex } = collectDocImages(doc as never, {
        kind: 'group',
        pos: 5,
        idx: 0,
      });
      expect(images).toHaveLength(2);
      expect(clickedIndex).toBe(0);
    });

    it('imageGroup 내 두 번째 이미지를 클릭하면 clickedIndex가 1이다', () => {
      const groupImages: GroupImage[] = [
        { src: 'https://a.com/g1.png', alt: null, width: null, uploadId: null, uploading: false },
        { src: 'https://a.com/g2.png', alt: 'alt2', width: null, uploadId: null, uploading: false },
      ];
      const doc = makeDoc([{ typeName: 'imageGroup', pos: 5, attrs: { images: groupImages } }]);
      const { images, clickedIndex } = collectDocImages(doc as never, {
        kind: 'group',
        pos: 5,
        idx: 1,
      });
      expect(clickedIndex).toBe(1);
      expect(images[1].alt).toBe('alt2');
    });
  });

  describe('혼합 문서 (inlineImage + imageGroup)', () => {
    it('inlineImage 뒤 imageGroup의 이미지를 클릭하면 인라인 이미지 수만큼 인덱스가 밀린다', () => {
      const groupImages: GroupImage[] = [
        { src: 'https://a.com/g1.png', alt: null, width: null, uploadId: null, uploading: false },
        { src: 'https://a.com/g2.png', alt: null, width: null, uploadId: null, uploading: false },
      ];
      const doc = makeDoc([
        { typeName: 'inlineImage', pos: 5, attrs: { src: 'https://a.com/i1.png', alt: null } },
        { typeName: 'imageGroup', pos: 10, attrs: { images: groupImages } },
      ]);
      // 그룹의 두 번째 이미지 클릭 → 전체 목록에서 인덱스 2
      const { images, clickedIndex } = collectDocImages(doc as never, {
        kind: 'group',
        pos: 10,
        idx: 1,
      });
      expect(images).toHaveLength(3);
      expect(clickedIndex).toBe(2);
    });

    it('imageGroup 뒤 inlineImage를 클릭하면 그룹 이미지 수만큼 인덱스가 밀린다', () => {
      const groupImages: GroupImage[] = [
        { src: 'https://a.com/g1.png', alt: null, width: null, uploadId: null, uploading: false },
        { src: 'https://a.com/g2.png', alt: null, width: null, uploadId: null, uploading: false },
      ];
      const doc = makeDoc([
        { typeName: 'imageGroup', pos: 5, attrs: { images: groupImages } },
        { typeName: 'inlineImage', pos: 20, attrs: { src: 'https://a.com/i1.png', alt: null } },
      ]);
      const { images, clickedIndex } = collectDocImages(doc as never, {
        kind: 'inline',
        pos: 20,
      });
      expect(images).toHaveLength(3);
      expect(clickedIndex).toBe(2);
    });
  });
});
