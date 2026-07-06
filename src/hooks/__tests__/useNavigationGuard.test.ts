import { renderHook, act } from '@testing-library/react';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';

// next/navigation의 useRouter는 jest.setup.tsx에서 전역 mock 처리됨
const routerPush = (
  jest.requireMock('next/navigation') as { useRouter: () => { push: jest.Mock } }
).useRouter().push;

describe('useNavigationGuard', () => {
  let pushStateSpy: jest.SpyInstance;
  let historyBackSpy: jest.SpyInstance;

  function appendAnchor(href: string, attrs: Record<string, string> = {}) {
    const a = document.createElement('a');
    a.setAttribute('href', href);
    a.dataset.testAnchor = '1';
    Object.entries(attrs).forEach(([k, v]) => a.setAttribute(k, v));
    document.body.appendChild(a);
    return a;
  }

  beforeEach(() => {
    pushStateSpy = jest.spyOn(history, 'pushState').mockImplementation(() => {});
    historyBackSpy = jest.spyOn(history, 'back').mockImplementation(() => {});
    routerPush.mockClear();
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
    historyBackSpy.mockRestore();
    document.querySelectorAll('a[data-test-anchor]').forEach((el) => el.remove());
  });

  it('초기 상태: open=false', () => {
    const { result } = renderHook(() => useNavigationGuard({ enabled: false }));
    expect(result.current.open).toBe(false);
  });

  // ──────────────────────────────────────────────
  // Guard entry 등록
  // ──────────────────────────────────────────────
  describe('guard entry 등록', () => {
    it('enabled=true이면 history.pushState로 guard entry를 추가한다', () => {
      renderHook(() => useNavigationGuard({ enabled: true }));

      expect(pushStateSpy).toHaveBeenCalledWith(
        { __navigationGuard: true },
        '',
        expect.any(String),
      );
    });

    it('enabled=false이면 history.pushState를 호출하지 않는다', () => {
      renderHook(() => useNavigationGuard({ enabled: false }));

      expect(pushStateSpy).not.toHaveBeenCalled();
    });

    it('enabled가 false → true로 변경되면 guard entry가 추가된다', () => {
      const { rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) => useNavigationGuard({ enabled }),
        { initialProps: { enabled: false } },
      );

      pushStateSpy.mockClear();
      rerender({ enabled: true });

      expect(pushStateSpy).toHaveBeenCalledWith(
        { __navigationGuard: true },
        '',
        expect.any(String),
      );
    });
  });

  // ──────────────────────────────────────────────
  // popstate 이벤트
  // ──────────────────────────────────────────────
  describe('popstate 이벤트', () => {
    it('enabled=true 상태에서 popstate 발생 시 다이얼로그가 열린다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(result.current.open).toBe(true);
    });

    it('enabled=false 상태에서 popstate 발생 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: false }));

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(result.current.open).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // onConfirm
  // ──────────────────────────────────────────────
  describe('onConfirm', () => {
    it('pendingUrl이 없으면 history.back을 호출하고 다이얼로그가 닫힌다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);

      await act(async () => {
        result.current.onConfirm();
      });

      expect(historyBackSpy).toHaveBeenCalledTimes(1);
      expect(result.current.open).toBe(false);
    });

    it('pendingUrl이 있으면 router.push를 호출하고 다이얼로그가 닫힌다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor('http://localhost/board').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });
      expect(result.current.open).toBe(true);

      await act(async () => {
        result.current.onConfirm();
      });

      expect(routerPush).toHaveBeenCalledWith('/board');
      expect(result.current.open).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // onCancel
  // ──────────────────────────────────────────────
  describe('onCancel', () => {
    it('popstate 후 onCancel — 다이얼로그를 닫고 guard entry를 재설정한다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);

      pushStateSpy.mockClear();

      await act(async () => {
        result.current.onCancel();
      });

      expect(result.current.open).toBe(false);
      expect(pushStateSpy).toHaveBeenCalledWith(
        { __navigationGuard: true },
        '',
        expect.any(String),
      );
    });

    it('링크 클릭 후 onCancel — 다이얼로그가 닫힌다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor('http://localhost/board').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });

      await act(async () => {
        result.current.onCancel();
      });

      expect(result.current.open).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // 링크 클릭 인터셉트
  // ──────────────────────────────────────────────
  describe('링크 클릭 인터셉트', () => {
    it('enabled=true 상태에서 같은 origin의 다른 경로 클릭 시 다이얼로그가 열린다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor('http://localhost/board').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });

      expect(result.current.open).toBe(true);
    });

    it('현재 guardUrl과 동일한 URL 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor(location.href).dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });

      expect(result.current.open).toBe(false);
    });

    it('외부 도메인 링크 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor('https://example.com/page').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });

      expect(result.current.open).toBe(false);
    });

    it('target="_blank" 링크 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor('http://localhost/board', { target: '_blank' }).dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });

      expect(result.current.open).toBe(false);
    });

    it('enabled=false일 때 링크 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: false }));

      await act(async () => {
        appendAnchor('http://localhost/board').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });

      expect(result.current.open).toBe(false);
    });

    it('ctrl/meta 키와 함께 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor('http://localhost/board').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true, ctrlKey: true }),
        );
      });

      expect(result.current.open).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // beforeunload 이벤트
  // ──────────────────────────────────────────────
  describe('beforeunload 이벤트', () => {
    it('enabled=true이면 beforeunload 시 preventDefault를 호출한다', () => {
      renderHook(() => useNavigationGuard({ enabled: true }));

      const event = new Event('beforeunload', { cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it('enabled=false이면 beforeunload 시 preventDefault를 호출하지 않는다', () => {
      renderHook(() => useNavigationGuard({ enabled: false }));

      const event = new Event('beforeunload', { cancelable: true });
      const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  // ──────────────────────────────────────────────
  // allowNavigation
  // ──────────────────────────────────────────────
  describe('allowNavigation', () => {
    it('allowNavigation 호출 후 popstate가 발생해도 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      act(() => {
        result.current.allowNavigation();
      });

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });

      expect(result.current.open).toBe(false);
    });

    it('allowNavigation 호출 후 링크 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      act(() => {
        result.current.allowNavigation();
      });

      await act(async () => {
        appendAnchor('http://localhost/board').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });

      expect(result.current.open).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // 회귀 테스트
  // ──────────────────────────────────────────────

  /**
   * Bug 1: enabled effect에 있던 `if (isLeaving.current) return;`이
   * onConfirm 후 SPA 재편집(enabled false→true) 시 guard를 복원하지 않던 문제.
   */
  describe('Bug 1 회귀: 뒤로가기 취소 후 재시도 시 모달 미표시', () => {
    it('뒤로가기 → 취소 → 뒤로가기 재시도 시 다이얼로그가 다시 열린다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);

      await act(async () => {
        result.current.onCancel();
      });
      expect(result.current.open).toBe(false);

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);
    });

    it('onConfirm 후 enabled false→true 재전환 시 다음 뒤로가기에서 다이얼로그가 열린다', async () => {
      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) => useNavigationGuard({ enabled }),
        { initialProps: { enabled: true } },
      );

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await act(async () => {
        result.current.onConfirm();
      });
      expect(result.current.open).toBe(false);

      rerender({ enabled: false });
      rerender({ enabled: true });

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);
    });
  });

  /**
   * Bug 2: onCancel에 있던 `if (isLeaving.current) return;` 조기 반환이
   * setOpen(false)를 건너뛰어 다이얼로그가 열린 채로 남던 문제.
   */
  describe('Bug 2 회귀: 다이얼로그 중복 표시', () => {
    it('onConfirm 직후 발생하는 popstate로 다이얼로그가 다시 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);

      await act(async () => {
        result.current.onConfirm();
      });
      expect(result.current.open).toBe(false);

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(false);
    });

    it('onCancel은 isLeaving 상태와 무관하게 항상 다이얼로그를 닫는다', async () => {
      // allowNavigation()이 isLeaving=true를 세팅한 상태에서도 onCancel이 다이얼로그를 닫아야 함
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        appendAnchor('http://localhost/board').dispatchEvent(
          new MouseEvent('click', { bubbles: true, cancelable: true }),
        );
      });
      expect(result.current.open).toBe(true);

      act(() => {
        result.current.allowNavigation();
      });

      await act(async () => {
        result.current.onCancel();
      });
      expect(result.current.open).toBe(false);
    });
  });
});
