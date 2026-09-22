import type { ClubMemberSort } from '@/lib/apis/adminMember';
import type { Cardinal } from '@/types/admin/cardinal';
import type { Member } from '@/types/admin/member';
import { getCommonCardinals } from './cardinalSelectionUtils';
import { compareLatestCardinalDesc, getCardinalNumber } from './memberTableUtils';
import { parseCardinals } from './parseCardinals';

type MemberSortBy = 'cardinal' | 'name';

/** 화면의 정렬 토글을 서버가 아는 값으로 옮긴다. 정렬도 페이지 단위라 서버가 해야 한다. */
const MEMBER_SORT_PARAM: Record<MemberSortBy, ClubMemberSort> = {
  cardinal: 'CARDINAL_DESC',
  name: 'NAME_ASC',
};

interface CardinalChangeRequest {
  clubMemberId: number;
  cardinalIds: number[];
}

function sortMembers(members: Member[], sortBy: MemberSortBy) {
  return [...members].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ko');
    }

    return compareLatestCardinalDesc(a, b);
  });
}

function getMemberIds(members: Member[]) {
  return members.map((member) => member.clubMemberId);
}

function getMemberCardinalNumbers(cardinal: string) {
  return parseCardinals(cardinal).map(getCardinalNumber).filter(Boolean);
}

function getSelectedMemberCardinals(members: Member[]) {
  return members.map((member) => getMemberCardinalNumbers(member.cardinal));
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

export {
  MEMBER_SORT_PARAM,
  createBulkCardinalChangeRequests,
  getMemberCardinalNumbers,
  getMemberIds,
  getSelectedMemberCardinals,
  sortMembers,
  type CardinalChangeRequest,
  type MemberSortBy,
};
