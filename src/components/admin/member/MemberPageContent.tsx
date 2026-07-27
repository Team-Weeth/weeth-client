'use client';

import { useState } from 'react';

import {
  CardinalPillList,
  ChangeCardinalsModal,
  MemberDetailModal,
  MemberSearchBar,
  MemberTable,
  MemberTopBar,
  matchesMemberSearch,
} from '@/components/admin';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, Icon } from '@/components/ui';
import { ConvertIcon } from '@/assets/icons';
import { MEMBER_CARDINAL_ERROR_CODE, MEMBER_ROLE_ERROR_CODE } from '@/constants/errorCode';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import { useAdminMembers } from '@/hooks/queries/admin';
import { useCardinals } from '@/hooks/queries';
import { useUserRole } from '@/stores';
import {
  useBanMember,
  useChangeMemberCardinals,
  useChangeMemberRole,
  useRestoreMember,
  useTransferLead,
} from '@/hooks/mutations/admin';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getCommonCardinals } from '@/utils/admin/cardinalSelectionUtils';
import { getBulkBanAction, getBulkTargetRole } from '@/utils/admin/memberBulkActions';
import { parseCardinals } from '@/utils/admin/parseCardinals';
import { getApiErrorCode } from '@/utils/shared';
import { runBulkMutation } from '@/utils/shared/runBulkMutation';

interface ForceConfirmState {
  requests: CardinalChangeRequest[];
}

interface CardinalChangeRequest {
  clubMemberId: number;
  cardinalIds: number[];
}

