import type { PenaltyMember } from '@/types/admin/penalty';
import {
  formatPenaltyDate,
  getNextPenaltySort,
  searchPenaltyMembers,
  sortPenaltyMembers,
  truncateIntroduction,
} from '@/utils/admin/penaltyPageUtils';

function createMember(
  overrides: Partial<PenaltyMember> & Pick<PenaltyMember, 'id'>,
): PenaltyMember {
  return {
    clubMemberId: 1,
    name: '김위드',
    introduction: '안녕하세요',
    position: '부원',
    department: '컴퓨터공학과',
    penaltyCount: 0,
    recentPenaltyAt: null,
    cardinal: '1',
    status: 'ACTIVE',
    profileImageUrl: null,
    ...overrides,
  };
}

describe('searchPenaltyMembers', () => {
  it('이름에 검색어가 포함된 멤버만 남긴다', () => {
    const members = [
      createMember({ id: 'm1', name: '김위드' }),
      createMember({ id: 'm2', name: '이위드' }),
    ];

    expect(searchPenaltyMembers(members, '김').map((member) => member.id)).toEqual(['m1']);
  });

  it('공백만 입력하거나 비어 있으면 전체를 반환한다', () => {
    const members = [createMember({ id: 'm1' }), createMember({ id: 'm2' })];

    expect(searchPenaltyMembers(members, '   ')).toHaveLength(2);
    expect(searchPenaltyMembers(members, '')).toHaveLength(2);
  });
});

describe('sortPenaltyMembers', () => {
  const members = [
    createMember({ id: 'm1', cardinal: '2', penaltyCount: 1, recentPenaltyAt: '2026-05-10' }),
    createMember({ id: 'm2', cardinal: '5, 4', penaltyCount: 3, recentPenaltyAt: '2026-01-02' }),
    createMember({ id: 'm3', cardinal: '3', penaltyCount: 2, recentPenaltyAt: null }),
  ];

  it('cardinal은 가장 최근 기수 내림차순으로 정렬한다', () => {
    expect(sortPenaltyMembers(members, 'cardinal').map((member) => member.id)).toEqual([
      'm2',
      'm3',
      'm1',
    ]);
  });

  it('penalty는 페널티 점수 내림차순으로 정렬한다', () => {
    expect(sortPenaltyMembers(members, 'penalty').map((member) => member.id)).toEqual([
      'm2',
      'm3',
      'm1',
    ]);
  });

  it('recent는 최근 페널티 내림차순으로 정렬하고 이력 없는 멤버를 뒤로 보낸다', () => {
    expect(sortPenaltyMembers(members, 'recent').map((member) => member.id)).toEqual([
      'm1',
      'm2',
      'm3',
    ]);
  });

  it('원본 배열을 변경하지 않는다', () => {
    const original = [...members];
    sortPenaltyMembers(members, 'penalty');

    expect(members).toEqual(original);
  });
});

describe('getNextPenaltySort', () => {
  it('cardinal → penalty → recent → cardinal 순으로 순환한다', () => {
    expect(getNextPenaltySort('cardinal')).toBe('penalty');
    expect(getNextPenaltySort('penalty')).toBe('recent');
    expect(getNextPenaltySort('recent')).toBe('cardinal');
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
