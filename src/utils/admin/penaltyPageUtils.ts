import { PENALTY_INTRODUCTION_MAX_LENGTH } from '@/constants/admin/penaltyTable.constants';
import type { PenaltyMember, PenaltySortBy } from '@/types/admin/penalty';
import { parseCardinals } from './parseCardinals';

function filterPenaltyMembers(members: PenaltyMember[], selectedCardinal: number) {
  return members.filter((member) =>
    parseCardinals(member.cardinal).includes(String(selectedCardinal)),
  );
}

/** 이름으로 멤버를 검색한다. 공백만 입력하거나 비어 있으면 전체를 반환한다. */
function searchPenaltyMembers(members: PenaltyMember[], query: string) {
  const keyword = query.trim().toLowerCase();
  if (!keyword) return members;

  return members.filter((member) => member.name.toLowerCase().includes(keyword));
}

function sortPenaltyMembers(members: PenaltyMember[], sortBy: PenaltySortBy) {
  return [...members].sort((a, b) => {
    if (sortBy === 'penalty') {
      return b.penaltyCount - a.penaltyCount;
    }

    if (sortBy === 'recent') {
      return (b.recentPenaltyAt ?? '').localeCompare(a.recentPenaltyAt ?? '');
    }

    return getLatestCardinalNumber(b.cardinal) - getLatestCardinalNumber(a.cardinal);
  });
}

function getNextPenaltySort(sortBy: PenaltySortBy, order: PenaltySortBy[]) {
  const currentIndex = order.indexOf(sortBy);
  return order[(currentIndex + 1) % order.length];
}

/** '2026-07-18' → '2026. 07. 18.' */
function formatPenaltyDate(date: string | null) {
  if (!date) return '-';

  const [year, month, day] = date.split('-');
  return `${year}. ${month}. ${day}.`;
}

/** 10자를 넘는 자기소개는 '...'으로 말줄임한다. */
function truncateIntroduction(introduction: string) {
  if (introduction.length <= PENALTY_INTRODUCTION_MAX_LENGTH) return introduction;

  return `${introduction.slice(0, PENALTY_INTRODUCTION_MAX_LENGTH)}...`;
}

function getLatestCardinalNumber(cardinal: string) {
  return Math.max(
    ...parseCardinals(cardinal).map((value) => Number(value.replace('기', '')) || 0),
    0,
  );
}

export {
  filterPenaltyMembers,
  formatPenaltyDate,
  getNextPenaltySort,
  searchPenaltyMembers,
  sortPenaltyMembers,
  truncateIntroduction,
};
