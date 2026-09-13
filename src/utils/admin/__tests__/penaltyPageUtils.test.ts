import {
  formatPenaltyDate,
  getNextPenaltySort,
  truncateIntroduction,
} from '@/utils/admin/penaltyPageUtils';

describe('getNextPenaltySort', () => {
  it('CARDINAL_DESC와 CARDINAL_ASC를 번갈아 반환한다', () => {
    expect(getNextPenaltySort('CARDINAL_DESC')).toBe('CARDINAL_ASC');
    expect(getNextPenaltySort('CARDINAL_ASC')).toBe('CARDINAL_DESC');
  });
});

describe('formatPenaltyDate', () => {
  it("'YYYY-MM-DD'를 'YYYY. MM. DD.' 형식으로 바꾼다", () => {
    expect(formatPenaltyDate('2026-07-18')).toBe('2026. 07. 18.');
  });

  it('날짜가 없으면 하이픈을 반환한다', () => {
    expect(formatPenaltyDate(null)).toBe('-');
  });
});

describe('truncateIntroduction', () => {
  it('10자 이하 자기소개는 그대로 반환한다', () => {
    expect(truncateIntroduction('안녕하세요')).toBe('안녕하세요');
    expect(truncateIntroduction('안녕하세요 잘부탁')).toBe('안녕하세요 잘부탁');
  });

  it('10자를 넘으면 10자까지 자르고 ...을 붙인다', () => {
    expect(truncateIntroduction('안녕하세요 잘부탁드리고 안녕하세요 잘부탁드립니다')).toBe(
      '안녕하세요 잘부탁드...',
    );
  });
});
