import { matchesScheduleQuery } from '@/utils/admin/scheduleUtils';

describe('matchesScheduleQuery', () => {
  const schedule = { title: '주간 회의', location: '공학관 101호' };

  it.each([
    ['제목 일부', '회의', true],
    ['장소 일부', '공학관', true],
    ['대소문자·앞뒤 공백 무시', '  주간  ', true],
    ['일치 없음', '세미나', false],
    ['빈 검색어', '   ', true],
  ])('%s → %s', (_, query, expected) => {
    expect(matchesScheduleQuery(schedule, query)).toBe(expected);
  });

  it.each([
    ['undefined', undefined],
    ['null', null],
  ])('장소가 %s여도 제목으로 검색된다', (_, location) => {
    expect(matchesScheduleQuery({ title: '엠티', location }, '엠티')).toBe(true);
    expect(matchesScheduleQuery({ title: '엠티', location }, '공학관')).toBe(false);
  });
});
