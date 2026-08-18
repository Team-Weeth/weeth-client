import { truncateIntroduction } from '@/utils/admin/penaltyPageUtils';

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

  it('빈 문자열은 그대로 반환한다', () => {
    expect(truncateIntroduction('')).toBe('');
  });
});
