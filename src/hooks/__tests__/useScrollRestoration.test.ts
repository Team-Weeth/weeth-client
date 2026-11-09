import { renderHook, act } from '@testing-library/react';

import { useScrollRestoration } from '@/hooks/useScrollRestoration';

function mockScrollY(value: number) {
  Object.defineProperty(window, 'scrollY', {
    configurable: true,
    get: () => value,
  });
}

afterEach(() => {
  sessionStorage.clear();
  jest.restoreAllMocks();
});

describe('복원', () => {
  it('sessionStorage에 저장된 값이 없으면 pendingTarget이 null이다', () => {
    const { result } = renderHook(() => useScrollRestoration('test-key', true));
    expect(result.current.pendingTarget).toBeNull();
  });

  it('sessionStorage에 저장된 값이 있으면 pendingTarget이 해당 값으로 설정된다', () => {
    sessionStorage.setItem('scroll:test-key', '300');
    const { result } = renderHook(() => useScrollRestoration('test-key', true));
    expect(result.current.pendingTarget).toBe(300);
  });

  it('ready=false이면 sessionStorage에 값이 있어도 pendingTarget이 null이다', () => {
    sessionStorage.setItem('scroll:test-key', '300');
    const { result } = renderHook(() => useScrollRestoration('test-key', false));
    expect(result.current.pendingTarget).toBeNull();
  });

  it('key=null이면 pendingTarget이 null이다', () => {
    sessionStorage.setItem('scroll:null', '300');
    const { result } = renderHook(() => useScrollRestoration(null, true));
    expect(result.current.pendingTarget).toBeNull();
  });

  it('ready가 false에서 true로 바뀌면 pendingTarget이 설정된다', () => {
    sessionStorage.setItem('scroll:test-key', '200');
    const { result, rerender } = renderHook(
      ({ ready }) => useScrollRestoration('test-key', ready),
      { initialProps: { ready: false } },
    );

    expect(result.current.pendingTarget).toBeNull();

    act(() => {
      rerender({ ready: true });
    });

    expect(result.current.pendingTarget).toBe(200);
  });
});

describe('clearPendingTarget', () => {
  it('clearPendingTarget 호출 후 pendingTarget이 null로 초기화된다', () => {
    sessionStorage.setItem('scroll:test-key', '400');
    const { result } = renderHook(() => useScrollRestoration('test-key', true));

    expect(result.current.pendingTarget).toBe(400);

    act(() => {
      result.current.clearPendingTarget();
    });

    expect(result.current.pendingTarget).toBeNull();
  });
});

describe('저장', () => {
  it('언마운트 시 scrollY > 0이면 sessionStorage에 값을 저장한다', () => {
    mockScrollY(500);
    const { unmount } = renderHook(() => useScrollRestoration('test-key', true));

    unmount();

    expect(sessionStorage.getItem('scroll:test-key')).toBe('500');
  });

  it('언마운트 시 scrollY = 0이면 sessionStorage 키를 제거한다', () => {
    sessionStorage.setItem('scroll:test-key', '100');
    mockScrollY(0);
    const { unmount } = renderHook(() => useScrollRestoration('test-key', true));

    unmount();

    expect(sessionStorage.getItem('scroll:test-key')).toBeNull();
  });

  it('key=null이면 언마운트해도 sessionStorage에 저장하지 않다', () => {
    mockScrollY(300);
    const setItemSpy = jest.spyOn(Storage.prototype, 'setItem');
    const { unmount } = renderHook(() => useScrollRestoration(null, true));

    unmount();

    expect(setItemSpy).not.toHaveBeenCalled();
  });

  it('key가 변경될 때 이전 key의 cleanup이 실행되어 이전 키로 scrollY가 저장된다', () => {
    mockScrollY(250);
    const { rerender } = renderHook(({ key }) => useScrollRestoration(key, true), {
      initialProps: { key: 'key-a' },
    });

    act(() => {
      rerender({ key: 'key-b' });
    });

    expect(sessionStorage.getItem('scroll:key-a')).toBe('250');
  });
});

describe('저장소 접근 실패', () => {
  it('getItem 실패 시 렌더 중단 없이 pendingTarget이 null이다', () => {
    jest.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('Access denied');
    });
    const { result } = renderHook(() => useScrollRestoration('test-key', true));
    expect(result.current.pendingTarget).toBeNull();
  });

  it('setItem 실패 시 언마운트가 에러 없이 완료된다', () => {
    mockScrollY(500);
    jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('Access denied');
    });
    const { unmount } = renderHook(() => useScrollRestoration('test-key', true));
    expect(() => unmount()).not.toThrow();
  });

  it('removeItem 실패 시 언마운트가 에러 없이 완료된다', () => {
    mockScrollY(0);
    jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new DOMException('Access denied');
    });
    const { unmount } = renderHook(() => useScrollRestoration('test-key', true));
    expect(() => unmount()).not.toThrow();
  });
});
