import {
  PENALTY_INTRODUCTION_MAX_LENGTH,
  PENALTY_SORT_ORDER,
} from '@/constants/admin/penaltyTable.constants';
import type { PenaltySortBy } from '@/types/admin/penalty';
import { formatDateDisplay } from '@/utils/shared/date';

function getNextPenaltySort(sortBy: PenaltySortBy, order: PenaltySortBy[] = PENALTY_SORT_ORDER) {
  const currentIndex = order.indexOf(sortBy);
  return order[(currentIndex + 1) % order.length];
}

/** '2026-07-18' → '2026. 07. 18.' (이력이 없으면 '-') */
function formatPenaltyDate(date: string | null) {
  if (!date) return '-';

  return `${formatDateDisplay(date)}.`;
}

/** 10자를 넘는 자기소개는 '...'으로 말줄임한다. */
function truncateIntroduction(introduction: string) {
  if (introduction.length <= PENALTY_INTRODUCTION_MAX_LENGTH) return introduction;

  return `${introduction.slice(0, PENALTY_INTRODUCTION_MAX_LENGTH)}...`;
}

export { formatPenaltyDate, getNextPenaltySort, truncateIntroduction };
