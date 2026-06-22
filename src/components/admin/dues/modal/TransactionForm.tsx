'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';

import { AdminCloudUploadIcon } from '@/assets/icons/admin';
// import { AdminReceiptIcon } from '@/assets/icons/admin';
import { Button, CalendarPicker, Icon } from '@/components/ui';
import { useImageDrop } from '@/hooks/useImageDrop';
// import { analyzeReceipt } from '@/lib/actions/ocr';
import { cn } from '@/lib/cn';
// import { toastError, toastSuccess } from '@/stores/useToastStore';
import { CloseCircleIcon } from '@/assets/icons';

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
  onSubmit: (data: TransactionFormData) => void;
  onCancel: () => void;
}

const DESCRIPTION_MAX = 30;
const VENDOR_MAX = 30;

const TRANSACTION_TYPE_LABEL: Record<TransactionType, string> = {
  EXPENSE: '지출',
  INCOME: '수입',
};

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

interface TextInputFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength: number;
  error?: string;
}

function TextInputField({
  id,
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  error,
}: TextInputFieldProps) {
  return (
    <div className="flex flex-col">
      <label htmlFor={id} className="typo-sub3 text-text-normal flex h-12 items-center px-400">
        {label}
      </label>
      <div className="flex flex-col gap-200">
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
          placeholder={placeholder}
          className="bg-container-neutral typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
        />
        <div className="flex items-center justify-between">
          {error ? <span className="typo-caption2 text-state-error">{error}</span> : <span />}
          <span className="typo-caption2 text-text-alternative pr-100">
            {value.length}/{maxLength}
          </span>
        </div>
      </div>
    </div>
  );
}

type FormErrors = Partial<Record<'amount' | 'description' | 'vendor', string>>;

function TransactionForm({ initialValues, onSubmit, onCancel }: TransactionFormProps) {
  const [form, setForm] = useState<TransactionFormData>(() => getDefaultForm(initialValues));
  const [errors, setErrors] = useState<FormErrors>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  // const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewUrlRef = useRef<string | null>(null);

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

  const { isDragging, dragHandlers } = useImageDrop({ onDrop: setReceiptFile });

  // const handleOcrAnalyze = async () => {
  //   if (!form.receiptFile) return;
  //   setIsOcrLoading(true);
  //   try {
  //     const fd = new FormData();
  //     fd.append('image', form.receiptFile);
  //     const result = await analyzeReceipt(fd);
  //     setForm((prev) => ({
  //       ...prev,
  //       ...(result.amount !== undefined && { amount: result.amount }),
  //       ...(result.vendor !== undefined && { vendor: result.vendor!.slice(0, VENDOR_MAX) }),
  //       ...(result.date !== undefined && { date: result.date }),
  //     }));
  //     const filled = [result.amount && '금액', result.vendor && '거래처', result.date && '일자']
  //       .filter(Boolean)
  //       .join(', ');
  //     toastSuccess(filled ? `${filled}이(가) 자동 입력되었습니다.` : '분석 완료');
  //   } catch (e) {
  //     toastError(e instanceof Error ? e.message : '영수증 분석에 실패했습니다.');
  //   } finally {
  //     setIsOcrLoading(false);
  //   }
  // };

  const validate = (): boolean => {
    const next: FormErrors = {};
    if (!form.amount || Number(form.amount) === 0) next.amount = '금액을 입력해주세요';
    if (!form.description.trim()) next.description = '내용을 입력해주세요';
    if (!form.vendor.trim()) next.vendor = '거래처를 입력해주세요';
    setErrors(next);
    return Object.keys(next).length === 0;
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
              value={form.amount}
              onChange={(e) => {
                const raw = e.target.value.replace(/\D/g, '');
                setForm((prev) => ({ ...prev, amount: raw }));
                if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
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
        <TextInputField
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
        <TextInputField
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={previewUrl}
                  alt="영수증 미리보기"
                  className="h-full max-w-20 rounded-sm object-contain"
                />
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
                  클릭 혹은 파일을 이곳에 드롭하세요
                </span>
              </>
            )}
          </div>

          {/* OCR 자동 분석 버튼 — 추후 활성화
          {form.receiptFile && (
            <Button
              variant="secondary"
              size="lg"
              className="w-full gap-200"
              onClick={handleOcrAnalyze}
              disabled={isOcrLoading}
            >
              {isOcrLoading ? (
                <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <Image src={AdminReceiptIcon} alt="" width={16} height={16} />
              )}
              {isOcrLoading ? '분석 중...' : '영수증 자동 분석'}
            </Button>
          )}
          */}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) setReceiptFile(file);
              e.target.value = '';
            }}
            className="hidden"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-container-neutral flex shrink-0 items-center justify-end gap-200 px-400 pt-400 pb-500">
        <Button variant="secondary" size="lg" onClick={onCancel}>
          취소
        </Button>
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            if (validate()) onSubmit(form);
          }}
        >
          저장
        </Button>
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
