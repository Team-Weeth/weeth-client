import { renderHook, act } from '@testing-library/react';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';

// next/navigation의 useRouter는 jest.setup.tsx에서 전역 mock 처리됨
const routerPush = (
  jest.requireMock('next/navigation') as { useRouter: () => { push: jest.Mock } }
).useRouter().push;

describe('useNavigationGuard', () => {
  let pushStateSpy: jest.SpyInstance;
  let historyBackSpy: jest.SpyInstance;

  beforeEach(() => {
    // history 메서드를 no-op으로 대체하여 jsdom history 오염 방지
    pushStateSpy = jest.spyOn(history, 'pushState').mockImplementation(() => {});
    historyBackSpy = jest.spyOn(history, 'back').mockImplementation(() => {});
    routerPush.mockClear();
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
    historyBackSpy.mockRestore();
    // 테스트 중 DOM에 추가된 anchor 정리
    document.querySelectorAll('a[data-test-anchor]').forEach((el) => el.remove());
  });

  // ──────────────────────────────────────────────
  // 초기 상태
  // ──────────────────────────────────────────────
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

      // popstate → 다이얼로그 열기 (pendingUrl 없음)
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

      // 링크 클릭 시뮬레이션으로 pendingUrl 설정
      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'http://localhost/board');
      anchor.dataset.testAnchor = '1';
      document.body.appendChild(anchor);

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
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
      // guard entry 재설정 확인
      expect(pushStateSpy).toHaveBeenCalledWith(
        { __navigationGuard: true },
        '',
        expect.any(String),
      );
    });

    it('링크 클릭 후 onCancel — 다이얼로그가 닫힌다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'http://localhost/board');
      anchor.dataset.testAnchor = '1';
      document.body.appendChild(anchor);

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
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
    function appendAnchor(href: string, attrs: Record<string, string> = {}) {
      const a = document.createElement('a');
      a.setAttribute('href', href);
      a.dataset.testAnchor = '1';
      Object.entries(attrs).forEach(([k, v]) => a.setAttribute(k, v));
      document.body.appendChild(a);
      return a;
    }

    it('enabled=true 상태에서 같은 origin의 다른 경로 클릭 시 다이얼로그가 열린다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));
      const anchor = appendAnchor('http://localhost/board');

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });

      expect(result.current.open).toBe(true);
    });

    it('현재 guardUrl과 동일한 URL 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));
      // guardUrl.current = location.href = 'http://localhost/'
      const anchor = appendAnchor(location.href);

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });

      expect(result.current.open).toBe(false);
    });

    it('외부 도메인 링크 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));
      const anchor = appendAnchor('https://example.com/page');

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });

      expect(result.current.open).toBe(false);
    });

    it('target="_blank" 링크 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));
      const anchor = appendAnchor('http://localhost/board', { target: '_blank' });

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });

      expect(result.current.open).toBe(false);
    });

    it('enabled=false일 때 링크 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: false }));
      const anchor = appendAnchor('http://localhost/board');

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });

      expect(result.current.open).toBe(false);
    });

    it('ctrl/meta 키와 함께 클릭 시 다이얼로그가 열리지 않는다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));
      const anchor = appendAnchor('http://localhost/board');

      await act(async () => {
        anchor.dispatchEvent(
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

      // isLeaving=true이므로 popstate 핸들러가 조기 반환
      expect(result.current.open).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // 회귀 테스트
  // ──────────────────────────────────────────────

  /**
   * Bug 1: 뒤로가기 → 취소 → 뒤로가기 재시도 시 모달 미표시
   *
   * 구 코드 enabled effect에 `if (isLeaving.current) return;`이 있어서
   * onConfirm 후 enabled가 false → true로 재전환될 때
   * isLeaving=true 상태가 남아 guard가 복원되지 않고,
   * 이후 뒤로가기에서 모달이 열리지 않았던 문제.
   */
  describe('Bug 1 회귀: 뒤로가기 취소 후 재시도 시 모달 미표시', () => {
    it('뒤로가기 → 취소 → 뒤로가기 재시도 시 다이얼로그가 다시 열린다', async () => {
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      // 첫 번째 뒤로가기 시도 → 다이얼로그 열림
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);

      // 취소 → 다이얼로그 닫힘, guard 복원
      await act(async () => {
        result.current.onCancel();
      });
      expect(result.current.open).toBe(false);

      // 두 번째 뒤로가기 시도 → 다이얼로그가 다시 열려야 함
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);
    });

    it('onConfirm 후 enabled false→true 재전환 시 다음 뒤로가기에서 다이얼로그가 열린다', async () => {
      /**
       * 시나리오: 글쓰기 확인 → 이탈 → SPA 내 재편집(enabled 재활성화) → 뒤로가기
       *
       * 구 코드: enabled effect의 `if (isLeaving.current) return;`이
       * onConfirm으로 세팅된 isLeaving=true를 감지해 guard를 복원하지 않음
       * → handlePopState에서 isLeaving=true 상태로 인해 모달 미표시
       *
       * 현 코드: enabled effect에서 isLeaving을 false로 리셋한 후 guard를 push
       */
      const { result, rerender } = renderHook(
        ({ enabled }: { enabled: boolean }) => useNavigationGuard({ enabled }),
        { initialProps: { enabled: true } },
      );

      // 뒤로가기 → 다이얼로그 → 확인 (isLeaving=true 세팅)
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await act(async () => {
        result.current.onConfirm();
      });
      expect(result.current.open).toBe(false);

      // SPA 재편집 시나리오: enabled false → true 재전환
      // RTL rerender는 내부적으로 act를 감싸므로 각 호출 후 effect가 flush됨
      rerender({ enabled: false });
      rerender({ enabled: true }); // enabled effect: isLeaving=false 리셋 + guard push

      // 다음 뒤로가기 → isLeaving이 false이므로 다이얼로그가 열려야 함
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);
    });
  });

  /**
   * Bug 2: 다이얼로그 중복 표시
   *
   * 구 코드 onCancel에 `if (isLeaving.current) { isLeaving = false; return; }` 조기 반환이 있어
   * isLeaving=true인 상태에서 onCancel이 호출되면 setOpen(false)를 부르지 않고 종료했던 문제.
   * 또한 onConfirm 직후 popstate가 연달아 발생할 때 중복 표시 경로가 존재했던 문제.
   */
  describe('Bug 2 회귀: 다이얼로그 중복 표시', () => {
    it('onConfirm 직후 발생하는 popstate로 다이얼로그가 다시 열리지 않는다', async () => {
      /**
       * onConfirm은 isLeaving=true를 세팅한다.
       * history.back()이 유발하는 추가 popstate에서 isLeaving=true이면
       * handlePopState가 조기 반환해야 하며, 다이얼로그가 재개방되어선 안 됨.
       */
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(true);

      // onConfirm → isLeaving=true, 다이얼로그 닫힘
      await act(async () => {
        result.current.onConfirm();
      });
      expect(result.current.open).toBe(false);

      // history.back()에 의해 발생하는 추가 popstate → 다이얼로그가 다시 열리면 안 됨
      await act(async () => {
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      expect(result.current.open).toBe(false);
    });

    it('onCancel은 isLeaving 상태와 무관하게 항상 다이얼로그를 닫는다', async () => {
      /**
       * 구 onCancel: `if (isLeaving.current) { isLeaving=false; return; }` 조기 반환.
       * isLeaving=true 상태에서 onCancel이 호출되면 setOpen(false)가 호출되지 않아
       * 다이얼로그가 열린 채로 남는 문제가 있었음.
       *
       * allowNavigation()은 isLeaving=true를 세팅하므로,
       * 이 상태에서 onCancel을 호출해 다이얼로그가 닫히는지 검증.
       */
      const { result } = renderHook(() => useNavigationGuard({ enabled: true }));

      // 링크 클릭으로 다이얼로그 열기
      const anchor = document.createElement('a');
      anchor.setAttribute('href', 'http://localhost/board');
      anchor.dataset.testAnchor = '1';
      document.body.appendChild(anchor);

      await act(async () => {
        anchor.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
      });
      expect(result.current.open).toBe(true);

      // allowNavigation → isLeaving=true 세팅. setOpen은 호출하지 않으므로 open은 여전히 true
      act(() => {
        result.current.allowNavigation();
      });

      // isLeaving=true인 상태에서 onCancel → 다이얼로그가 닫혀야 함 (구 코드는 early return으로 setOpen(false) 미호출)
      await act(async () => {
        result.current.onCancel();
      });
      expect(result.current.open).toBe(false);
    });
  });
});
