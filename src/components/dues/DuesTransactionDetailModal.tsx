'use client';

import { useState } from 'react';

import { DeleteIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { DuesTransaction } from '@/types/dues';
import { getReceiptUrls } from '@/utils/dues/duesTransaction';
import { DuesReceiptCard } from './DuesReceiptCard';
import { DuesReceiptViewerModal } from './DuesReceiptViewerModal';
import { DuesTransactionDetailCard } from './DuesTransactionDetailCard';

interface DuesTransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: DuesTransaction | null;
}

function DuesTransactionDetailModal({
  open,
  onOpenChange,
  transaction,
}: DuesTransactionDetailModalProps) {
  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);

  if (!transaction) return null;

  const receiptUrls = getReceiptUrls(transaction);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        adminMobileFullscreen={false}
        className="bg-background max-tablet:max-w-[calc(100%-36px)] max-tablet:p-450 w-full max-w-[552px] gap-0 rounded-lg border-0 p-450 shadow-lg"
      >
        <div className="flex items-center justify-between pb-450">
          <DialogTitle className="typo-h3 text-text-strong">거래 내역 상세</DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="text-icon-normal hover:text-icon-strong cursor-pointer p-100 transition-colors"
            aria-label="거래 내역 상세 닫기"
          >
            <Icon src={DeleteIcon} size={32} />
          </button>
        </div>

        <div className="flex flex-col gap-400">
          <DuesTransactionDetailCard transaction={transaction} />

          <DuesReceiptCard
            transaction={transaction}
            receiptUrls={receiptUrls}
            onOpenReceiptViewer={() => setReceiptViewerOpen(true)}
          />
        </div>

        <DuesReceiptViewerModal
          open={receiptViewerOpen}
          onOpenChange={setReceiptViewerOpen}
          receiptUrls={receiptUrls}
        />
      </DialogContent>
    </Dialog>
  );
}

export { DuesTransactionDetailModal, type DuesTransactionDetailModalProps };
