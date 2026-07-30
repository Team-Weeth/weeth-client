import type { Cardinal } from '@/types/admin/cardinal';
import type { Member } from '@/types/admin/member';
import { getCommonCardinals } from './cardinalSelectionUtils';
import { parseCardinals } from './parseCardinals';

type MemberSortBy = 'cardinal' | 'name';

interface CardinalChangeRequest {
  clubMemberId: number;
  cardinalIds: number[];
}

function filterMembers(members: Member[], selectedCardinal: number | 'all', searchQuery: string) {
  return members.filter((member) => {
    const matchesCardinal =
      selectedCardinal === 'all' ||
      parseCardinals(member.cardinal).includes(String(selectedCardinal));

    return matchesCardinal && matchesMemberSearch(member, searchQuery);
  });
}

function sortMembers(members: Member[], sortBy: MemberSortBy) {
  return [...members].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ko');
    }

    return getLatestCardinalNumber(b.cardinal) - getLatestCardinalNumber(a.cardinal);
  });
}

function getMemberIds(members: Member[]) {
  return members.map((member) => member.clubMemberId);
}

function getMemberCardinalNumbers(cardinal: string) {
  return parseCardinals(cardinal)
    .map((value) => Number(value.replace('기', '')) || 0)
    .filter(Boolean);
}

function getSelectedMemberCardinals(members: Member[]) {
  return members.map((member) => getMemberCardinalNumbers(member.cardinal));
}

function matchesMemberSearch(member: Member, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  return [member.name, member.position, member.department, member.studentId, member.phone].some(
    (value) => value.toLowerCase().includes(normalizedQuery),
  );
}

function createBulkCardinalChangeRequests({
  selectedMembers,
  selectedMemberCardinals,
  selectedCardinalNumbers,
  cardinals,
}: {
  selectedMembers: Member[];
  selectedMemberCardinals: number[][];
  selectedCardinalNumbers: number[];
  cardinals: Cardinal[];
}): CardinalChangeRequest[] {
  const commonCardinalNumbers = new Set(getCommonCardinals(selectedMemberCardinals));
  const nextSelectedCardinalNumbers = new Set(selectedCardinalNumbers);
  const cardinalIdByNumber = new Map(cardinals.map((c) => [c.cardinalNumber, c.id]));

  return selectedMembers.map((member) => {
    const preservedPartialNumbers = getMemberCardinalNumbers(member.cardinal).filter(
      (cardinal) => !commonCardinalNumbers.has(cardinal),
    );
    const nextCardinalIds = [
      ...new Set([...preservedPartialNumbers, ...nextSelectedCardinalNumbers]),
    ]
      .map((cardinal) => cardinalIdByNumber.get(cardinal))
      .filter((id): id is number => id !== undefined);

    return { clubMemberId: member.clubMemberId, cardinalIds: nextCardinalIds };
  });
}

function getLatestCardinalNumber(cardinal: string) {
  return Math.max(
    ...parseCardinals(cardinal).map((value) => Number(value.replace('기', '')) || 0),
    0,
  );
}

export {
  createBulkCardinalChangeRequests,
  filterMembers,
  getMemberCardinalNumbers,
  getMemberIds,
  getSelectedMemberCardinals,
  matchesMemberSearch,
  sortMembers,
  type CardinalChangeRequest,
  type MemberSortBy,
};
