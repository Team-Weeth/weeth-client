import type { PenaltySortBy, PenaltyType } from '@/types/admin/penalty';

/** 헤더(PENALTY_TABLE_COLUMNS)와 바디(PenaltyTableRow)가 같은 너비를 공유하기 위한 단일 출처 */
export const PENALTY_COLUMN_WIDTH = {
  profile: 'w-[220px]',
  role: 'w-[126px]',
  department: 'w-[214px]',
  penalty: 'w-[52px]',
  recentPenalty: 'w-[126px]',
  cardinal: 'w-[182px]',
} as const;

export const PENALTY_TABLE_COLUMNS = [
  { id: 'profile', label: '이름/자기소개', width: PENALTY_COLUMN_WIDTH.profile },
  { id: 'role', label: '역할', width: PENALTY_COLUMN_WIDTH.role },
  { id: 'department', label: '학과', width: PENALTY_COLUMN_WIDTH.department },
  { id: 'penalty', label: '페널티', width: PENALTY_COLUMN_WIDTH.penalty, align: 'text-center' },
  { id: 'recentPenalty', label: '최근 페널티', width: PENALTY_COLUMN_WIDTH.recentPenalty },
  { id: 'cardinal', label: '기수', width: PENALTY_COLUMN_WIDTH.cardinal },
] as const;

export const PENALTY_SORT_ORDER: PenaltySortBy[] = ['cardinal', 'penalty', 'recent'];

export const PENALTY_SORT_LABEL: Record<PenaltySortBy, string> = {
  cardinal: '기수 순',
  penalty: '페널티 순',
  recent: '최신 순',
};

export const PENALTY_TYPE_OPTIONS: { value: PenaltyType; label: string }[] = [
  { value: 'PENALTY', label: '페널티' },
  { value: 'WARNING', label: '경고' },
];

/** 점수 입력이 비어 있는 상태 (제출 시 유효하지 않은 값) */
export const PENALTY_SCORE_EMPTY = 0;
export const PENALTY_SCORE_MIN = 1;
export const PENALTY_SCORE_MAX = 99;

export const PENALTY_MEMBERS_PER_PAGE = 8;

export const PENALTY_INTRODUCTION_MAX_LENGTH = 10;
