'use client';

import { useState } from 'react';

import { AdminCloseIcon, AdminMeatballIcon } from '@/assets/icons/admin';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { SCHEDULE_MODAL_CONTENT_CLASS } from '@/components/admin/schedule/modal/constants';
import { cn } from '@/lib/cn';
import type { TransactionType } from './TransactionForm';

interface TransactionDetail {
  type: TransactionType;
  amount: string;
  description: string;
  vendor: string;
  date: string;
  receiptUrl?: string;
}

interface TransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDetail;
  onEdit: () => void;
  onDelete: () => void;
}

const TYPE_CONFIG: Record<TransactionType, { label: string; className: string }> = {
  EXPENSE: {
    label: '지출',
    className: 'bg-state-error/10 text-state-error',
  },
  INCOME: {
    label: '수입',
    className: 'bg-state-success/10 text-state-success',
  },
};

const FIELD_LABEL: Record<TransactionType, string> = {
  EXPENSE: '지출 내용',
  INCOME: '수입 내용',
};

function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { type, amount, description, vendor, date, receiptUrl } = transaction;

  const typeConfig = TYPE_CONFIG[type];
  const sign = type === 'EXPENSE' ? '- ' : '+ ';
  const numAmount = Number(amount);
  const formattedAmount = (isNaN(numAmount) ? 0 : numAmount).toLocaleString('ko-KR');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={SCHEDULE_MODAL_CONTENT_CLASS}
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        {/* Header */}
        <div className="flex h-20 shrink-0 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">거래내역 상세</h2>
          <div className="flex items-center">
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

            <ModalIconButton
              icon={AdminCloseIcon}
              label="닫기"
              onClick={() => onOpenChange(false)}
            />
          </div>
        </div>

        {/* Body */}
        <div className="scrollbar-custom flex flex-1 flex-col gap-700 overflow-y-auto px-[71px] py-500">
          {/* 타입 + 설명 + 금액 */}
          <div className="flex flex-col gap-400">
            <div className="flex items-center gap-200">
              <span
                className={cn(
                  'typo-caption1 flex h-6 items-center justify-center rounded-[5px] px-200 py-100',
                  typeConfig.className,
                )}
              >
                {typeConfig.label}
              </span>
              <span className="typo-sub3 text-text-normal">{description}</span>
            </div>
            <p className="typo-h2 text-text-normal">
              {sign}
              {formattedAmount}원
            </p>
          </div>

          {/* 상세 필드 */}
          <div className="flex flex-col gap-200">
            <div className="bg-container-neutral typo-sub3 flex h-12 items-center gap-600 rounded-sm px-400">
              <span className="text-text-alternative w-[52px] shrink-0">{FIELD_LABEL[type]}</span>
              <span className="text-text-strong">{description}</span>
            </div>

            <div className="bg-container-neutral typo-sub3 flex h-12 items-center gap-600 rounded-sm px-400">
              <span className="text-text-alternative w-[52px] shrink-0">거래처</span>
              <span className="text-text-strong">{vendor}</span>
            </div>

            <div className="bg-container-neutral typo-sub3 flex h-12 items-center gap-600 rounded-sm px-400">
              <span className="text-text-alternative w-[52px] shrink-0">일자</span>
              <span className="text-text-strong">{date.replace(/-/g, '.')}</span>
            </div>

            {/* 영수증 */}
            <div className="bg-container-neutral flex flex-col gap-300 rounded-sm px-400 py-[13px]">
              <span className="typo-sub3 text-text-alternative w-[52px]">영수증</span>
              {receiptUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={receiptUrl}
                  alt="영수증"
                  className="h-44 w-full rounded-sm object-cover"
                />
              ) : (
                <div className="bg-container-neutral-alternative flex h-44 items-center justify-center rounded-sm">
                  <span className="typo-body2 text-text-disabled">첨부된 영수증이 없습니다</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex shrink-0 items-center justify-end gap-200 px-400 pt-400 pb-500">
          <Button variant="secondary" size="lg" onClick={onEdit}>
            수정
          </Button>
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
            // TODO: API 연동
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
