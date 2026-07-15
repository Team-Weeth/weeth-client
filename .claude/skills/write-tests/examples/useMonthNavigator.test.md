# Hook Test Example — useMonthNavigator

Example test written at `src/hooks/__tests__/useMonthNavigator.test.ts`.

Source: `src/hooks/useMonthNavigator.ts`

```ts
import { renderHook, act } from '@testing-library/react';
import { useMonthNavigator } from '@/hooks/useMonthNavigator';

describe('useMonthNavigator', () => {
  // 날짜 의존적인 초기값을 결정론적으로 고정
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2025, 5, 1)); // 2025년 6월
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('현재 년/월로 초기화된다', () => {
    const { result } = renderHook(() => useMonthNavigator());
    expect(result.current.year).toBe(2025);
    expect(result.current.month).toBe(6);
  });

  it('prev() — 이전 달로 이동한다', () => {
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.prev();
    });

    expect(result.current.year).toBe(2025);
    expect(result.current.month).toBe(5);
  });

  it('next() — 다음 달로 이동한다', () => {
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.next();
    });

    expect(result.current.year).toBe(2025);
    expect(result.current.month).toBe(7);
  });

  it('1월에서 prev() — 전년도 12월로 이동한다 (연도 경계)', () => {
    jest.setSystemTime(new Date(2025, 0, 1)); // 2025년 1월
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.prev();
    });

    expect(result.current.year).toBe(2024);
    expect(result.current.month).toBe(12);
  });

  it('12월에서 next() — 다음 년도 1월로 이동한다 (연도 경계)', () => {
    jest.setSystemTime(new Date(2025, 11, 1)); // 2025년 12월
    const { result } = renderHook(() => useMonthNavigator());

    act(() => {
      result.current.next();
    });

    expect(result.current.year).toBe(2026);
    expect(result.current.month).toBe(1);
  });
});
```

## 포인트

| 패턴 | 이유 |
|------|------|
| `jest.useFakeTimers()` + `jest.setSystemTime()` | `new Date()`로 초기화되는 훅은 시스템 시간에 의존하므로 고정 필수 |
| `act(() => { ... })` | 상태를 변경하는 모든 훅 호출은 `act`로 감싸야 React 업데이트가 완료됨 |
| `beforeEach` / `afterEach` 쌍 | `useRealTimers()` 복구를 빠뜨리면 후속 테스트 타이머가 오염됨 |
| 연도 경계 케이스 별도 `it` | 분기 로직(`if month === 1`, `if month === 12`)은 각 분기마다 하나씩 검증 |
