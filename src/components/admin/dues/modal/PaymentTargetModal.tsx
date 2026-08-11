'use client';

import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import {
  SCHEDULE_MODAL_CONTENT_CLASS,
  SCHEDULE_MODAL_FOOTER_CLASS,
} from '@/components/admin/schedule/modal/constants';
import {
  DuesMemberTable,
  DuesPagination,
  DuesTabs,
} from '@/components/admin/dues/setup/components';
import { DuesSearchBar } from '@/components/admin/dues/DuesSearchBar';
import { Button } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import { usePaymentTargetFilter } from '@/hooks/admin';

import type { PaymentTarget } from '@/types/admin/dues';

interface PaymentTargetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // 납부 대상 전체 목록. accountId 출처가 호출처마다 다르므로(온보딩=스토어,
  // 설정 페이지=대시보드) 모달이 직접 조회하지 않고 부모가 조회한 결과를 주입한다.
  targets: PaymentTarget[];
  selectedMemberIds: number[];
}

function PaymentTargetModal({
  open,
  onOpenChange,
  targets,
  selectedMemberIds,
}: PaymentTargetModalProps) {
  const {
    selectedCount,
    tab,
    search,
    selectedSet,
    page,
    setPage,
    excludedCount,
    totalPages,
    pagedTargets,
    handleTabChange,
    handleSearch,
  } = usePaymentTargetFilter(targets, selectedMemberIds, 'selected');

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(SCHEDULE_MODAL_CONTENT_CLASS, 'h-180')}
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        {/* Header */}
        <div className="flex h-24 shrink-0 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">납부 대상</h2>
          <ModalIconButton size={20} icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="scrollbar-custom tablet:px-[71px] flex flex-1 flex-col gap-400 overflow-y-auto px-600 pt-300 pb-400">
          {/* Tabs + Search */}
          <div className="tablet:flex-row flex flex-col items-center justify-between gap-400">
            <DuesTabs
              tabs={[
                { key: 'selected', label: `선택됨 ${selectedCount}` },
                { key: 'excluded', label: `제외됨 ${excludedCount}` },
              ]}
              activeTab={tab}
              onTabChange={handleTabChange}
            />
            <DuesSearchBar searchQuery={search} setSearchQuery={handleSearch} />
          </div>

          {/* Table */}
          <DuesMemberTable pagedTargets={pagedTargets} selectedSet={selectedSet} readOnly />

          {/* Pagination */}
          {totalPages > 1 && (
            <DuesPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>

        {/* Footer */}
        <div className={SCHEDULE_MODAL_FOOTER_CLASS}>
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={handleClose}>
            확인
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { PaymentTargetModal, type PaymentTargetModalProps };
