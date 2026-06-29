'use client';

import { ArrowRightIcon, DeleteIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';
import type { DuesTransaction, DuesTransactionType } from '@/types/dues';
import { formatDateDisplay } from '@/utils/shared/date';

interface DuesTransactionDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction?: DuesTransaction | null;
}

const TYPE_CONFIG = {
  expense: {
    label: '지출',
    chipClassName: 'bg-state-error/10 text-state-error',
    sign: '-',
  },
  income: {
    label: '수입',
    chipClassName: 'bg-state-success/10 text-state-success',
    sign: '+',
  },
  dues: {
    label: '회비',
    chipClassName: 'bg-text-alternative/5 text-text-alternative',
    sign: '+',
  },
} satisfies Record<DuesTransactionType, { label: string; chipClassName: string; sign: '+' | '-' }>;

function DuesTransactionDetailModal({
  open,
  onOpenChange,
  transaction,
}: DuesTransactionDetailModalProps) {
  if (!transaction) return null;

  const typeConfig = TYPE_CONFIG[transaction.type];
  const categoryText = transaction.category
    ? `${typeConfig.label} · ${transaction.category}`
    : typeConfig.label;

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
          <section className="bg-container-neutral flex flex-col gap-300 rounded-lg p-450">
            <span
              className={cn(
                'typo-button2 flex w-fit items-center justify-center rounded-sm px-200 py-100',
                typeConfig.chipClassName,
              )}
            >
              {typeConfig.label}
            </span>

            <div className="flex flex-col gap-300">
              <div className="flex flex-col gap-200">
                <strong className="typo-h2 text-text-strong">
                  {typeConfig.sign}
                  {formatAmount(transaction.amount)}원
                </strong>
                <p className="typo-sub3 text-text-strong">{transaction.title}</p>
              </div>

              <div className="bg-line h-px w-full" />

              <dl className="flex flex-col gap-300">
                <DetailRow
                  label="거래처"
                  value={transaction.counterparty ?? transaction.description}
                />
                <DetailRow label="일자" value={formatDateDisplay(transaction.date)} />
                <DetailRow label="분류" value={categoryText} />
                <DetailRow label="등록자" value={transaction.registrant ?? '운영진 김검도'} />
              </dl>
            </div>
          </section>

          <ReceiptCard transaction={transaction} />
        </div>
      </DialogContent>
    </Dialog>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-400">
      <dt className="typo-caption2 text-text-alternative">{label}</dt>
      <dd className="typo-caption1 text-text-strong text-right">{value}</dd>
    </div>
  );
}

function ReceiptCard({ transaction }: { transaction: DuesTransaction }) {
  const hasReceipt = Boolean(transaction.receiptUrl);
  const className = cn(
    'bg-container-neutral flex items-start gap-300 rounded-lg p-450',
    hasReceipt && 'hover:bg-container-neutral-interaction cursor-pointer transition-colors',
  );
  const content = (
    <>
      <div className="bg-container-neutral-alternative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-sm">
        {transaction.receiptThumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={transaction.receiptThumbnailUrl} alt="" className="size-full object-cover" />
        ) : (
          <span className="typo-caption2 text-text-alternative">영수증</span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <p className="typo-sub1 text-text-strong">영수증</p>
        <p
          className={cn('typo-body2', hasReceipt ? 'text-text-alternative' : 'text-text-disabled')}
        >
          {hasReceipt ? '원본 보기' : '첨부된 영수증이 없습니다'}
        </p>
      </div>

      {hasReceipt && (
        <Icon src={ArrowRightIcon} size={12} className="text-icon-normal mt-100 shrink-0" />
      )}
    </>
  );

  if (transaction.receiptUrl) {
    return (
      <a
        href={transaction.receiptUrl}
        target="_blank"
        rel="noopener noreferrer"
        className={className}
      >
        {content}
      </a>
    );
  }

  return <section className={className}>{content}</section>;
}

export { DuesTransactionDetailModal, type DuesTransactionDetailModalProps };
