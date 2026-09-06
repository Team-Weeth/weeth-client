import type { PenaltyMember, PenaltyRecord } from '@/types/admin/penalty';
import {
  filterPenaltyMembers,
  formatPenaltyDate,
  getMemberPenaltyRecords,
  getNextPenaltySort,
  searchPenaltyMembers,
  sortPenaltyMembers,
  summarizeMemberPenalties,
  truncateIntroduction,
} from '@/utils/admin/penaltyPageUtils';

function createMember(
  overrides: Partial<PenaltyMember> & Pick<PenaltyMember, 'id'>,
): PenaltyMember {
  return {
    name: '김위드',
    introduction: '안녕하세요',
    position: '프론트엔드',
    department: '컴퓨터공학과',
    penaltyCount: 0,
    recentPenaltyAt: null,
    cardinal: '1',
    status: 'ACTIVE',
    profileImageUrl: null,
    ...overrides,
  };
}

function createRecord(
  overrides: Partial<PenaltyRecord> & Pick<PenaltyRecord, 'id' | 'memberId'>,
): PenaltyRecord {
  return {
    type: 'PENALTY',
    score: 1,
    reason: '정기 모임 무단 결석',
    createdAt: '2026-03-01',
    ...overrides,
  };
}

describe('filterPenaltyMembers', () => {
  it('선택한 기수를 활동기수에 포함한 멤버만 남긴다', () => {
    const members = [
      createMember({ id: 'm1', cardinal: '3, 2' }),
      createMember({ id: 'm2', cardinal: '1' }),
      createMember({ id: 'm3', cardinal: '2, 1' }),
    ];

    expect(filterPenaltyMembers(members, 2).map((member) => member.id)).toEqual(['m1', 'm3']);
  });

  it('해당 기수 멤버가 없으면 빈 배열을 반환한다', () => {
    expect(filterPenaltyMembers([createMember({ id: 'm1', cardinal: '1' })], 5)).toEqual([]);
  });
});

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

describe('getMemberPenaltyRecords', () => {
  it('해당 멤버의 내역만 최신순으로 추린다', () => {
    const records = [
      createRecord({ id: 'r1', memberId: 'm1', createdAt: '2026-03-01' }),
      createRecord({ id: 'r2', memberId: 'm2', createdAt: '2026-04-01' }),
      createRecord({ id: 'r3', memberId: 'm1', createdAt: '2026-05-10' }),
    ];

    expect(getMemberPenaltyRecords(records, 'm1').map((record) => record.id)).toEqual(['r3', 'r1']);
  });
});

describe('summarizeMemberPenalties', () => {
  it('멤버별 점수를 합산하고 가장 최근 일자를 남긴다', () => {
    const summary = summarizeMemberPenalties([
      createRecord({ id: 'r1', memberId: 'm1', score: 2, createdAt: '2026-03-01' }),
      createRecord({ id: 'r2', memberId: 'm1', score: 1, createdAt: '2026-05-10' }),
      createRecord({ id: 'r3', memberId: 'm2', score: 3, createdAt: '2026-04-02' }),
    ]);

    expect(summary.get('m1')).toEqual({ penaltyCount: 3, recentPenaltyAt: '2026-05-10' });
    expect(summary.get('m2')).toEqual({ penaltyCount: 3, recentPenaltyAt: '2026-04-02' });
  });

  it('내역 순서와 무관하게 가장 최근 일자를 남긴다', () => {
    const summary = summarizeMemberPenalties([
      createRecord({ id: 'r1', memberId: 'm1', createdAt: '2026-05-10' }),
      createRecord({ id: 'r2', memberId: 'm1', createdAt: '2026-03-01' }),
    ]);

    expect(summary.get('m1')?.recentPenaltyAt).toBe('2026-05-10');
  });

  it('경고는 최근 페널티 일자에 반영하지 않는다', () => {
    const summary = summarizeMemberPenalties([
      createRecord({ id: 'r1', memberId: 'm1', score: 2, createdAt: '2026-03-01' }),
      createRecord({
        id: 'r2',
        memberId: 'm1',
        type: 'WARNING',
        score: 0,
        createdAt: '2026-05-10',
      }),
    ]);

    expect(summary.get('m1')).toEqual({ penaltyCount: 2, recentPenaltyAt: '2026-03-01' });
  });

  it('경고만 받은 멤버의 최근 페널티는 null이다', () => {
    const summary = summarizeMemberPenalties([
      createRecord({ id: 'r1', memberId: 'm1', type: 'WARNING', score: 0 }),
    ]);

    expect(summary.get('m1')).toEqual({ penaltyCount: 0, recentPenaltyAt: null });
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

  it('빈 문자열은 그대로 반환한다', () => {
    expect(truncateIntroduction('')).toBe('');
  });
});
