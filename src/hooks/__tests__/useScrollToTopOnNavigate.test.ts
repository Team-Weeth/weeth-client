import { renderHook, act } from '@testing-library/react';
import { useScrollToTopOnNavigate } from '@/hooks/useScrollToTopOnNavigate';

const mockUsePathname = (jest.requireMock('next/navigation') as { usePathname: jest.Mock })
  .usePathname;

describe('useScrollToTopOnNavigate', () => {
  let scrollToSpy: jest.SpyInstance;

  beforeEach(() => {
    mockUsePathname.mockReturnValue('/home');
    scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
      cb(0);
      return 0;
    });
    jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('마운트 시 window.scrollTo(0, 0)을 호출한다', () => {
    renderHook(() => useScrollToTopOnNavigate());
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  it('pathname 변경(push 내비게이션) 시 window.scrollTo(0, 0)을 호출한다', () => {
    const { rerender } = renderHook(() => useScrollToTopOnNavigate());
    scrollToSpy.mockClear();

    mockUsePathname.mockReturnValue('/board');
    rerender();

    expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
  });

  describe('popstate 감지 (뒤로/앞으로가기)', () => {
    it('popstate 후 pathname 변경 시 window.scrollTo를 호출하지 않는다', () => {
      const { rerender } = renderHook(() => useScrollToTopOnNavigate());
      scrollToSpy.mockClear();

      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      mockUsePathname.mockReturnValue('/board');
      rerender();

      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('뒤로가기 이후 push 내비게이션 시 window.scrollTo(0, 0)이 다시 호출된다 (플래그 리셋)', () => {
      const { rerender } = renderHook(() => useScrollToTopOnNavigate());
      scrollToSpy.mockClear();

      // 뒤로가기: popstate → pathname 변경
      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      mockUsePathname.mockReturnValue('/board');
      rerender();
      scrollToSpy.mockClear();

      // 일반 push 내비게이션
      mockUsePathname.mockReturnValue('/mypage');
      rerender();

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });

    it('연속 push 내비게이션은 매번 window.scrollTo(0, 0)을 호출한다', () => {
      const { rerender } = renderHook(() => useScrollToTopOnNavigate());
      scrollToSpy.mockClear();

      mockUsePathname.mockReturnValue('/board');
      rerender();
      mockUsePathname.mockReturnValue('/mypage');
      rerender();

      expect(scrollToSpy).toHaveBeenCalledTimes(2);
    });
  });

  describe('쿼리만 변경된 뒤로가기 (회귀)', () => {
    beforeEach(() => {
      // window.location.pathname을 usePathname 목 값과 일치시켜 same-pathname popstate를 재현한다
      window.history.pushState({}, '', '/home');
    });

    afterEach(() => {
      window.history.replaceState({}, '', '/');
    });

    it('쿼리만 변경된 뒤로가기 후 push 내비게이션 시 window.scrollTo(0, 0)을 호출한다', () => {
      const { rerender } = renderHook(() => useScrollToTopOnNavigate());
      scrollToSpy.mockClear();

      act(() => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      mockUsePathname.mockReturnValue('/board');
      rerender();

      expect(scrollToSpy).toHaveBeenCalledWith(0, 0);
    });
  });

  it('언마운트 시 popstate 이벤트 리스너가 제거된다', () => {
    const removeListenerSpy = jest.spyOn(window, 'removeEventListener');
    const { unmount } = renderHook(() => useScrollToTopOnNavigate());

    unmount();

    expect(removeListenerSpy).toHaveBeenCalledWith('popstate', expect.any(Function));
  });

  it('pathname 변경 중 언마운트 시 cancelAnimationFrame이 호출된다', () => {
    // rAF를 동기 실행이 아닌 id만 반환하도록 교체해 정리 대상 id를 만든다
    jest.restoreAllMocks();
    const cafSpy = jest.spyOn(window, 'cancelAnimationFrame').mockImplementation(() => {});
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation(() => 42);
    jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

    const { unmount } = renderHook(() => useScrollToTopOnNavigate());
    unmount();

    expect(cafSpy).toHaveBeenCalled();
  });
});
