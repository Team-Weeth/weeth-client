'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import {
  MemberPageHeader,
  MemberPageModals,
  MemberCardList,
  MemberMobileSearchPage,
  MemberTable,
  MemberTopBar,
  MobileMemberTopBar,
  type ForceConfirmState,
  type MemberViewMode,
} from '@/components/admin';
import { MEMBER_CARDINAL_ERROR_CODE, MEMBER_ROLE_ERROR_CODE } from '@/constants/errorCode';
import type { ClubMemberRole, Member } from '@/types/admin/member';
import { EMPTY_MEMBER_PAGE, useAdminMembers } from '@/hooks/queries/admin';
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
import { cn } from '@/lib/cn';
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

const MEMBER_PAGE_SIZE = 10;
const MEMBER_VIEW_MODE_QUERY_KEY = 'view';

const isMemberViewMode = (value: string | null): value is MemberViewMode =>
  value === 'table' || value === 'card';

function MemberPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [selectedMemberById, setSelectedMemberById] = useState<Map<string, Member>>(new Map());
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [cardinalModalMemberId, setCardinalModalMemberId] = useState<string | null>(null);
  const [selectedCardinal, setSelectedCardinal] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<MemberSortBy>('cardinal');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const viewModeParam = searchParams.get(MEMBER_VIEW_MODE_QUERY_KEY);
  const mobileViewMode: MemberViewMode = isMemberViewMode(viewModeParam) ? viewModeParam : 'table';
  const [page, setPage] = useState(1);
  const { data: memberPage = EMPTY_MEMBER_PAGE } = useAdminMembers(page - 1, MEMBER_PAGE_SIZE);
  const members = memberPage.content;
  const totalPages = Math.max(memberPage.totalPages ?? 1, 1);
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
    ? (members.find((m) => m.id === detailMemberId) ??
      selectedMemberById.get(detailMemberId) ??
      null)
    : null;
  const cardinalModalMember = cardinalModalMemberId
    ? (members.find((m) => m.id === cardinalModalMemberId) ??
      selectedMemberById.get(cardinalModalMemberId) ??
      null)
    : null;

  const handleMemberAction = (m: Member) => {
    setDetailMemberId(m.id);
  };

  const filteredMembers = sortMembers(
    filterMembers(members, selectedCardinal, searchQuery),
    sortBy,
  );

  const selectedMembers = Array.from(selectedMemberById.values()).filter((m) =>
    selectedIds.has(m.id),
  );
  const selectedCount = selectedMembers.length;
  const selectedClubMemberIds = getMemberIds(selectedMembers);
  const selectedMemberCardinals = getSelectedMemberCardinals(selectedMembers);

  const targetRole = getBulkTargetRole(selectedMembers);
  const targetBanAction = getBulkBanAction(selectedMembers);

  const handleClearSelection = () => {
    setSelectedIds(new Set());
    setSelectedMemberById(new Map());
  };

  const handleSelectionChange = (nextIds: Set<string>) => {
    setSelectedIds(nextIds);
    setSelectedMemberById((prev) => {
      const next = new Map(prev);

      next.forEach((_, id) => {
        if (!nextIds.has(id)) next.delete(id);
      });

      members.forEach((member) => {
        if (nextIds.has(member.id)) {
          next.set(member.id, member);
        } else {
          next.delete(member.id);
        }
      });

      return next;
    });
  };

  const handleSelectCardinal = (cardinal: number | 'all') => {
    setSelectedCardinal(cardinal);
    setPage(1);
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    setPage(1);
  };

  const handleCloseMobileSearch = () => {
    setIsMobileSearchOpen(false);
    setSearchQuery('');
    setPage(1);
  };

  const handleMobileViewModeChange = (mode: MemberViewMode) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(MEMBER_VIEW_MODE_QUERY_KEY, mode);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };

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
      <div className="max-tablet:!w-full max-tablet:!max-w-full max-tablet:!overflow-x-hidden max-tablet:!pr-0 flex min-h-full min-w-0 pr-450">
        <div className="bg-container-neutral max-tablet:!w-full max-tablet:!max-w-full max-tablet:!rounded-none flex min-h-0 min-w-0 flex-1 flex-col rounded-t-[20px]">
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              isMobileSearchOpen && 'max-tablet:hidden',
            )}
          >
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
                targetBanAction === 'restore'
                  ? () => submitRestore(selectedClubMemberIds)
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

            <MemberPageHeader
              cardinals={cardinals}
              selectedCardinal={selectedCardinal}
              onSelectCardinal={handleSelectCardinal}
              sortBy={sortBy}
              onToggleSort={() => setSortBy((prev) => (prev === 'cardinal' ? 'name' : 'cardinal'))}
              searchQuery={searchQuery}
              onSearchQueryChange={handleSearchQueryChange}
              mobileViewMode={mobileViewMode}
              onMobileViewModeChange={handleMobileViewModeChange}
              onOpenMobileSearch={() => setIsMobileSearchOpen(true)}
            />

            <MobileMemberTopBar
              selectedCount={selectedCount}
              targetRole={targetRole}
              targetBanAction={targetBanAction}
              onBack={handleClearSelection}
              onChangeRole={
                targetRole ? () => submitChangeRole(selectedClubMemberIds, targetRole) : undefined
              }
              onBan={targetBanAction === 'ban' ? () => submitBan(selectedClubMemberIds) : undefined}
              onRestore={
                targetBanAction === 'restore'
                  ? () => submitRestore(selectedClubMemberIds)
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

            {/* Main content */}
            <div className="max-tablet:p-450 flex min-h-0 flex-col p-700">
              <div className={mobileViewMode === 'card' ? 'max-tablet:hidden' : undefined}>
                {/* Member table */}
                <MemberTable
                  members={filteredMembers}
                  page={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  onMemberAction={handleMemberAction}
                />
              </div>

              {mobileViewMode === 'card' && (
                <MemberCardList
                  className="tablet:hidden"
                  members={filteredMembers}
                  page={page}
                  totalPages={totalPages}
                  sortBy={sortBy}
                  onToggleSort={() =>
                    setSortBy((prev) => (prev === 'cardinal' ? 'name' : 'cardinal'))
                  }
                  onPageChange={setPage}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  onMemberAction={handleMemberAction}
                />
              )}
            </div>
          </div>

          {isMobileSearchOpen && (
            <MemberMobileSearchPage
              searchQuery={searchQuery}
              onSearchQueryChange={handleSearchQueryChange}
              onCancel={handleCloseMobileSearch}
              viewMode={mobileViewMode}
              members={filteredMembers}
              page={page}
              totalPages={totalPages}
              sortBy={sortBy}
              onToggleSort={() => setSortBy((prev) => (prev === 'cardinal' ? 'name' : 'cardinal'))}
              onPageChange={setPage}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onMemberAction={handleMemberAction}
              selectionBar={
                <MobileMemberTopBar
                  selectedCount={selectedCount}
                  targetRole={targetRole}
                  targetBanAction={targetBanAction}
                  onBack={handleClearSelection}
                  onChangeRole={
                    targetRole
                      ? () => submitChangeRole(selectedClubMemberIds, targetRole)
                      : undefined
                  }
                  onBan={
                    targetBanAction === 'ban' ? () => submitBan(selectedClubMemberIds) : undefined
                  }
                  onRestore={
                    targetBanAction === 'restore'
                      ? () => submitRestore(selectedClubMemberIds)
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
              }
            />
          )}
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
