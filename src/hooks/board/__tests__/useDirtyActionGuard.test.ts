import { renderHook, act } from '@testing-library/react';
import { useDirtyActionGuard } from '../useDirtyActionGuard';

describe('useDirtyActionGuard', () => {
  // ──────────────────────────────────────────────
  // 초기 상태
  // ──────────────────────────────────────────────
  it('초기 상태: pendingAction=null, guardOpen=false', () => {
    const { result } = renderHook(() => useDirtyActionGuard(false));
    expect(result.current.pendingAction).toBeNull();
    expect(result.current.guardOpen).toBe(false);
  });

  // ──────────────────────────────────────────────
  // requestAction
  // ──────────────────────────────────────────────
  describe('requestAction', () => {
    it('isDirty=false이면 false를 반환하고 상태가 변하지 않는다', () => {
      const { result } = renderHook(() => useDirtyActionGuard(false));

      let returned: boolean;
      act(() => {
        returned = result.current.requestAction(1);
      });

      expect(returned!).toBe(false);
      expect(result.current.guardOpen).toBe(false);
      expect(result.current.pendingAction).toBeNull();
    });

    it('isDirty=true이면 true를 반환하고 guardOpen이 열리며 pendingAction이 설정된다', () => {
      const { result } = renderHook(() => useDirtyActionGuard(true));

      act(() => {
        result.current.requestAction(42);
      });

      expect(result.current.guardOpen).toBe(true);
      expect(result.current.pendingAction).toBe(42);
    });

    it('여러 번 호출하면 마지막 id로 덮어쓴다', () => {
      const { result } = renderHook(() => useDirtyActionGuard(true));

      act(() => {
        result.current.requestAction(1);
        result.current.requestAction(99);
      });

      expect(result.current.pendingAction).toBe(99);
    });
  });

  // ──────────────────────────────────────────────
  // confirm
  // ──────────────────────────────────────────────
  describe('confirm', () => {
    it('pendingAction id를 반환하고 guardOpen이 닫힌다', () => {
      const { result } = renderHook(() => useDirtyActionGuard(true));
      act(() => {
        result.current.requestAction(7);
      });

      let returned: number | null;
      act(() => {
        returned = result.current.confirm();
      });

      expect(returned!).toBe(7);
      expect(result.current.pendingAction).toBeNull();
      expect(result.current.guardOpen).toBe(false);
    });

    it('pendingAction이 없을 때 confirm하면 null을 반환한다', () => {
      const { result } = renderHook(() => useDirtyActionGuard(false));

      let returned: number | null;
      act(() => {
        returned = result.current.confirm();
      });

      expect(returned!).toBeNull();
    });
  });

  // ──────────────────────────────────────────────
  // cancel
  // ──────────────────────────────────────────────
  describe('cancel', () => {
    it('pendingAction을 초기화하고 guardOpen이 닫힌다', () => {
      const { result } = renderHook(() => useDirtyActionGuard(true));
      act(() => {
        result.current.requestAction(5);
      });
      expect(result.current.guardOpen).toBe(true);

      act(() => {
        result.current.cancel();
      });

      expect(result.current.pendingAction).toBeNull();
      expect(result.current.guardOpen).toBe(false);
    });
  });

  // ──────────────────────────────────────────────
  // confirm/cancel 후 재사용
  // ──────────────────────────────────────────────
  it('cancel 후 requestAction을 다시 호출하면 정상 동작한다', () => {
    const { result } = renderHook(() => useDirtyActionGuard(true));

    act(() => {
      result.current.requestAction(1);
    });
    act(() => {
      result.current.cancel();
    });
    act(() => {
      result.current.requestAction(2);
    });

    expect(result.current.pendingAction).toBe(2);
    expect(result.current.guardOpen).toBe(true);
  });
});
