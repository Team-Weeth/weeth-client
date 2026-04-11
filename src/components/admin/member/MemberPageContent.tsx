'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';

import {
  AddGenerationButton,
  AddGenerationModal,
  GenerationCard,
  MemberDetailModal,
  MemberSearchBar,
  MemberTable,
  MemberTopBar,
} from '@/components/admin';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, Card } from '@/components/ui';
import { MEMBER_CARDINAL_ERROR_CODE } from '@/constants/errorCode';
import { useDragScroll } from '@/hooks';
import type { Member } from '@/types/admin/member';
import { useAdminMembers } from '@/hooks/queries/admin';
import { useCardinals } from '@/hooks/queries';
import {
  useBanMember,
  useChangeMemberCardinals,
  useChangeMemberRole,
  useCreateCardinal,
  useRestoreMember,
} from '@/hooks/mutations/admin';
import { toastError, toastSuccess } from '@/stores/useToastStore';

interface ForceConfirmState {
  clubMemberIds: number[];
  cardinalIds: number[];
}

function MemberPageContent() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchValue, setSearchValue] = useState('');
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [selectedCardinal, setSelectedCardinal] = useState<number | 'all'>('all');
  const { ref: dragScrollRef, onMouseDown } = useDragScroll();
  const { data: members = [] } = useAdminMembers();
  const { data: cardinals = [] } = useCardinals();
  const { mutate: changeMemberRole } = useChangeMemberRole();
  const { mutate: banMember } = useBanMember();
  const { mutate: restoreMember } = useRestoreMember();
  const { mutate: createCardinal } = useCreateCardinal();
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
          m.generation
            .split(',')
            .map((g) => g.trim())
            .includes(String(selectedCardinal)),
        );

  const query = searchValue.trim().toLowerCase();
  const filteredMembers = query
    ? cardinalFilteredMembers.filter(
        (m) =>
          m.name.toLowerCase().includes(query) ||
          m.department.toLowerCase().includes(query) ||
          m.studentId.includes(query) ||
          m.generation.includes(query),
      )
    : cardinalFilteredMembers;

  const selectedMembers = filteredMembers.filter((m) => selectedIds.has(m.id));
  const selectedCount = selectedMembers.length;

  const allUsers = selectedCount > 0 && selectedMembers.every((m) => m.memberRole === 'USER');
  const allAdmins = selectedCount > 0 && selectedMembers.every((m) => m.memberRole === 'ADMIN');
  const targetRole = allUsers ? 'ADMIN' : allAdmins ? 'USER' : null;

  const allBanned = selectedCount > 0 && selectedMembers.every((m) => m.status === 'BANNED');
  const noneBanned = selectedCount > 0 && selectedMembers.every((m) => m.status !== 'BANNED');
  const targetBanAction: 'ban' | 'restore' | null = allBanned
    ? 'restore'
    : noneBanned
      ? 'ban'
      : null;

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
      const err = result.reason;
      const code = isAxiosError(err) ? err.response?.data?.code : undefined;
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

  const handleForceConfirm = () => {
    if (!forceConfirm) return;
    const { clubMemberIds, cardinalIds } = forceConfirm;
    setForceConfirm(null);
    submitCardinalsChange(clubMemberIds, cardinalIds, true);
  };

  return (
    <div className="flex min-w-3xl flex-col">
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
                selectedMembers.forEach((m) =>
                  changeMemberRole({ clubMemberId: m.clubMemberId, memberRole: targetRole }),
                )
            : undefined
        }
        onBan={
          targetBanAction === 'ban'
            ? () => selectedMembers.forEach((m) => banMember(m.clubMemberId))
            : undefined
        }
        onRestore={
          targetBanAction === 'restore'
            ? () => selectedMembers.forEach((m) => restoreMember(m.clubMemberId))
            : undefined
        }
        onChangeCardinals={handleChangeCardinalsForBulk}
      />

      {/* Main content */}
      <div className="flex flex-col gap-400 p-700">
        {/* Generation pills */}
        <div
          ref={dragScrollRef}
          className="scrollbar-none flex cursor-grab items-center gap-200 overflow-x-auto select-none active:cursor-grabbing"
          onMouseDown={onMouseDown}
        >
          <GenerationCard
            variant={selectedCardinal === 'all' ? 'active' : 'normal'}
            title="전체"
            onClick={() => setSelectedCardinal('all')}
          />
          {cardinals.map((c) => (
            <GenerationCard
              key={c.id}
              variant={selectedCardinal === c.cardinalNumber ? 'active' : 'normal'}
              title={`${c.cardinalNumber}기`}
              onClick={() => setSelectedCardinal(c.cardinalNumber)}
            />
          ))}
          <AddGenerationModal
            onSubmit={({ generation, isCurrent }) =>
              createCardinal({ cardinalNumber: generation, inProgress: isCurrent })
            }
          >
            <AddGenerationButton />
          </AddGenerationModal>
        </div>

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
        onBan={detailMember ? () => banMember(detailMember.clubMemberId) : undefined}
        onRestore={detailMember ? () => restoreMember(detailMember.clubMemberId) : undefined}
        onChangeRole={
          detailMember
            ? () => {
                const nextRole = detailMember.memberRole === 'ADMIN' ? 'USER' : 'ADMIN';
                changeMemberRole({ clubMemberId: detailMember.clubMemberId, memberRole: nextRole });
              }
            : undefined
        }
        onChangeCardinals={detailMember ? handleChangeCardinalsForDetail : undefined}
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
