'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { AdminCloseIcon } from '@/assets/icons/admin';
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
import { duesApi } from '@/lib/apis/dues';
import { useDuesSetupValues } from '@/stores/useDuesSetupStore';
import type { PaymentTarget } from '@/types/admin/dues';
import { usePaymentTargetFilter } from '@/hooks/admin';

interface PaymentTargetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMemberIds: number[];
}

function PaymentTargetModal({ open, onOpenChange, selectedMemberIds }: PaymentTargetModalProps) {
  const { clubId } = useParams<{ clubId: string }>();
  const { accountId } = useDuesSetupValues();
  const [allTargets, setAllTargets] = useState<PaymentTarget[]>([]);

  useEffect(() => {
    if (!open || accountId === null) return;

    duesApi
      .getPaymentTargets(clubId, accountId)
      .then((res) => setAllTargets(res.data.data.targets.content))
      .catch(() => {});
  }, [open, clubId, accountId]);

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
  } = usePaymentTargetFilter(allTargets, selectedMemberIds, 'selected');

  const handleClose = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={SCHEDULE_MODAL_CONTENT_CLASS}
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        {/* Header */}
        <div className="flex h-24 shrink-0 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">납부 대상</h2>
          <ModalIconButton size={20} icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="scrollbar-custom flex flex-1 flex-col gap-400 overflow-y-auto px-[71px] pt-300 pb-400">
          {/* Tabs + Search */}
          <div className="flex items-center justify-between gap-400">
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
