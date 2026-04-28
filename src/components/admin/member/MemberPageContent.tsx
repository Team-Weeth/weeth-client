'use client';

import { useState } from 'react';

import {
  CardinalPillList,
  MemberDetailModal,
  MemberSearchBar,
  MemberTable,
  MemberTopBar,
} from '@/components/admin';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, Card } from '@/components/ui';
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
import { getApiErrorCode } from '@/utils/shared';
import { runBulkMutation } from '@/utils/shared/runBulkMutation';

interface ForceConfirmState {
  clubMemberIds: number[];
  cardinalIds: number[];
}

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [selectedCardinal, setSelectedCardinal] = useState<number | 'all'>('all');
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

  const handleMemberAction = (m: Member) => {
    setDetailMemberId(m.id);
  };

  const cardinalFilteredMembers =
    selectedCardinal === 'all'
      ? members
      : members.filter((m) =>
          m.cardinal
            .split(',')
            .map((c) => c.trim())
            .includes(String(selectedCardinal)),
        );

  const query = searchValue.trim().toLowerCase();
  const filteredMembers = query
    ? cardinalFilteredMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query) ||
          m.studentId.includes(query) ||
          m.cardinal.includes(query),
      )
    : cardinalFilteredMembers;

  const selectedMembers = filteredMembers.filter((m) => selectedIds.has(m.id));
  const selectedCount = selectedMembers.length;

  const targetRole = getBulkTargetRole(selectedMembers);
  const targetBanAction = getBulkBanAction(selectedMembers);

  const handleClearSelection = () => setSelectedIds(new Set());

  const submitCardinalsChange = async (
    clubMemberIds: number[],
    cardinalIds: number[],
    force = false,
  ) => {
    const results = await Promise.allSettled(
      clubMemberIds.map((clubMemberId) =>
        changeMemberCardinalsAsync({ clubMemberId, cardinalIds, force }),
      ),
    );

    const attendanceFailedIds: number[] = [];
    let otherErrorCount = 0;

    results.forEach((result, idx) => {
      if (result.status !== 'rejected') return;
      const code = getApiErrorCode(result.reason);
      if (code === MEMBER_CARDINAL_ERROR_CODE.REMOVAL_HAS_ATTENDANCE) {
        attendanceFailedIds.push(clubMemberIds[idx]);
      } else {
        otherErrorCount += 1;
      }
    });

    if (attendanceFailedIds.length > 0) {
      setForceConfirm({ clubMemberIds: attendanceFailedIds, cardinalIds });
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

  const handleChangeCardinalsForDetail = (cardinalIds: number[]) => {
    if (!detailMember) return;
    submitCardinalsChange([detailMember.clubMemberId], cardinalIds);
  };

  const handleChangeCardinalsForBulk = (cardinalIds: number[]) => {
    submitCardinalsChange(
      selectedMembers.map((m) => m.clubMemberId),
      cardinalIds,
    );
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
    const { clubMemberIds, cardinalIds } = forceConfirm;
    setForceConfirm(null);
    submitCardinalsChange(clubMemberIds, cardinalIds, true);
  };

  return (
    <div className="flex min-w-0 flex-col">
      {/* Selection top bar */}
      <MemberTopBar
        className="sticky top-0 z-10 -mt-15"
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
        onTransferLead={
          isLead && selectedCount === 1
            ? () => handleTransferLead(selectedMembers[0].clubMemberId)
            : undefined
        }
      />

      {/* Main content */}
      <div className="flex flex-col gap-400 p-700">
        <CardinalPillList
          cardinals={cardinals}
          selectedCardinal={selectedCardinal}
          onSelectCardinal={setSelectedCardinal}
        />

        {/* Search bar */}
        <Card>
          <MemberSearchBar isWrapped={false} value={searchValue} onValueChange={setSearchValue} />
        </Card>

        {/* Member table */}
        <Card>
          <MemberTable
            members={filteredMembers}
            selectedIds={selectedIds}
            onSelectionChange={setSelectedIds}
            onMemberAction={handleMemberAction}
          />
        </Card>
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
        onChangeCardinals={detailMember ? handleChangeCardinalsForDetail : undefined}
        onTransferLead={
          isLead && detailMember ? () => handleTransferLead(detailMember.clubMemberId) : undefined
        }
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
    </div>
  );
}

export { MemberPageContent };
