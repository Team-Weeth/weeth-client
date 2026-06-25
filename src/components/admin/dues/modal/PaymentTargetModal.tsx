'use client';

import { useState } from 'react';

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
import { MOCK_PAYMENT_TARGETS } from '@/constants/mock';

const PAGE_SIZE = 10;

type TabType = 'selected' | 'excluded';

interface PaymentTargetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedMemberIds: number[];
}

function PaymentTargetModal({ open, onOpenChange, selectedMemberIds }: PaymentTargetModalProps) {
  const [tab, setTab] = useState<TabType>('selected');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const selectedSet = new Set(selectedMemberIds);

  const totalCount = MOCK_PAYMENT_TARGETS.length;
  const selectedCount = selectedMemberIds.length;
  const excludedCount = totalCount - selectedCount;

  const byTab =
    tab === 'selected'
      ? MOCK_PAYMENT_TARGETS.filter((t) => selectedSet.has(t.paymentTargetInfo.clubMemberId))
      : MOCK_PAYMENT_TARGETS.filter((t) => !selectedSet.has(t.paymentTargetInfo.clubMemberId));
  const filteredTargets = search.trim()
    ? byTab.filter((t) => t.paymentTargetInfo.name.includes(search.trim()))
    : byTab;

  const totalPages = Math.max(1, Math.ceil(filteredTargets.length / PAGE_SIZE));
  const pagedTargets = filteredTargets.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleTabChange = (next: TabType) => {
    setTab(next);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

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
