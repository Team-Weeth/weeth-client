'use client';

import { useState } from 'react';
import Image from 'next/image';

import { ArrowRightIcon } from '@/assets/icons';
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
  category?: string;
  registrant?: string;
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

function TransactionDetailModal({
  open,
  onOpenChange,
  transaction,
  onEdit,
  onDelete,
}: TransactionDetailModalProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const { type, amount, description, vendor, date, category, registrant, receiptUrl } = transaction;

  const typeConfig = TYPE_CONFIG[type];
  const sign = type === 'EXPENSE' ? '-' : '+';
  const numAmount = Number(amount);
  const formattedAmount = (isNaN(numAmount) ? 0 : numAmount).toLocaleString('ko-KR');
  const classificationLabel = category ? `${typeConfig.label} · ${category}` : typeConfig.label;

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
            </div>
          </div>

          {/* 영수증 카드 */}
          <div className="bg-container-neutral relative flex items-center gap-200 rounded-lg p-450">
            {receiptUrl ? (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={receiptUrl} alt="" className="size-10 shrink-0 rounded-sm object-cover" />
                <div className="flex flex-col gap-100">
                  <p className="typo-sub1 text-text-strong">영수증</p>
                  <p className="typo-body2 text-text-alternative">원본 보기</p>
                </div>
                <Image
                  src={ArrowRightIcon}
                  alt=""
                  width={24}
                  height={24}
                  className="ml-auto shrink-0"
                />
                <a
                  href={receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="absolute inset-0 rounded-lg"
                  aria-label="영수증 원본 보기"
                />
              </>
            ) : (
              <div className="flex flex-col gap-100">
                <p className="typo-sub1 text-text-strong">영수증</p>
                <p className="typo-body2 text-text-disabled">첨부된 영수증이 없습니다</p>
              </div>
            )}
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
