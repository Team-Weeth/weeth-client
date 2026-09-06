import {
  PENALTY_INTRODUCTION_MAX_LENGTH,
  PENALTY_SORT_ORDER,
} from '@/constants/admin/penaltyTable.constants';
import type { PenaltyMember, PenaltyRecord, PenaltySortBy } from '@/types/admin/penalty';
import { getLatestCardinalNumber } from './memberTableUtils';
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

function getNextPenaltySort(sortBy: PenaltySortBy, order: PenaltySortBy[] = PENALTY_SORT_ORDER) {
  const currentIndex = order.indexOf(sortBy);
  return order[(currentIndex + 1) % order.length];
}

/** 특정 멤버의 페널티 내역만 최신순으로 추린다. */
function getMemberPenaltyRecords(records: PenaltyRecord[], memberId: string) {
  return records
    .filter((record) => record.memberId === memberId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * 멤버별 페널티 요약(점수 합계, 최근 일자)을 한 번의 순회로 계산한다.
 * 멤버 목록 표의 '페널티' / '최근 페널티' 열이 내역 수정·삭제를 그대로 반영하도록 한다.
 */
function summarizeMemberPenalties(records: PenaltyRecord[]) {
  const summary = new Map<string, Pick<PenaltyMember, 'penaltyCount' | 'recentPenaltyAt'>>();

  for (const record of records) {
    const current = summary.get(record.memberId);
    // 경고는 점수가 0점이고 '최근 페널티' 일자에도 반영하지 않는다.
    const candidate = record.type === 'PENALTY' ? record.createdAt : null;
    const recentPenaltyAt =
      current?.recentPenaltyAt && (!candidate || current.recentPenaltyAt > candidate)
        ? current.recentPenaltyAt
        : candidate;

    summary.set(record.memberId, {
      penaltyCount: (current?.penaltyCount ?? 0) + record.score,
      recentPenaltyAt,
    });
  }

  return summary;
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

export {
  filterPenaltyMembers,
  formatPenaltyDate,
  getMemberPenaltyRecords,
  getNextPenaltySort,
  searchPenaltyMembers,
  sortPenaltyMembers,
  summarizeMemberPenalties,
  truncateIntroduction,
};
