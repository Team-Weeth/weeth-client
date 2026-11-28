import { isSessionInProgress } from '@/utils/admin/sessionUtils';

describe('isSessionInProgress', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 10, 28, 15, 0)); // 2026-11-28 15:00
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each([
    ['시작일이 오늘이면 진행 중이다', '2026-11-28T19:00:00', true],
    ['시작일이 지났으면 진행 중이 아니다', '2026-11-27T19:00:00', false],
    ['시작일이 오지 않았으면 진행 중이 아니다', '2026-11-29T19:00:00', false],
  ])('%s', (_, start, expected) => {
    expect(isSessionInProgress(start)).toBe(expected);
  });
});
