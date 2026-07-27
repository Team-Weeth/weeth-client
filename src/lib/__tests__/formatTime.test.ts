import { formatKoreanDate, formatMonthDay, formatShortDateTime } from '@/lib/formatTime';

describe('formatKoreanDate', () => {
  it('날짜를 한국어 형식으로 반환한다', () => {
    expect(formatKoreanDate(new Date(2026, 2, 20))).toBe('2026년 3월 20일');
  });

  it('월과 일에 zero-padding을 하지 않는다', () => {
    expect(formatKoreanDate(new Date(2026, 0, 1))).toBe('2026년 1월 1일');
  });

  it('12월 31일을 올바르게 반환한다', () => {
    expect(formatKoreanDate(new Date(2026, 11, 31))).toBe('2026년 12월 31일');
  });
});

describe('formatMonthDay', () => {
  it('날짜를 MM/DD 형식으로 반환한다', () => {
    expect(formatMonthDay('2026-03-20T12:30:00')).toBe('03/20');
  });

  it('한 자리 월과 일을 zero-padding한다', () => {
    expect(formatMonthDay('2026-01-05T00:00:00')).toBe('01/05');
  });
});

describe('formatShortDateTime', () => {
  it('날짜와 시간을 MM/DD HH:mm 형식으로 반환한다', () => {
    expect(formatShortDateTime('2026-03-20T14:30:00')).toBe('03/20 14:30');
  });

  it('한 자리 시간과 분을 zero-padding한다', () => {
    expect(formatShortDateTime('2026-01-05T09:05:00')).toBe('01/05 09:05');
  });
});
