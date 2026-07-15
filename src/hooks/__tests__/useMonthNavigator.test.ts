import { renderHook, act } from '@testing-library/react';

import { useMonthNavigator } from '@/hooks/useMonthNavigator';

describe('useMonthNavigator', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 1)); // 2026년 6월
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('현재 년/월로 초기화된다', () => {
    const { result } = renderHook(() => useMonthNavigator());
    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(6);
  });

  it('prev() — 이전 달로 이동한다', () => {
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.prev();
    });

    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(5);
  });

  it('next() — 다음 달로 이동한다', () => {
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.next();
    });

    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(7);
  });

  it('1월에서 prev() — 전년도 12월로 이동한다 (연도 경계)', () => {
    jest.setSystemTime(new Date(2026, 0, 1)); // 2026년 1월
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.prev();
    });

    expect(result.current.year).toBe(2025);
    expect(result.current.month).toBe(12);
  });

  it('12월에서 next() — 다음 년도 1월로 이동한다 (연도 경계)', () => {
    jest.setSystemTime(new Date(2026, 11, 1)); // 2026년 12월
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.next();
    });

    expect(result.current.year).toBe(2027);
    expect(result.current.month).toBe(1);
  });
});
