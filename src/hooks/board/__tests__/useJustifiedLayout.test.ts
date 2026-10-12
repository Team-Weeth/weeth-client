import { renderHook, act } from '@testing-library/react';
import { useJustifiedLayout } from '@/hooks/board/useJustifiedLayout';
import { DROP_ZONE_WIDTH, READ_ONLY_GAP } from '@/utils/board/imageGroupUtils';
import type { GroupImage } from '@/components/board/Editor/extensions/ImageGroup/ImageGroup';

function makeImage(src: string): GroupImage {
  return { src, alt: null, width: null, uploadId: null, uploading: false };
}

function makeContainerRef(width: number) {
  const el = document.createElement('div');
  jest.spyOn(el, 'getBoundingClientRect').mockReturnValue({
    width,
    height: 0,
    top: 0,
    left: 0,
    right: width,
    bottom: 0,
    x: 0,
    y: 0,
    toJSON: jest.fn(),
  });
  return { current: el };
}

// JSDOM은 ResizeObserver를 구현하지 않으므로 모킹
let resizeObserverCallback: ResizeObserverCallback | null = null;
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();

beforeEach(() => {
  resizeObserverCallback = null;
  mockObserve.mockClear();
  mockDisconnect.mockClear();

  global.ResizeObserver = jest.fn().mockImplementation((cb: ResizeObserverCallback) => {
    resizeObserverCallback = cb;
    return { observe: mockObserve, disconnect: mockDisconnect };
  });
});

afterEach(() => {
  jest.restoreAllMocks();
});

function triggerResize(width: number) {
  resizeObserverCallback?.(
    [{ contentRect: { width } } as ResizeObserverEntry],
    {} as ResizeObserver,
  );
}

function makeSyntheticLoadEvent(naturalWidth: number, naturalHeight: number) {
  const img = document.createElement('img');
  Object.defineProperty(img, 'naturalWidth', { value: naturalWidth });
  Object.defineProperty(img, 'naturalHeight', { value: naturalHeight });
  return { currentTarget: img } as never;
}

