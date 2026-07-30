'use client';

import { useState } from 'react';

import {
  MemberPageHeader,
  MemberPageModals,
  MemberTable,
  MemberTopBar,
  type ForceConfirmState,
} from '@/components/admin';
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
import { getBulkBanAction, getBulkTargetRole } from '@/utils/admin/memberBulkActions';
import {
  createBulkCardinalChangeRequests,
  filterMembers,
  getMemberIds,
  getSelectedMemberCardinals,
  sortMembers,
  type CardinalChangeRequest,
  type MemberSortBy,
} from '@/utils/admin/memberPageUtils';
import { getApiErrorCode } from '@/utils/shared';
import { runBulkMutation } from '@/utils/shared/runBulkMutation';

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

  const filteredMembers = sortMembers(
    filterMembers(members, selectedCardinal, searchQuery),
    sortBy,
  );

  const selectedMembers = filteredMembers.filter((m) => selectedIds.has(m.id));
  const selectedCount = selectedMembers.length;
  const selectedClubMemberIds = getMemberIds(selectedMembers);
  const selectedMemberCardinals = getSelectedMemberCardinals(selectedMembers);

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
    const requests = createBulkCardinalChangeRequests({
      selectedMembers,
      selectedMemberCardinals,
      selectedCardinalNumbers: cardinalNumbers,
      cardinals,
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
              targetRole ? () => submitChangeRole(selectedClubMemberIds, targetRole) : undefined
            }
            onBan={targetBanAction === 'ban' ? () => submitBan(selectedClubMemberIds) : undefined}
            onRestore={
              targetBanAction === 'restore' ? () => submitRestore(selectedClubMemberIds) : undefined
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

          <MemberPageHeader
            cardinals={cardinals}
            selectedCardinal={selectedCardinal}
            onSelectCardinal={setSelectedCardinal}
            sortBy={sortBy}
            onToggleSort={() => setSortBy((prev) => (prev === 'cardinal' ? 'name' : 'cardinal'))}
            searchQuery={searchQuery}
            onSearchQueryChange={setSearchQuery}
          />

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

      <MemberPageModals
        detailMember={detailMember}
        cardinalModalMember={cardinalModalMember}
        forceConfirm={forceConfirm}
        isLead={isLead}
        onCloseDetail={() => setDetailMemberId(null)}
        onOpenCardinalModalFromDetail={(memberId) => {
          setCardinalModalMemberId(memberId);
          setDetailMemberId(null);
        }}
        onCloseCardinalModal={() => setCardinalModalMemberId(null)}
        onCloseForceConfirm={() => setForceConfirm(null)}
        onConfirmForceChange={handleForceConfirm}
        onBan={submitBan}
        onRestore={submitRestore}
        onChangeRole={submitChangeRole}
        onChangeCardinals={submitCardinalsChange}
        onTransferLead={handleTransferLead}
      />
    </>
  );
}

export { MemberPageContent };