type MemberSortBy = 'cardinal' | 'name';

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [cardinalModalMemberId, setCardinalModalMemberId] = useState<string | null>(null);
  const [selectedCardinal, setSelectedCardinal] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<MemberSortBy>('cardinal');
  const [searchQuery, setSearchQuery] = useState('');
  const { data: members = [] } = useAdminMembers();
  const { data: cardinals = [] } = useCardinals();
  const { mutateAsync: changeMemberRoleAsync } = useChangeMemberRole();
  const { mutateAsync: banMemberAsync } = useBanMember();
  const { mutateAsync: restoreMemberAsync } = useRestoreMember();
  const { mutate: transferLead } = useTransferLead();
  const myRole = useUserRole();
  const isLead = myRole === 'LEAD';
  const { mutateAsync: changeMemberCardinalsAsync } = useChangeMemberCardinals();
  const [forceConfirm, setForceConfirm] = useState<ForceConfirmState | null>(null);

  const detailMember = detailMemberId
    ? (members.find((m) => m.id === detailMemberId) ?? null)
    : null;
  const cardinalModalMember = cardinalModalMemberId
    ? (members.find((m) => m.id === cardinalModalMemberId) ?? null)
    : null;

  const handleMemberAction = (m: Member) => {
    setDetailMemberId(m.id);
  };

  const cardinalFilteredMembers =
    selectedCardinal === 'all'
      ? members
      : members.filter((m) => parseCardinals(m.cardinal).includes(String(selectedCardinal)));

  const searchedMembers = cardinalFilteredMembers.filter((member) =>
    matchesMemberSearch(member, searchQuery),
  );

  const filteredMembers = sortMembers(searchedMembers, sortBy);

  const selectedMembers = filteredMembers.filter((m) => selectedIds.has(m.id));
  const selectedCount = selectedMembers.length;
  const selectedMemberCardinals = selectedMembers.map((m) => getMemberCardinalNumbers(m.cardinal));

  const targetRole = getBulkTargetRole(selectedMembers);
  const targetBanAction = getBulkBanAction(selectedMembers);

  const handleClearSelection = () => setSelectedIds(new Set());

  const submitCardinalsChange = async (
    clubMemberIds: number[],
    cardinalIds: number[],
    force = false,
  ) => {
    const requests = clubMemberIds.map((clubMemberId) => ({ clubMemberId, cardinalIds }));
    await submitCardinalChangeRequests(requests, force);
  };

  const submitCardinalChangeRequests = async (requests: CardinalChangeRequest[], force = false) => {
    const results = await Promise.allSettled(
      requests.map(({ clubMemberId, cardinalIds }) =>
        changeMemberCardinalsAsync({ clubMemberId, cardinalIds, force }),
      ),
    );

    const attendanceFailedRequests: CardinalChangeRequest[] = [];
    let otherErrorCount = 0;

    results.forEach((result, idx) => {
      if (result.status !== 'rejected') return;
      const code = getApiErrorCode(result.reason);
      if (code === MEMBER_CARDINAL_ERROR_CODE.REMOVAL_HAS_ATTENDANCE) {
        attendanceFailedRequests.push(requests[idx]);
      } else {
        otherErrorCount += 1;
      }
    });

    if (attendanceFailedRequests.length > 0) {
      setForceConfirm({ requests: attendanceFailedRequests });
      return;
    }

    if (otherErrorCount > 0) {
      toastError('기수 변경에 실패했습니다.');
      return;
    }

    toastSuccess('기수가 변경되었습니다.');
  };

  const submitChangeRole = (clubMemberIds: number[], memberRole: ClubMemberRole) =>
    runBulkMutation(
      clubMemberIds.map((clubMemberId) => ({ clubMemberId, memberRole })),
      changeMemberRoleAsync,
      { success: '권한이 변경되었습니다.', error: '권한 변경에 실패했습니다.' },
      (errors) => {
        const isLeadTransferOnly = errors.some(
          (err) => getApiErrorCode(err) === MEMBER_ROLE_ERROR_CODE.LEAD_TRANSFER_ONLY,
        );
        return isLeadTransferOnly ? '리더는 이양을 통해서만 변경할 수 있습니다.' : undefined;
      },
    );

  const submitBan = (clubMemberIds: number[]) =>
    runBulkMutation(clubMemberIds, banMemberAsync, {
      success: '추방되었습니다.',
      error: '추방에 실패했습니다.',
    });

  const submitRestore = (clubMemberIds: number[]) =>
    runBulkMutation(clubMemberIds, restoreMemberAsync, {
      success: '복구되었습니다.',
      error: '복구에 실패했습니다.',
    });

  const handleChangeCardinalsForBulk = (cardinalIds: number[], cardinalNumbers: number[]) => {
    const commonCardinalNumbers = new Set(getCommonCardinals(selectedMemberCardinals));
    const selectedCardinalNumbers = new Set(cardinalNumbers);
    const cardinalIdByNumber = new Map(cardinals.map((c) => [c.cardinalNumber, c.id]));

    const requests = selectedMembers.map((member) => {
      const preservedPartialNumbers = getMemberCardinalNumbers(member.cardinal).filter(
        (cardinal) => !commonCardinalNumbers.has(cardinal),
      );
      const nextCardinalIds = [...new Set([...preservedPartialNumbers, ...selectedCardinalNumbers])]
        .map((cardinal) => cardinalIdByNumber.get(cardinal))
        .filter((id): id is number => id !== undefined);

      return { clubMemberId: member.clubMemberId, cardinalIds: nextCardinalIds };
    });

    submitCardinalChangeRequests(requests);
  };

  const handleTransferLead = (clubMemberId: number) => {
    transferLead(clubMemberId, {
      onSuccess: () => toastSuccess('리더로 변경되었습니다.'),
      onError: (err) => {
        if (getApiErrorCode(err) === MEMBER_ROLE_ERROR_CODE.ONLY_LEAD_CAN_TRANSFER) {
          toastError('리더만 권한을 이양할 수 있습니다.');
        } else {
          toastError('리더 변경에 실패했습니다.');
        }
      },
    });
  };

  const handleForceConfirm = () => {
    if (!forceConfirm) return;
    const { requests } = forceConfirm;
    setForceConfirm(null);
    submitCardinalChangeRequests(requests, true);
  };

  return (
    <>
      <div className="flex min-h-full min-w-0 pr-450">
        <div className="bg-container-neutral flex min-w-0 flex-1 flex-col rounded-t-[20px]">
          {/* Selection top bar */}
          <MemberTopBar
            selectedCount={selectedCount}
            targetRole={targetRole}
            targetBanAction={targetBanAction}
            onBack={handleClearSelection}
            onChangeRole={
              targetRole
                ? () =>
                    submitChangeRole(
                      selectedMembers.map((m) => m.clubMemberId),
                      targetRole,
                    )
                : undefined
            }
            onBan={
              targetBanAction === 'ban'
                ? () => submitBan(selectedMembers.map((m) => m.clubMemberId))
                : undefined
            }
            onRestore={
              targetBanAction === 'restore'
                ? () => submitRestore(selectedMembers.map((m) => m.clubMemberId))
                : undefined
            }
            onChangeCardinals={handleChangeCardinalsForBulk}
            selectedMemberName={selectedMembers[0]?.name}
            selectedMemberCardinals={selectedMemberCardinals}
            onTransferLead={
              isLead && selectedCount === 1
                ? () => handleTransferLead(selectedMembers[0].clubMemberId)
                : undefined
            }
          />

          <section className="flex shrink-0 flex-col">
            <div className="flex h-[100px] items-center justify-between px-700 py-700">
              <h1 className="typo-h2 text-text-strong">멤버관리</h1>

              <div className="flex items-center gap-400">
                <MemberSearchBar value={searchQuery} onValueChange={setSearchQuery} />
                <div className="bg-line h-3.5 w-px" aria-hidden />
                <button
                  type="button"
                  onClick={() => setSortBy((prev) => (prev === 'cardinal' ? 'name' : 'cardinal'))}
                  className="typo-sub1 text-text-alternative hover:text-text-strong flex h-9 cursor-pointer items-center gap-200 rounded-sm px-200 transition-colors"
                  aria-label={`${sortBy === 'cardinal' ? '이름' : '기수'} 순으로 정렬`}
                >
                  <Icon src={ConvertIcon} size={20} className="text-icon-alternative" />
                  {sortBy === 'cardinal' ? '기수 순' : '이름 순'}
                </button>
              </div>
            </div>

            <div className="flex h-14 items-end overflow-hidden px-700">
              <CardinalPillList
                cardinals={cardinals}
                selectedCardinal={selectedCardinal}
                onSelectCardinal={setSelectedCardinal}
              />
            </div>
          </section>

          {/* Main content */}
          <div className="flex flex-col p-700">
            {/* Member table */}
            <MemberTable
              members={filteredMembers}
              selectedIds={selectedIds}
              onSelectionChange={setSelectedIds}
              onMemberAction={handleMemberAction}
            />
          </div>
        </div>
      </div>

      {/* Member detail modal */}
      <MemberDetailModal
        open={detailMember !== null}
        onOpenChange={(open) => {
          if (!open) setDetailMemberId(null);
        }}
        member={detailMember}
        onBan={detailMember ? () => submitBan([detailMember.clubMemberId]) : undefined}
        onRestore={detailMember ? () => submitRestore([detailMember.clubMemberId]) : undefined}
        onChangeRole={
          detailMember
            ? () => {
                const nextRole = detailMember.memberRole === 'ADMIN' ? 'USER' : 'ADMIN';
                submitChangeRole([detailMember.clubMemberId], nextRole);
              }
            : undefined
        }
        onChangeCardinals={
          detailMember
            ? () => {
                setCardinalModalMemberId(detailMember.id);
                setDetailMemberId(null);
              }
            : undefined
        }
        onTransferLead={
          isLead && detailMember ? () => handleTransferLead(detailMember.clubMemberId) : undefined
        }
      />

      <ChangeCardinalsModal
        open={cardinalModalMember !== null}
        onOpenChange={(open) => {
          if (!open) setCardinalModalMemberId(null);
        }}
        overline={
          cardinalModalMember
            ? `'${cardinalModalMember.name}'의 기수를 선택하세요`
            : '멤버 기수 변경'
        }
        memberCardinals={
          cardinalModalMember ? [getMemberCardinalNumbers(cardinalModalMember.cardinal)] : []
        }
        onSubmit={(cardinalIds) => {
          if (!cardinalModalMember) return;
          submitCardinalsChange([cardinalModalMember.clubMemberId], cardinalIds);
        }}
      />

      {/* 출석 기록이 있는 기수 삭제 확인 */}
      <AlertDialog
        open={forceConfirm !== null}
        onOpenChange={(open) => {
          if (!open) setForceConfirm(null);
        }}
        status="danger"
        title={`출석 기록이 있는\n기수가 포함되어 있습니다.`}
        description={'그래도 변경하시겠어요?\n출석/결석 기록도 함께 삭제됩니다.'}
      >
        <AlertDialogAction onClick={handleForceConfirm}>변경</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </>
  );
}

function sortMembers(members: Member[], sortBy: MemberSortBy) {
  return [...members].sort((a, b) => {
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name, 'ko');
    }

    return getLatestCardinalNumber(b.cardinal) - getLatestCardinalNumber(a.cardinal);
  });
}

function getLatestCardinalNumber(cardinal: string) {
  return Math.max(
    ...parseCardinals(cardinal).map((value) => Number(value.replace('기', '')) || 0),
    0,
  );
}

function getMemberCardinalNumbers(cardinal: string) {
  return parseCardinals(cardinal)
    .map((value) => Number(value.replace('기', '')) || 0)
    .filter(Boolean);
}

export { MemberPageContent };
