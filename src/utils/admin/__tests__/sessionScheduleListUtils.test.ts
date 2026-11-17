import {
  formatGroupDateRange,
  formatTimeRange,
  formatSessionDate,
  isRepeating,
} from '@/utils/admin/sessionScheduleListUtils';
import type { AdminSessionGroup } from '@/types/admin/session';

function createGroup(overrides: Partial<AdminSessionGroup> = {}): AdminSessionGroup {
  return {
    groupId: null,
    title: '테스트 세션',
    recurrenceType: null,
    recurrenceDescription: null,
    startDate: '2026-06-01',
    endDate: null,
    completedCount: 0,
    totalCount: 1,
    status: 'SCHEDULED',
    sessions: [],
    ...overrides,
  };
}

describe('formatGroupDateRange', () => {
  it('end가 null이면 시작일만 표시한다', () => {
    expect(formatGroupDateRange('2026-06-01', null)).toBe('26.06.01');
  });

  it('end가 있으면 범위로 표시한다', () => {
    expect(formatGroupDateRange('2026-06-01', '2026-07-15')).toBe('26.06.01 ~ 07.15');
  });

  it('같은 달 내 범위를 표시한다', () => {
    expect(formatGroupDateRange('2026-11-01', '2026-11-30')).toBe('26.11.01 ~ 11.30');
  });
});

describe('formatTimeRange', () => {
  it('ISO 문자열에서 시간 범위를 추출한다', () => {
    expect(formatTimeRange('2026-06-01T10:00:00', '2026-06-01T12:30:00')).toBe('10:00 - 12:30');
  });

  it('자정 시간을 처리한다', () => {
    expect(formatTimeRange('2026-06-01T00:00:00', '2026-06-01T01:00:00')).toBe('00:00 - 01:00');
  });
});

describe('formatSessionDate', () => {
  it('날짜와 요일을 포함하여 표시한다', () => {
    // 2026-06-01 is Monday
    expect(formatSessionDate('2026-06-01T10:00:00')).toBe('26.06.01 (월)');
  });

  it('일요일을 올바르게 표시한다', () => {
    // 2026-06-07 is Sunday
    expect(formatSessionDate('2026-06-07T10:00:00')).toBe('26.06.07 (일)');
  });

  it('토요일을 올바르게 표시한다', () => {
    // 2026-06-06 is Saturday
    expect(formatSessionDate('2026-06-06T14:00:00')).toBe('26.06.06 (토)');
  });
});

describe('isRepeating', () => {
  it('recurrenceType이 null이면 false를 반환한다', () => {
    expect(isRepeating(createGroup({ recurrenceType: null }))).toBe(false);
  });

  it('recurrenceType이 NONE이면 false를 반환한다', () => {
    expect(isRepeating(createGroup({ recurrenceType: 'NONE' }))).toBe(false);
  });

  it.each(['DAILY', 'WEEKLY', 'MONTHLY'] as const)(
    'recurrenceType이 %s이면 true를 반환한다',
    (type) => {
      expect(isRepeating(createGroup({ recurrenceType: type }))).toBe(true);
    },
  );
});
