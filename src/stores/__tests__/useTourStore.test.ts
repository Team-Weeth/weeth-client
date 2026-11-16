import { act, renderHook } from '@testing-library/react';

import {
  useActiveTourId,
  useIsTourSuppressed,
  useTourActions,
  useTourCompleted,
  useTourStore,
} from '@/stores/useTourStore';

const initialState = {
  completed: {} as Record<string, number>,
  activeTourId: null,
  suppressors: [] as string[],
  hasHydrated: false,
};

beforeEach(() => {
  useTourStore.setState(initialState);
});

describe('markSeen', () => {
  it('키에 버전을 기록한다', () => {
    act(() => {
      useTourStore.getState().markSeen('user:club:admin-warning', 1);
    });
    expect(useTourStore.getState().completed['user:club:admin-warning']).toBe(1);
  });

  it('기존 키를 지우지 않고 추가한다', () => {
    useTourStore.setState({ completed: { 'a:b:c': 1 } });
    act(() => {
      useTourStore.getState().markSeen('d:e:f', 2);
    });
    expect(useTourStore.getState().completed).toEqual({ 'a:b:c': 1, 'd:e:f': 2 });
  });
});

describe('requestStart / finish — 동시 1개 락', () => {
  it('처음 요청하면 락을 획득하고 true를 반환한다', () => {
    let acquired = false;
    act(() => {
      acquired = useTourStore.getState().requestStart('admin-warning');
    });
    expect(acquired).toBe(true);
    expect(useTourStore.getState().activeTourId).toBe('admin-warning');
  });

  it('이미 다른 투어가 점유 중이면 false를 반환하고 상태를 바꾸지 않는다', () => {
    act(() => {
      useTourStore.getState().requestStart('admin-warning');
    });

    let secondResult = true;
    act(() => {
      secondResult = useTourStore.getState().requestStart('other-tour');
    });

    expect(secondResult).toBe(false);
    expect(useTourStore.getState().activeTourId).toBe('admin-warning');
  });

  it('같은 투어를 다시 요청하면 멱등하게 true를 반환한다', () => {
    act(() => {
      useTourStore.getState().requestStart('admin-warning');
    });

    let secondResult = false;
    act(() => {
      secondResult = useTourStore.getState().requestStart('admin-warning');
    });

    expect(secondResult).toBe(true);
  });

  it('finish는 락을 해제한다', () => {
    act(() => {
      useTourStore.getState().requestStart('admin-warning');
      useTourStore.getState().finish();
    });
    expect(useTourStore.getState().activeTourId).toBeNull();
  });
});

describe('suppress / release', () => {
  it('suppress는 억제자 목록에 추가하고 release는 제거한다', () => {
    act(() => {
      useTourStore.getState().suppress('home-tutorial');
    });
    expect(useTourStore.getState().suppressors).toEqual(['home-tutorial']);

    act(() => {
      useTourStore.getState().release('home-tutorial');
    });
    expect(useTourStore.getState().suppressors).toEqual([]);
  });

  it('같은 id를 두 번 suppress해도 중복되지 않는다 (멱등)', () => {
    act(() => {
      useTourStore.getState().suppress('home-tutorial');
      useTourStore.getState().suppress('home-tutorial');
    });
    expect(useTourStore.getState().suppressors).toEqual(['home-tutorial']);
  });

  it('없는 id를 release해도 에러 없이 무시된다 (멱등)', () => {
    act(() => {
      useTourStore.getState().release('never-suppressed');
    });
    expect(useTourStore.getState().suppressors).toEqual([]);
  });
});

describe('셀렉터 훅', () => {
  it('useTourCompleted: completed 맵을 반환한다', () => {
    useTourStore.setState({ completed: { 'a:b:c': 1 } });
    const { result } = renderHook(() => useTourCompleted());
    expect(result.current).toEqual({ 'a:b:c': 1 });
  });

  it('useActiveTourId: activeTourId를 반환한다', () => {
    useTourStore.setState({ activeTourId: 'admin-warning' });
    const { result } = renderHook(() => useActiveTourId());
    expect(result.current).toBe('admin-warning');
  });

  it('useIsTourSuppressed: 억제자가 있으면 true다', () => {
    useTourStore.setState({ suppressors: ['home-tutorial'] });
    const { result } = renderHook(() => useIsTourSuppressed());
    expect(result.current).toBe(true);
  });

  it('useTourActions: 액션 함수들을 반환하고 호출 시 스토어를 갱신한다', () => {
    const { result } = renderHook(() => useTourActions());
    act(() => {
      result.current.markSeen('x:y:z', 1);
    });
    expect(useTourStore.getState().completed['x:y:z']).toBe(1);
  });
});

describe('persist — 메모리 전용 필드 제외', () => {
  it('partialize는 completed만 남긴다', () => {
    const partialize = useTourStore.persist.getOptions().partialize;
    const state = {
      ...useTourStore.getState(),
      completed: { 'a:b:c': 1 },
      activeTourId: 'admin-warning',
      suppressors: ['home-tutorial'],
      hasHydrated: true,
    };

    expect(partialize?.(state)).toEqual({ completed: { 'a:b:c': 1 } });
  });
});
