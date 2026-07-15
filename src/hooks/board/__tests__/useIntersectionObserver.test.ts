import { renderHook, act } from '@testing-library/react';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';

type IntersectionCallback = (entries: Pick<IntersectionObserverEntry, 'isIntersecting'>[]) => void;

const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
let capturedCallback: IntersectionCallback;

function createMockObserver(callback: IntersectionCallback, _options?: IntersectionObserverInit) {
  capturedCallback = callback;
  return {
    observe: mockObserve,
    disconnect: mockDisconnect,
    unobserve: jest.fn(),
    takeRecords: jest.fn(() => []),
  };
}

beforeAll(() => {
  Object.defineProperty(global, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: createMockObserver as unknown as typeof IntersectionObserver,
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('useIntersectionObserver', () => {
  it('초기 isIntersecting은 false다', () => {
    const { result } = renderHook(() => useIntersectionObserver({}));
    expect(result.current.isIntersecting).toBe(false);
  });

  it('ref에 노드를 연결하면 observe가 호출된다', () => {
    const { result } = renderHook(() => useIntersectionObserver({}));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    expect(mockObserve).toHaveBeenCalledWith(node);
  });

  it('ref에 null을 전달하면 disconnect가 호출된다', () => {
    const { result } = renderHook(() => useIntersectionObserver({}));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });
    act(() => {
      result.current.ref(null);
    });

    expect(mockDisconnect).toHaveBeenCalled();
  });

  it('callback으로 isIntersecting=true가 전달되면 상태가 업데이트된다', () => {
    const { result } = renderHook(() => useIntersectionObserver({}));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    act(() => {
      capturedCallback([{ isIntersecting: true }]);
    });

    expect(result.current.isIntersecting).toBe(true);
  });

  it('인터섹션 해제 시 isIntersecting이 false로 업데이트된다', () => {
    const { result } = renderHook(() => useIntersectionObserver({}));
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
      capturedCallback([{ isIntersecting: true }]);
    });

    act(() => {
      capturedCallback([{ isIntersecting: false }]);
    });

    expect(result.current.isIntersecting).toBe(false);
  });

  it('새 노드 연결 시 이전 observer를 disconnect하고 새 노드를 observe한다', () => {
    const { result } = renderHook(() => useIntersectionObserver({}));
    const node1 = document.createElement('div');
    const node2 = document.createElement('div');

    act(() => {
      result.current.ref(node1);
    });
    act(() => {
      result.current.ref(node2);
    });

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenLastCalledWith(node2);
  });

  it('옵션(threshold, rootMargin)을 IntersectionObserver 생성자에 전달한다', () => {
    const observerSpy = jest.fn(createMockObserver);
    Object.defineProperty(global, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: observerSpy as unknown as typeof IntersectionObserver,
    });

    const { result } = renderHook(() =>
      useIntersectionObserver({ threshold: 0.5, rootMargin: '10px' }),
    );
    const node = document.createElement('div');

    act(() => {
      result.current.ref(node);
    });

    expect(observerSpy).toHaveBeenCalledWith(expect.any(Function), {
      threshold: 0.5,
      rootMargin: '10px',
    });

    Object.defineProperty(global, 'IntersectionObserver', {
      writable: true,
      configurable: true,
      value: createMockObserver as unknown as typeof IntersectionObserver,
    });
  });
});
