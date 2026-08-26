import type { PenaltyMember } from '@/types/admin/penalty';

// TODO: 페널티 API가 준비되면 목 데이터를 제거하고 서버 데이터로 교체한다.
// 백엔드에 Penalty 도메인 CRUD 엔드포인트가 아직 없어 화면 검증용 목 데이터를 사용한다.

export const MOCK_PENALTY_CARDINAL_NUMBERS = [5, 4, 3, 2, 1];

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

export const MOCK_PENALTY_MEMBERS: PenaltyMember[] = Array.from({ length: 120 }, (_, index) => ({
  id: `penalty-member-${index + 1}`,
  name: NAMES[index % NAMES.length],
  introduction: '안녕하세요 잘부탁드리고 안녕하세요 잘부탁드립니다',
  position: POSITIONS[index % POSITIONS.length],
  department: DEPARTMENTS[index % DEPARTMENTS.length],
  penaltyCount: (index * 3) % 9,
  recentPenaltyAt: index % 7 === 0 ? null : `2026-07-${String((index % 28) + 1).padStart(2, '0')}`,
  cardinal: String(MOCK_PENALTY_CARDINAL_NUMBERS[index % MOCK_PENALTY_CARDINAL_NUMBERS.length]),
}));
