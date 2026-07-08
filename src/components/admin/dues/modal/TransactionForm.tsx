'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { AdminCloudUploadIcon } from '@/assets/icons/admin';
import { Button, CalendarPicker, Icon } from '@/components/ui';
import { useImageDrop } from '@/hooks/useImageDrop';
import { cn } from '@/lib/cn';
import { CloseCircleIcon } from '@/assets/icons';
import { formatAmount } from '@/lib/formatAmount';
import { getApiErrorMessage } from '@/utils/shared';
import { DuesTextInputField } from './DuesTextInputField';

type TransactionType = 'EXPENSE' | 'INCOME';

interface TransactionFormData {
  type: TransactionType;
  amount: string;
  description: string;
  vendor: string;
  date: string;
  receiptFile: File | null;
}

interface TransactionFormProps {
  initialValues?: Partial<TransactionFormData>;
  onSubmit: (data: TransactionFormData) => void | Promise<void>;
  onCancel: () => void;
}

const DESCRIPTION_MAX = 30;
const VENDOR_MAX = 30;

const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  EXPENSE: '지출',
  INCOME: '수입',
};

function isPdfFile(file: File) {
  return file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
}

function isReceiptUploadFile(file: File) {
  return file.type.startsWith('image/') || isPdfFile(file);
}

function getDefaultForm(initial?: Partial<TransactionFormData>): TransactionFormData {
  const today = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    type: 'EXPENSE',
    amount: '',
    description: '',
    vendor: '',
    date: `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`,
    receiptFile: null,
    ...initial,
  };
}

type FormErrors = Partial<Record<'amount' | 'description' | 'vendor', string>>;

function TransactionForm({ initialValues, onSubmit, onCancel }: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormData>(() => getDefaultForm(initialValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);
  const isPdfReceipt = form.receiptFile ? isPdfFile(form.receiptFile) : false;

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const setReceiptFile = (file: File | null) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    const newUrl = file ? URL.createObjectURL(file) : null;
    previewUrlRef.current = newUrl;
    setForm((prev) => ({ ...prev, receiptFile: file }));
    setPreviewUrl(newUrl);
  };

  const { isDragging, dragHandlers } = useImageDrop({
    onDrop: setReceiptFile,
    accept: isReceiptUploadFile,
  });

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.amount || Number(form.amount) === 0) next.amount = '금액을 입력해주세요';
    if (!form.description.trim()) next.description = '내용을 입력해주세요';
    if (!form.vendor.trim()) next.vendor = '거래처를 입력해주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // 제출 결과(성공 시 모달 닫기)를 상위에서 알 수 있도록 onSubmit의 반환 Promise를 기다린다.
  // 잔액 부족 등 서버 에러(예: 500 "잔액이 부족합니다...")면 모달을 유지한 채 메시지를 노출한다.
  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setSubmitError(getApiErrorMessage(err) ?? '저장에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const sign = form.type === 'EXPENSE' ? '-' : '+';
  const descriptionLabel = form.type === 'EXPENSE' ? '지출 내용' : '수입 내용';
  const descriptionPlaceholder =
    form.type === 'EXPENSE'
      ? '사용한 내용을 작성해주세요 (ex. 스터디 지원금)'
      : '수입 내용을 작성해주세요';

  return (
    <>
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
              value={formatAmount(Number(form.amount))}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setForm((prev) => ({ ...prev, amount: raw }));
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                if (submitError) setSubmitError(null);
              }}
              placeholder="0"
              className="typo-body1 placeholder:text-text-alternative text-text-normal min-w-0 flex-1 bg-transparent focus:outline-none"
            />
            <span className="typo-body1 text-text-normal shrink-0">원</span>
          </div>
          {errors.amount && (
            <span className="typo-caption2 text-state-error px-400">{errors.amount}</span>
          )}
        </div>

        {/* 지출/수입 내용 */}
        <DuesTextInputField
          id="transaction-description"
          label={descriptionLabel}
          value={form.description}
          onChange={(value) => {
            setForm((prev) => ({ ...prev, description: value }));
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
          placeholder={descriptionPlaceholder}
          maxLength={DESCRIPTION_MAX}
          error={errors.description}
        />

        {/* 거래처 */}
        <DuesTextInputField
          id="transaction-vendor"
          label="거래처"
          value={form.vendor}
          onChange={(value) => {
            setForm((prev) => ({ ...prev, vendor: value }));
            if (errors.vendor) setErrors((prev) => ({ ...prev, vendor: undefined }));
          }}
          placeholder="거래처를 입력해주세요 (ex. 인프런)"
          maxLength={VENDOR_MAX}
          error={errors.vendor}
        />

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
        <div className="flex flex-col gap-200">
          <span className="typo-sub3 text-text-normal flex h-12 items-center px-400">
            영수증 첨부
          </span>

          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) =>
              e.key === 'Enter' || e.key === ' ' ? fileInputRef.current?.click() : undefined
            }
            {...dragHandlers}
            className={cn(
              'bg-container-neutral-alternative flex h-44 w-full cursor-pointer rounded-sm border p-400 transition-colors',
              isDragging
                ? 'border-brand-primary bg-container-neutral-interaction border-dashed'
                : 'border-transparent',
              previewUrl ? 'items-start gap-300' : 'flex-col items-center justify-center gap-300',
            )}
          >
            {previewUrl ? (
              <>
                {isPdfReceipt ? (
                  <div className="bg-container-neutral flex h-full w-20 shrink-0 items-center justify-center rounded-sm">
                    <span className="typo-caption1 text-text-alternative">PDF</span>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={previewUrl}
                    alt="영수증 미리보기"
                    className="h-full max-w-20 rounded-sm object-contain"
                  />
                )}
                <div className="flex flex-1 flex-col gap-100 self-center overflow-hidden">
                  <span className="typo-body2 text-text-strong w-full truncate text-left">
                    {form.receiptFile?.name}
                  </span>
                  <span className="typo-caption2 text-text-alternative self-start">
                    클릭하여 변경
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setReceiptFile(null);
                  }}
                  className="text-icon-alternative hover:text-icon-normal flex shrink-0 align-top transition-colors"
                  aria-label="영수증 삭제"
                >
                  <Icon src={CloseCircleIcon} size={22} />
                </button>
              </>
            ) : (
              <>
                <Image src={AdminCloudUploadIcon} alt="upload" width={32} height={32} />
                <span className="typo-sub1 text-text-strong text-center">
                  클릭 혹은 이미지/PDF 파일을 이곳에 드롭하세요
                </span>
              </>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file && isReceiptUploadFile(file)) setReceiptFile(file);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-container-neutral flex shrink-0 flex-col gap-200 px-400 pt-400 pb-500">
        {submitError && (
          <span className="typo-body2 text-state-error flex self-end px-400">{submitError}</span>
        )}
        <div className="flex items-center justify-end gap-200">
          <Button variant="secondary" size="lg" onClick={onCancel} disabled={isSubmitting}>
            취소
          </Button>
          <Button variant="primary" size="lg" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-200">
                <span className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                저장 중
              </span>
            ) : (
              '저장'
            )}
          </Button>
        </div>
      </div>
    </>
  );
}

export {
  TransactionForm,
  type TransactionFormData,
  type TransactionFormProps,
  type TransactionType,
};
