import type { PenaltySortBy, PenaltyType } from '@/types/admin/penalty';

export const PENALTY_TABLE_COLUMNS = [
  { id: 'profile', label: '이름/자기소개', width: 'w-[220px]' },
  { id: 'role', label: '역할', width: 'w-[126px]' },
  { id: 'department', label: '학과', width: 'w-[214px]' },
  { id: 'penalty', label: '페널티', width: 'w-[52px]', align: 'text-center' },
  { id: 'recentPenalty', label: '최근 페널티', width: 'w-[126px]' },
  { id: 'cardinal', label: '기수', width: 'w-[182px]' },
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

export const PENALTY_SCORE_MIN = 1;
export const PENALTY_SCORE_MAX = 99;

export const PENALTY_MEMBERS_PER_PAGE = 8;

export const PENALTY_INTRODUCTION_MAX_LENGTH = 10;
