import { renderHook, act } from '@testing-library/react';

import { useRemainingTime } from '@/hooks/useRemainingTime';

const NOW = new Date('2026-01-01T00:00:00.000Z').getTime();
const toISO = (ms: number) => new Date(ms).toISOString();

describe('useRemainingTime', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('남은 시간을 minutes/seconds로 반환한다', () => {
    const endTime = toISO(NOW + 5 * 60 * 1000 + 9 * 1000); // 5분 9초
    const { result } = renderHook(() => useRemainingTime(endTime));

    expect(result.current.minutes).toBe('05');
    expect(result.current.seconds).toBe('09');
    expect(result.current.isExpired).toBe(false);
  });

  it('분/초를 항상 2자리로 패딩한다', () => {
    const endTime = toISO(NOW + 1 * 60 * 1000 + 5 * 1000); // 1분 5초
    const { result } = renderHook(() => useRemainingTime(endTime));

    expect(result.current.minutes).toBe('01');
    expect(result.current.seconds).toBe('05');
  });

  it('1초 경과 후 카운트다운된다', () => {
    const endTime = toISO(NOW + 10 * 1000); // 10초
    const { result } = renderHook(() => useRemainingTime(endTime));
    expect(result.current.seconds).toBe('10');

    act(() => {
      jest.advanceTimersByTime(1000);
    });

    expect(result.current.seconds).toBe('09');
    expect(result.current.isExpired).toBe(false);
  });

  it('시간이 모두 경과하면 isExpired가 true가 된다', () => {
    const endTime = toISO(NOW + 2 * 1000); // 2초
    const { result } = renderHook(() => useRemainingTime(endTime));

    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(result.current.minutes).toBe('00');
    expect(result.current.seconds).toBe('00');
    expect(result.current.isExpired).toBe(true);
  });

  it('이미 만료된 시각이면 즉시 isExpired가 true이다', () => {
    const endTime = toISO(NOW - 1000); // 1초 전에 이미 만료
    const { result } = renderHook(() => useRemainingTime(endTime));

    expect(result.current.isExpired).toBe(true);
    expect(result.current.minutes).toBe('00');
    expect(result.current.seconds).toBe('00');
  });

  it('빈 문자열이면 즉시 isExpired가 true이다', () => {
    const { result } = renderHook(() => useRemainingTime(''));

    expect(result.current.isExpired).toBe(true);
  });
});
