import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';
import type { DuesTransaction } from '@/types/dues';
import { formatDateDisplay } from '@/utils/shared/date';
import { DUES_TRANSACTION_TYPE_CONFIG } from '@/utils/dues/duesTransaction';

interface DuesTransactionDetailCardProps {
  transaction: DuesTransaction;
}

function DuesTransactionDetailCard({ transaction }: DuesTransactionDetailCardProps) {
  const typeConfig = DUES_TRANSACTION_TYPE_CONFIG[transaction.type];
  const categoryText = transaction.category
    ? `${typeConfig.label} · ${transaction.category}`
    : typeConfig.label;

  return (
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
          <DuesTransactionDetailRow
            label="거래처"
            value={transaction.counterparty ?? transaction.description}
          />
          <DuesTransactionDetailRow label="일자" value={formatDateDisplay(transaction.date)} />
          <DuesTransactionDetailRow label="분류" value={categoryText} />
          <DuesTransactionDetailRow
            label="등록자"
            value={transaction.registrant ?? '운영진 김검도'}
          />
        </dl>
      </div>
    </section>
  );
}

function DuesTransactionDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-400">
      <dt className="typo-caption2 text-text-alternative">{label}</dt>
      <dd className="typo-caption1 text-text-strong text-right">{value}</dd>
    </div>
  );
}

export { DuesTransactionDetailCard, type DuesTransactionDetailCardProps };
