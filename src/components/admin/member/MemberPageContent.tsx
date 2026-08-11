'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { MemberCardList } from '@/components/admin/member/MemberCardList';
import { MemberMobileSearchPage } from '@/components/admin/member/MemberMobileSearchPage';
import { MemberPageHeader } from '@/components/admin/member/MemberPageHeader';
import { MemberPageModals } from '@/components/admin/member/MemberPageModals';
import { MemberTable } from '@/components/admin/member/MemberTable';
import { MemberTopBar, MobileMemberTopBar } from '@/components/admin/member/MemberTopBar';
import type { MemberViewMode } from '@/components/admin/member/MemberViewToggle';
import type { Member } from '@/types/admin/member';
import { EMPTY_MEMBER_PAGE, useAdminMembers, useAdminMembersInfinite } from '@/hooks/queries/admin';
import { useCardinals } from '@/hooks/queries';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useUserRole } from '@/stores';
import { cn } from '@/lib/cn';
import { useMemberBulkActions } from './hooks/useMemberBulkActions';
import { useMemberListState } from './hooks/useMemberListState';
import { useMemberSelection } from './hooks/useMemberSelection';

const MEMBER_PAGE_SIZE = 10;
const MEMBER_VIEW_MODE_QUERY_KEY = 'view';

const isMemberViewMode = (value: string | null): value is MemberViewMode =>
  value === 'table' || value === 'card';

function MemberPageContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [detailMemberId, setDetailMemberId] = useState<string | null>(null);
  const [cardinalModalMemberId, setCardinalModalMemberId] = useState<string | null>(null);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  const viewModeParam = searchParams.get(MEMBER_VIEW_MODE_QUERY_KEY);
  const mobileViewMode: MemberViewMode = isMemberViewMode(viewModeParam) ? viewModeParam : 'table';
  const [page, setPage] = useState(1);
  const { data: memberPage = EMPTY_MEMBER_PAGE } = useAdminMembers(
    page - 1,
    MEMBER_PAGE_SIZE,
    !isMobile,
  );
  const {
    data: infiniteMembers = [],
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAdminMembersInfinite(MEMBER_PAGE_SIZE, isMobile);
  const members = isMobile ? infiniteMembers : memberPage.content;
  const totalPages = Math.max(memberPage.totalPages ?? 1, 1);
  const mobileTotalPages = 1;
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({ rootMargin: '160px' });
  const { data: cardinals = [] } = useCardinals();
  const myRole = useUserRole();
  const isLead = myRole === 'LEAD';
  const {
    selectedIds,
    selectedMemberById,
    selectedMembers,
    selectedCount,
    selectedClubMemberIds,
    selectedMemberCardinals,
    clearSelection,
    handleSelectionChange,
  } = useMemberSelection(members);
  const {
    selectedCardinal,
    sortBy,
    searchQuery,
    filteredMembers,
    handleSelectCardinal,
    handleSearchQueryChange,
    toggleSort,
    resetSearch,
  } = useMemberListState({ members, resetPage: () => setPage(1) });
  const {
    forceConfirm,
    targetRole,
    targetBanAction,
    setForceConfirm,
    submitCardinalsChange,
    submitChangeRole,
    submitBan,
    submitRestore,
    handleChangeCardinalsForBulk,
    handleTransferLead,
    handleForceConfirm,
  } = useMemberBulkActions({
    cardinals,
    isLead,
    selectedMembers,
    selectedMemberCardinals,
  });

  useEffect(() => {
    if (!isMobile || !isIntersecting || !hasNextPage || isFetchingNextPage) return;
    fetchNextPage();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting, isMobile]);

  useEffect(() => {
    if (page <= totalPages) return;
    const timeout = window.setTimeout(() => setPage(totalPages), 0);
    return () => window.clearTimeout(timeout);
  }, [page, totalPages]);

  useEffect(() => {
    if (isMobile) return;
    const timeout = window.setTimeout(() => setIsMobileSearchOpen(false), 0);
    return () => window.clearTimeout(timeout);
  }, [isMobile]);

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

  const handleCloseMobileSearch = () => {
    setIsMobileSearchOpen(false);
    resetSearch();
  };

  const handleMobileViewModeChange = (mode: MemberViewMode) => {
    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set(MEMBER_VIEW_MODE_QUERY_KEY, mode);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  };
  const memberSelectionBarProps = {
    selectedCount,
    targetRole,
    targetBanAction,
    onBack: clearSelection,
    onChangeRole: targetRole
      ? () => submitChangeRole(selectedClubMemberIds, targetRole)
      : undefined,
    onBan: targetBanAction === 'ban' ? () => submitBan(selectedClubMemberIds) : undefined,
    onRestore:
      targetBanAction === 'restore' ? () => submitRestore(selectedClubMemberIds) : undefined,
    onChangeCardinals: handleChangeCardinalsForBulk,
    selectedMemberName: selectedMembers[0]?.name,
    selectedMemberCardinals,
    onTransferLead:
      isLead && selectedCount === 1
        ? () => handleTransferLead(selectedMembers[0].clubMemberId)
        : undefined,
  };

  return (
    <>
      <div className="max-tablet:!w-full max-tablet:!max-w-full max-tablet:!overflow-hidden max-tablet:!pr-0 max-tablet:h-full flex min-h-full min-w-0 pr-450">
        <div className="bg-container-neutral max-tablet:!w-full max-tablet:!max-w-full max-tablet:!rounded-none max-tablet:h-full max-tablet:overflow-hidden flex min-h-0 min-w-0 flex-1 flex-col rounded-t-[20px]">
          <div
            className={cn(
              'flex min-h-0 flex-1 flex-col',
              isMobileSearchOpen && 'max-tablet:hidden',
            )}
          >
            {/* Selection top bar */}
            <MemberTopBar {...memberSelectionBarProps} />

            <MemberPageHeader
              cardinals={cardinals}
              selectedCardinal={selectedCardinal}
              onSelectCardinal={handleSelectCardinal}
              sortBy={sortBy}
              onToggleSort={toggleSort}
              searchQuery={searchQuery}
              onSearchQueryChange={handleSearchQueryChange}
              mobileViewMode={mobileViewMode}
              onMobileViewModeChange={handleMobileViewModeChange}
              onOpenMobileSearch={() => setIsMobileSearchOpen(true)}
            />

            <MobileMemberTopBar {...memberSelectionBarProps} />

            {/* Main content */}
            <div
              className={cn(
                'max-tablet:min-h-0 max-tablet:flex-1 max-tablet:overflow-y-auto flex min-h-0 flex-col p-700',
                mobileViewMode === 'card' ? 'max-tablet:p-450' : 'max-tablet:p-0',
              )}
            >
              <div className={mobileViewMode === 'card' ? 'max-tablet:hidden' : undefined}>
                {/* Member table */}
                <MemberTable
                  members={filteredMembers}
                  page={page}
                  totalPages={isMobile ? mobileTotalPages : totalPages}
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
                  totalPages={mobileTotalPages}
                  sortBy={sortBy}
                  onToggleSort={toggleSort}
                  onPageChange={setPage}
                  selectedIds={selectedIds}
                  onSelectionChange={handleSelectionChange}
                  onMemberAction={handleMemberAction}
                />
              )}

              {isMobile && !isMobileSearchOpen && (
                <div ref={sentinelRef} className="h-px w-full shrink-0" />
              )}
            </div>
          </div>

          {isMobile && isMobileSearchOpen && (
            <MemberMobileSearchPage
              searchQuery={searchQuery}
              onSearchQueryChange={handleSearchQueryChange}
              onCancel={handleCloseMobileSearch}
              viewMode={mobileViewMode}
              members={filteredMembers}
              page={page}
              totalPages={mobileTotalPages}
              sortBy={sortBy}
              onToggleSort={toggleSort}
              onPageChange={setPage}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
              onMemberAction={handleMemberAction}
              listFooter={<div ref={sentinelRef} className="h-px w-full shrink-0" />}
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
