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

/** 페널티 규정 입력 모달의 최대 글자 수 */
export const PENALTY_GUIDE_MAX_LENGTH = 500;

export const PENALTY_INTRODUCTION_MAX_LENGTH = 10;

/** 페널티 상세 모달 표의 헤더/바디가 같은 너비를 공유하기 위한 단일 출처 */
export const PENALTY_DETAIL_COLUMN_WIDTH = {
  score: 'w-[52px]',
  date: 'w-[126px]',
  /** 수정/삭제 버튼 영역 */
  actionsInner: 'w-[106px]',
  /** 버튼 영역 106px + 행 우측 여백 24px */
  actions: 'w-[130px]',
  /** 인라인 편집 모드의 점수 입력 너비 */
  scoreInput: 'w-[88px]',
} as const;

export const PENALTY_DETAIL_TABLE_COLUMNS = [
  { id: 'reason', label: '페널티 사유', className: 'w-auto py-300 pr-400 pl-600' },
  {
    id: 'score',
    label: '페널티',
    className: `${PENALTY_DETAIL_COLUMN_WIDTH.score} px-100 py-300 text-center`,
  },
  {
    id: 'date',
    label: '페널티 일자',
    className: `${PENALTY_DETAIL_COLUMN_WIDTH.date} py-300 pr-600 pl-400`,
  },
] as const;
