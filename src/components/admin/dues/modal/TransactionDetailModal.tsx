'use client';

import { useState } from 'react';

import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import AdminMeatballIcon from '@/assets/icons/admin/ic_admin_meatball.svg';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/Button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { SCHEDULE_MODAL_CONTENT_CLASS } from '@/components/admin/schedule/modal/constants';
import { cn } from '@/lib/cn';
import { TRANSACTION_TYPE_TAG } from '../DuesTransactionTable';
import type { TransactionDirection, TransactionType } from '@/types/admin/dues';
import { DuesReceiptCard } from '@/components/dues/DuesReceiptCard';
import { DuesReceiptViewerModal } from '@/components/dues/DuesReceiptViewerModal';
import { getReceiptFiles } from '@/utils/dues/duesTransaction';
import type { DuesReceiptFile, DuesTransaction } from '@/types/dues';

interface TransactionDetail {
  type: TransactionType;
  direction: TransactionDirection;
  amount: string;
  description: string;
  vendor: string;
  date: string;
  memo?: string;
  category?: string;
  registrant?: string;
  receiptUrl?: string;
  receipts?: DuesReceiptFile[];
}

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDetail;
  onEdit: () => void;
  onDelete: () => void;
}

function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [receiptViewerOpen, setReceiptViewerOpen] = useState(false);
  const {
    type,
    direction,
    amount,
    description,
    vendor,
    date,
    memo,
    category,
    registrant,
    receiptUrl,
    receipts,
  } = transaction;

  const typeConfig = TRANSACTION_TYPE_TAG[type];
  // 수입·지출 거래만 수정·삭제 가능 (회비·환불은 시스템 생성 거래라 편집 불가)
  const isEditable = type === 'EXPENSE' || type === 'INCOME';
  const sign = direction === 'INCOME' ? '+' : '-';
  const numAmount = Number(amount);
  const formattedAmount = (isNaN(numAmount) ? 0 : numAmount).toLocaleString('ko-KR');
  const classificationLabel = category ? `${typeConfig.label} · ${category}` : typeConfig.label;

  const receiptTransaction: DuesTransaction = {
    id: 0,
    type: direction === 'INCOME' ? 'income' : 'expense',
    title: description,
    description,
    amount: isNaN(numAmount) ? 0 : numAmount,
    date,
    receipts,
    receiptUrl,
  };
  const receiptFiles = getReceiptFiles(receiptTransaction);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={SCHEDULE_MODAL_CONTENT_CLASS}
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        {/* Header */}
        <div className="flex h-24 shrink-0 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">거래내역 상세</h2>
          <div className="flex items-center">
            {isEditable && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <ModalIconButton icon={AdminMeatballIcon} label="메뉴" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem destructive onSelect={() => setDeleteConfirmOpen(true)}>
                    거래내역 삭제
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <ModalIconButton
              icon={AdminCloseIcon}
              label="닫기"
              onClick={() => onOpenChange(false)}
            />
          </div>
        </div>

        {/* Body */}
        <div className="scrollbar-custom flex flex-1 flex-col gap-400 overflow-y-auto px-[71px] pt-700 pb-600">
          {/* 상세 정보 카드 */}
          <div className="bg-container-neutral flex flex-col gap-400 rounded-lg p-450">
            {/* 뱃지 + 금액 + 설명 */}
            <div className="flex flex-col gap-200">
              <span
                className={cn(
                  'typo-caption1 flex h-6 w-fit items-center justify-center rounded-[5px] px-200 py-100',
                  typeConfig.className,
                )}
              >
                {typeConfig.label}
              </span>
              <div className="flex flex-col gap-200">
                <p className="typo-h2 text-text-strong">
                  {sign}
                  {formattedAmount}원
                </p>
                <p className="typo-sub3 text-text-strong">{description}</p>
              </div>
            </div>

            {/* 구분선 */}
            <div className="bg-line h-px w-full" />

            {/* 필드 리스트 */}
            <div className="flex flex-col gap-200">
              <div className="flex items-center justify-between py-100">
                <span className="typo-caption2 text-text-alternative">거래처</span>
                <span className="typo-caption1 text-text-strong">{vendor}</span>
              </div>
              <div className="flex items-center justify-between py-100">
                <span className="typo-caption2 text-text-alternative">일자</span>
                <span className="typo-caption1 text-text-strong">{date.replace(/-/g, '. ')}</span>
              </div>
              <div className="flex items-center justify-between py-100">
                <span className="typo-caption2 text-text-alternative">분류</span>
                <span className="typo-caption1 text-text-strong">{classificationLabel}</span>
              </div>
              {registrant && (
                <div className="flex items-center justify-between py-100">
                  <span className="typo-caption2 text-text-alternative">등록자</span>
                  <span className="typo-caption1 text-text-strong">{registrant}</span>
                </div>
              )}
              {memo && (
                <div className="flex items-start justify-between gap-400 py-100">
                  <span className="typo-caption2 text-text-alternative shrink-0">메모</span>
                  <span className="typo-caption1 text-text-strong text-right break-words">
                    {memo}
                  </span>
                </div>
              )}
            </div>
          </div>

          <DuesReceiptCard
            transaction={receiptTransaction}
            receiptFiles={receiptFiles}
            onOpenReceiptViewer={() => setReceiptViewerOpen(true)}
          />

          <DuesReceiptViewerModal
            key={receiptViewerOpen ? 'receipt-viewer-open' : 'receipt-viewer-closed'}
            open={receiptViewerOpen}
            onOpenChange={setReceiptViewerOpen}
            receiptFiles={receiptFiles}
          />
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex shrink-0 items-center justify-end gap-200 px-400 pt-400 pb-500">
          {isEditable && (
            <Button variant="secondary" size="lg" onClick={onEdit}>
              수정
            </Button>
          )}
          <Button variant="secondary" size="lg" onClick={() => onOpenChange(false)}>
            확인
          </Button>
        </div>
      </DialogContent>

      {/* 삭제 확인 */}
      <AlertDialog
        status="danger"
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="내역을 삭제하시겠어요?"
        description="삭제한 내역은 복구할 수 없습니다."
      >
        <AlertDialogAction
          onClick={() => {
            onDelete?.();
            setDeleteConfirmOpen(false);
            onOpenChange(false);
          }}
        >
          확인
        </AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </Dialog>
  );
}

export { TransactionDetailModal, type TransactionDetail, type TransactionDetailModalProps };
