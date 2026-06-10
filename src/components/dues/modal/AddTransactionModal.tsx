'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

import { AdminCloseIcon, AdminCloudUploadIcon } from '@/assets/icons/admin';
import { Button, CalendarPicker } from '@/components/ui';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { ModalIconButton } from '@/components/admin/modal/ModalIconButton';
import { useImageDrop } from '@/hooks/useImageDrop';
import { cn } from '@/lib/cn';
import { SCHEDULE_MODAL_CONTENT_CLASS } from '@/components/admin/schedule/modal/constants';

type TransactionType = 'EXPENSE' | 'INCOME';

interface TransactionFormData {
  type: TransactionType;
  amount: string;
  description: string;
  vendor: string;
  date: string;
  receiptFile: File | null;
}

interface AddTransactionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: TransactionFormData) => void;
}

const DESCRIPTION_MAX = 30;
const VENDOR_MAX = 30;

const DEFAULT_FORM: TransactionFormData = {
  type: 'EXPENSE',
  amount: '',
  description: '',
  vendor: '',
  date: '',
  receiptFile: null,
};

const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  EXPENSE: '지출',
  INCOME: '수입',
};

function AddTransactionModal({ open, onOpenChange, onSubmit }: AddTransactionModalProps) {
  const [form, setForm] = useState<TransactionFormData>(DEFAULT_FORM);
  const [prevOpen, setPrevOpen] = useState(open);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (prevOpen !== open) {
    setPrevOpen(open);
    if (open) setForm(DEFAULT_FORM);
  }

  const { isDragging, dragHandlers } = useImageDrop({
    onDrop: (file) => setForm((prev) => ({ ...prev, receiptFile: file })),
  });

  const handleClose = () => onOpenChange(false);

  const sign = form.type === 'EXPENSE' ? '-' : '+';
  const descriptionLabel = form.type === 'EXPENSE' ? '지출 내용' : '수입 내용';
  const descriptionPlaceholder =
    form.type === 'EXPENSE'
      ? '사용한 내용을 작성해주세요 (ex. 스터디 지원금)'
      : '수입 내용을 작성해주세요';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={SCHEDULE_MODAL_CONTENT_CLASS}
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        {/* Header */}
        <div className="flex h-24 shrink-0 items-center justify-between px-600">
          <h2 className="typo-h3 text-text-normal">거래내역 추가</h2>
          <ModalIconButton icon={AdminCloseIcon} label="닫기" onClick={handleClose} />
        </div>

        {/* Body */}
        <div className="scrollbar-custom flex flex-1 flex-col gap-400 overflow-y-auto px-600 py-500">
          {/* 지출 / 수입 타입 선택 */}
          <div className="flex gap-200">
            {(['EXPENSE', 'INCOME'] as TransactionType[]).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, type }))}
                className={cn(
                  'typo-button2 flex min-w-10 cursor-pointer items-center justify-center rounded-[10px] px-400 py-200 transition-colors',
                  form.type === type
                    ? 'bg-button-primary text-text-inverse'
                    : 'border-line text-text-normal border',
                )}
              >
                {TRANSACTION_TYPE_LABEL[type]}
              </button>
            ))}
          </div>

          {/* 금액 */}
          <div className="flex flex-col">
            <label
              htmlFor="transaction-amount"
              className="typo-sub3 text-text-normal flex h-12 items-center px-400"
            >
              금액
            </label>
            <div className="bg-container-neutral flex h-12 items-center gap-200 rounded-sm px-400">
              <span className="typo-sub3 text-text-alternative">{sign}</span>
              <input
                id="transaction-amount"
                type="text"
                inputMode="numeric"
                value={form.amount}
                onChange={(e) => {
                  const raw = e.target.value.replace(/\D/g, '');
                  setForm((prev) => ({ ...prev, amount: raw }));
                }}
                placeholder="0"
                className="typo-body1 placeholder:text-text-alternative text-text-alternative min-w-0 flex-1 bg-transparent focus:outline-none"
              />
              <span className="typo-body1 text-text-normal shrink-0">원</span>
            </div>
          </div>

          {/* 지출/수입 내용 */}
          <div className="flex flex-col">
            <label
              htmlFor="transaction-description"
              className="typo-sub3 text-text-normal flex h-12 items-center px-400"
            >
              {descriptionLabel}
            </label>
            <div className="flex flex-col gap-200">
              <input
                id="transaction-description"
                type="text"
                value={form.description}
                onChange={(e) => {
                  if (e.target.value.length > DESCRIPTION_MAX) return;
                  setForm((prev) => ({ ...prev, description: e.target.value }));
                }}
                placeholder={descriptionPlaceholder}
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
              />
              <span className="typo-caption2 text-text-alternative ml-auto pr-100">
                {form.description.length}/{DESCRIPTION_MAX}
              </span>
            </div>
          </div>

          {/* 거래처 */}
          <div className="flex flex-col">
            <label
              htmlFor="transaction-vendor"
              className="typo-sub3 text-text-normal flex h-12 items-center px-400"
            >
              거래처
            </label>
            <div className="flex flex-col gap-200">
              <input
                id="transaction-vendor"
                type="text"
                value={form.vendor}
                onChange={(e) => {
                  if (e.target.value.length > VENDOR_MAX) return;
                  setForm((prev) => ({ ...prev, vendor: e.target.value }));
                }}
                placeholder="거래처를 입력해주세요 (ex. 인프런)"
                className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
              />
              <span className="typo-caption2 text-text-alternative ml-auto pr-100">
                {form.vendor.length}/{VENDOR_MAX}
              </span>
            </div>
          </div>

          {/* 일자 */}
          <div className="flex flex-col">
            <span className="typo-sub3 text-text-normal flex h-12 items-center px-400">일자</span>
            <CalendarPicker
              value={form.date}
              onChange={(date) => setForm((prev) => ({ ...prev, date }))}
              className="h-12 w-full"
            />
          </div>

          {/* 영수증 첨부 */}
          <div className="flex flex-col">
            <span className="typo-sub3 text-text-normal flex h-12 items-center px-400">
              영수증 첨부
            </span>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              {...dragHandlers}
              className={cn(
                'bg-container-neutral-alternative flex h-44 w-full cursor-pointer flex-col items-center justify-center gap-300 rounded-sm border p-400 transition-colors',
                isDragging
                  ? 'border-brand-primary bg-container-neutral-interaction border-dashed'
                  : 'border-transparent',
              )}
            >
              <Image src={AdminCloudUploadIcon} alt="upload" width={32} height={32} />
              <span className="typo-sub1 text-text-strong text-center">
                {form.receiptFile ? form.receiptFile.name : '클릭 혹은 파일을 이곳에 드롭하세요'}
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setForm((prev) => ({ ...prev, receiptFile: file }));
                e.target.value = '';
              }}
              className="hidden"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-container-neutral flex shrink-0 items-center justify-end gap-200 px-400 pt-400 pb-500">
          <Button variant="secondary" size="lg" onClick={handleClose}>
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={() => onSubmit?.(form)}>
            저장
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export {
  AddTransactionModal,
  type AddTransactionModalProps,
  type TransactionFormData,
  type TransactionType,
};