describe('useJustifiedLayout', () => {
  describe('초기 상태', () => {
    it('targetH와 cellWidths가 null로 초기화된다', () => {
      const images = [makeImage('a.png')];
      const containerRef = makeContainerRef(400);

      const { result } = renderHook(() => useJustifiedLayout(images, true, containerRef));

      expect(result.current.targetH).toBeNull();
      expect(result.current.cellWidths).toBeNull();
    });
  });

  describe('handleImageDimLoad', () => {
    it('모든 이미지 치수가 로드되고 컨테이너 너비가 확정되면 justified 레이아웃을 계산한다', () => {
      const images = [makeImage('a.png'), makeImage('b.png')];
      const containerWidth = 800;
      const containerRef = makeContainerRef(containerWidth);

      const { result } = renderHook(() => useJustifiedLayout(images, false, containerRef));

      // 컨테이너 너비 확정 (ResizeObserver 트리거)
      act(() => {
        triggerResize(containerWidth);
      });

      // 두 이미지 모두 100×100 (비율 1:1)
      act(() => {
        result.current.handleImageDimLoad('a.png', makeSyntheticLoadEvent(100, 100));
        result.current.handleImageDimLoad('b.png', makeSyntheticLoadEvent(100, 100));
      });

      // 읽기 전용: overhead = READ_ONLY_GAP * (2 - 1) = 8
      const overhead = READ_ONLY_GAP * 1;
      const aspectSum = 1 + 1; // 각 100/100
      const expectedTargetH = (containerWidth - overhead) / aspectSum;

      expect(result.current.targetH).toBeCloseTo(expectedTargetH);
      expect(result.current.cellWidths).toHaveLength(2);
    });

    it('편집 모드에서는 DropZoneLine 너비를 overhead에 포함한다', () => {
      const images = [makeImage('a.png'), makeImage('b.png')];
      const containerWidth = 800;
      const containerRef = makeContainerRef(containerWidth);

      const { result } = renderHook(() => useJustifiedLayout(images, true, containerRef));

      act(() => {
        triggerResize(containerWidth);
      });
      act(() => {
        result.current.handleImageDimLoad('a.png', makeSyntheticLoadEvent(200, 100));
        result.current.handleImageDimLoad('b.png', makeSyntheticLoadEvent(200, 100));
      });

      // 편집 모드: overhead = DROP_ZONE_WIDTH * (2 + 1) = 36
      const overhead = DROP_ZONE_WIDTH * 3;
      const aspectSum = 200 / 100 + 200 / 100; // 2 + 2 = 4
      const expectedTargetH = (containerWidth - overhead) / aspectSum;

      expect(result.current.targetH).toBeCloseTo(expectedTargetH);
    });

    it('편집 모드에서 각 cellWidth에 DROP_ZONE_WIDTH가 추가된다', () => {
      const images = [makeImage('a.png')];
      const containerWidth = 500;
      const containerRef = makeContainerRef(containerWidth);

      const { result } = renderHook(() => useJustifiedLayout(images, true, containerRef));

      act(() => {
        triggerResize(containerWidth);
      });
      act(() => {
        result.current.handleImageDimLoad('a.png', makeSyntheticLoadEvent(100, 100));
      });

      // cellWidth = targetH * (w/h) + DROP_ZONE_WIDTH
      const overhead = DROP_ZONE_WIDTH * 2; // N+1 = 2
      const targetH = (containerWidth - overhead) / 1;
      const expectedCellWidth = targetH * 1 + DROP_ZONE_WIDTH;

      expect(result.current.cellWidths![0]).toBeCloseTo(expectedCellWidth);
    });

    it('이미 로드된 src의 치수를 중복 등록해도 덮어쓰지 않는다', () => {
      const images = [makeImage('a.png')];
      const containerRef = makeContainerRef(400);

      const { result } = renderHook(() => useJustifiedLayout(images, false, containerRef));

      act(() => {
        triggerResize(400);
        result.current.handleImageDimLoad('a.png', makeSyntheticLoadEvent(100, 100));
        // 같은 src에 다른 치수로 재호출
        result.current.handleImageDimLoad('a.png', makeSyntheticLoadEvent(200, 200));
      });

      // 두 번째 호출은 무시되어야 함; 100×100 기준으로 계산
      const overhead = READ_ONLY_GAP * 0; // 이미지 1장 → (1-1) = 0
      const expectedTargetH = (400 - overhead) / 1;
      expect(result.current.targetH).toBeCloseTo(expectedTargetH);
    });

    it('naturalWidth나 naturalHeight가 0이면 치수를 등록하지 않는다', () => {
      const images = [makeImage('a.png')];
      const containerRef = makeContainerRef(400);

      const { result } = renderHook(() => useJustifiedLayout(images, false, containerRef));

      act(() => {
        triggerResize(400);
        result.current.handleImageDimLoad('a.png', makeSyntheticLoadEvent(0, 100));
      });

      // 치수 미확정 → cellWidths는 null
      expect(result.current.cellWidths).toBeNull();
    });
  });

  describe('컨테이너 너비 미확정 시', () => {
    it('ResizeObserver가 트리거되지 않으면 targetH가 null이다', () => {
      const images = [makeImage('a.png')];
      const containerRef = makeContainerRef(0);

      const { result } = renderHook(() => useJustifiedLayout(images, false, containerRef));

      act(() => {
        result.current.handleImageDimLoad('a.png', makeSyntheticLoadEvent(100, 100));
      });

      expect(result.current.targetH).toBeNull();
    });
  });

  describe('언마운트 정리', () => {
    it('언마운트 시 ResizeObserver.disconnect를 호출한다', () => {
      const images = [makeImage('a.png')];
      const containerRef = makeContainerRef(400);

      const { unmount } = renderHook(() => useJustifiedLayout(images, false, containerRef));

      unmount();

      expect(mockDisconnect).toHaveBeenCalledTimes(1);
    });
  });
});
