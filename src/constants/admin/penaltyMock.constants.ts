import type { PenaltyMember, PenaltyRecord } from '@/types/admin/penalty';

// TODO: 페널티 API가 준비되면 목 데이터를 제거하고 서버 데이터로 교체한다.
// 백엔드에 Penalty 도메인 CRUD 엔드포인트가 아직 없어 화면 검증용 목 데이터를 사용한다.

export const MOCK_PENALTY_CARDINAL_NUMBERS = [5, 4, 3, 2, 1];

// TODO: 페널티 규정 API 연동 시 서버에 저장된 규정으로 교체한다.
export const MOCK_PENALTY_GUIDE = [
  '페널티를 받는 기준은 아래와 같아요.',
  '',
  '정기 모임에 출석을 하지 않았을때 (=결석)',
  '과제를 제출하지 않았을 때',
  '경고를 2회 받았을 때',
  '',
  '',
  '경고를 받는 기준을 아래와 같아요.',
  '',
  '과제를 미완성했을 때',
].join('\n');

const POSITIONS = ['백엔드', '프론트엔드', '디자인', '기획'];
const DEPARTMENTS = ['컴퓨터공학과', '소프트웨어학과', '경영학과', '산업공학과'];
// 이름 개수(13)는 페이지 크기(8) 및 기수 필터 간격(5)과 서로소여야
// 페이지를 넘겼을 때 같은 이름이 같은 자리에 반복되지 않는다.
const NAMES = [
  '김위드',
  '이위드',
  '박위드',
  '최위드',
  '정위드',
  '한위드',
  '오위드',
  '윤위드',
  '강위드',
  '조위드',
  '임위드',
  '신위드',
  '서위드',
];

/** 최신 기수부터 1~4개를 연속으로 활동한 것으로 만든다. 태그 2개 노출 + '+N' 케이스를 모두 덮는다. */
function createMockCardinals(index: number) {
  const latest = MOCK_PENALTY_CARDINAL_NUMBERS[index % MOCK_PENALTY_CARDINAL_NUMBERS.length];

  return Array.from({ length: (index % 4) + 1 }, (_, offset) => latest - offset)
    .filter((cardinalNumber) => cardinalNumber >= 1)
    .join(', ');
}

export const MOCK_PENALTY_MEMBERS: PenaltyMember[] = Array.from({ length: 120 }, (_, index) => ({
  id: `penalty-member-${index + 1}`,
  name: NAMES[index % NAMES.length],
  introduction: '안녕하세요 잘부탁드리고 안녕하세요 잘부탁드립니다',
  position: POSITIONS[index % POSITIONS.length],
  department: DEPARTMENTS[index % DEPARTMENTS.length],
  // 목록 표에 보이는 페널티/최근 페널티는 MOCK_PENALTY_RECORDS에서 파생된다(PenaltyPageContent).
  // 아래 두 값은 멤버별 내역을 몇 건 만들지 정하는 시드로만 쓰인다.
  penaltyCount: index % 6,
  recentPenaltyAt: null,
  cardinal: createMockCardinals(index),
  status: index % 17 === 0 ? 'LEFT' : 'ACTIVE',
  profileImageUrl: null,
}));

const PENALTY_REASONS = [
  '정기 모임 무단 결석',
  '스터디 과제 미제출',
  '회비 납부 지연',
  '정기 행사 준비 불참',
  '스터디 발표 자료 미준비',
  '사전 통보 없는 지각',
  '팀 프로젝트 회의 불참',
];

/** 경고는 페널티 점수를 쓰지 않으므로(추가 폼에서도 점수 입력이 비활성) 0점으로 둔다. */
export const MOCK_PENALTY_RECORDS: PenaltyRecord[] = MOCK_PENALTY_MEMBERS.flatMap(
  (member, memberIndex) =>
    Array.from({ length: member.penaltyCount }, (_, index) => {
      // 멤버마다 사유·점수·날짜가 달라지도록 두 인덱스를 섞는다.
      const seed = memberIndex * 7 + index * 3;
      const isWarning = seed % 5 === 4;

      return {
        id: `${member.id}-record-${index + 1}`,
        memberId: member.id,
        type: isWarning ? ('WARNING' as const) : ('PENALTY' as const),
        score: isWarning ? 0 : ((seed + index) % 3) + 1,
        reason: PENALTY_REASONS[seed % PENALTY_REASONS.length],
        createdAt: `2026-${String(((seed + index * 2) % 6) + 3).padStart(2, '0')}-${String((seed % 28) + 1).padStart(2, '0')}`,
      };
    }),
);
