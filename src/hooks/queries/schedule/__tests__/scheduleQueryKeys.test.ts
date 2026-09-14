import { scheduleQueryKeys } from '@/hooks/queries/schedule/scheduleQueryKeys';

describe('scheduleQueryKeys.all', () => {
  it("['schedules']를 반환한다", () => {
    expect(scheduleQueryKeys.all).toEqual(['schedules']);
  });
});

describe('scheduleQueryKeys.monthly', () => {
  it("['schedules', 'monthly', clubId, year, month, cardinal]을 반환한다", () => {
    expect(scheduleQueryKeys.monthly('club-1', 2026, 9, 7)).toEqual([
      'schedules',
      'monthly',
      'club-1',
      2026,
      9,
      7,
    ]);
  });

  it('clubId가 null이어도 키에 포함된다', () => {
    expect(scheduleQueryKeys.monthly(null, 2026, 9, 0)).toEqual([
      'schedules',
      'monthly',
      null,
      2026,
      9,
      0,
    ]);
  });
});

describe('scheduleQueryKeys.detail', () => {
  it("['schedules', 'detail', clubId, id, type]를 반환한다", () => {
    expect(scheduleQueryKeys.detail('club-1', 42, 'SESSION')).toEqual([
      'schedules',
      'detail',
      'club-1',
      42,
      'SESSION',
    ]);
  });

  it('id와 type이 null이어도 키에 포함된다', () => {
    expect(scheduleQueryKeys.detail('club-1', null, null)).toEqual([
      'schedules',
      'detail',
      'club-1',
      null,
      null,
    ]);
  });
});
