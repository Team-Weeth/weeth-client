import { renderHook } from '@testing-library/react';

import { useMediaQuery } from '@/hooks/useMediaQuery';

function mockMatchMedia(matches: boolean) {
  const addEventListenerMock = jest.fn();
  const removeEventListenerMock = jest.fn();

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches,
      media: query,
      addEventListener: addEventListenerMock,
      removeEventListener: removeEventListenerMock,
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });

  return { addEventListenerMock, removeEventListenerMock };
}

describe('useMediaQuery', () => {
  it('matchMedia가 true이면 true를 반환한다', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(true);
  });

  it('matchMedia가 false이면 false를 반환한다', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(result.current).toBe(false);
  });

  it('쿼리 문자열이 matchMedia에 전달된다', () => {
    mockMatchMedia(false);
    renderHook(() => useMediaQuery('(max-width: 1032px)'));
    expect(window.matchMedia).toHaveBeenCalledWith('(max-width: 1032px)');
  });

  it('변경 이벤트 리스너를 등록한다', () => {
    const { addEventListenerMock } = mockMatchMedia(false);
    renderHook(() => useMediaQuery('(min-width: 768px)'));
    expect(addEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('언마운트 시 변경 이벤트 리스너가 제거된다', () => {
    const { removeEventListenerMock } = mockMatchMedia(false);
    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    unmount();

    expect(removeEventListenerMock).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
