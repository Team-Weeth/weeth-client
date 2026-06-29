'use client';

import { useMemo, useState } from 'react';

import { ArrowDecreaseIcon, ArrowIncreaseIcon, NoneIcon, PinIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';
import type { DuesTransaction, DuesTransactionType } from '@/types/dues';
import { formatCompactDateDisplay } from '@/utils/shared/date';
import { DuesTransactionDetailModal } from './DuesTransactionDetailModal';

type DuesTransactionFilter = 'all' | DuesTransactionType;

const FILTERS: Array<{ key: DuesTransactionFilter; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'expense', label: '지출' },
  { key: 'income', label: '수입' },
  { key: 'dues', label: '회비' },
];

interface DuesTransactionSectionProps {
  transactions: DuesTransaction[];
  onTransactionClick?: (transaction: DuesTransaction) => void;
  className?: string;
}

function DuesTransactionSection({
  transactions,
  onTransactionClick,
  className,
}: DuesTransactionSectionProps) {
  const [activeFilter, setActiveFilter] = useState<DuesTransactionFilter>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<DuesTransaction | null>(null);
  const counts = useMemo(() => getTransactionCounts(transactions), [transactions]);
  const filteredTransactions = useMemo(() => {
    const nextTransactions =
      activeFilter === 'all'
        ? transactions
        : transactions.filter((transaction) => transaction.type === activeFilter);

    return [...nextTransactions].sort((a, b) => {
      if (a.type === 'dues' && b.type !== 'dues') return -1;
      if (a.type !== 'dues' && b.type === 'dues') return 1;
      return 0;
    });
  }, [activeFilter, transactions]);

  const handleTransactionClick = (transaction: DuesTransaction) => {
    setSelectedTransaction(transaction);
    onTransactionClick?.(transaction);
  };

  return (
    <>
      <section
        className={cn(
          'bg-container-neutral flex min-h-[420px] flex-1 flex-col rounded-lg p-500',
          className,
        )}
      >
        <h2 className="typo-sub1 text-text-strong">거래 내역</h2>

        <div className="mt-500 flex flex-wrap gap-[5px]">
          {FILTERS.map((filter) => (
            <TransactionFilterChip
              key={filter.key}
              active={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label} {counts[filter.key]}
            </TransactionFilterChip>
          ))}
        </div>

        <div className="mt-500 flex flex-col gap-400">
          {filteredTransactions.map((transaction) => (
            <DuesTransactionListItem
              key={transaction.id}
              transaction={transaction}
              onClick={() => handleTransactionClick(transaction)}
            />
          ))}
        </div>
      </section>

      <DuesTransactionDetailModal
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
        transaction={selectedTransaction}
      />
    </>
  );
}

interface TransactionFilterChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active: boolean;
}

function TransactionFilterChip({
  active,
  className,
  type = 'button',
  ...props
}: TransactionFilterChipProps) {
  return (
    <button
      type={type}
      className={cn(
        'typo-button2 text-text-normal hover:bg-button-neutral-interaction border-line cursor-pointer rounded-[10px] border px-400 py-200 transition-colors',
        active ? 'bg-button-neutral border-transparent' : 'bg-transparent',
        className,
      )}
      {...props}
    />
  );
}

interface DuesTransactionListItemProps {
  transaction: DuesTransaction;
  onClick?: () => void;
}

function DuesTransactionListItem({ transaction, onClick }: DuesTransactionListItemProps) {
  const isIncomeLike = transaction.type === 'income' || transaction.type === 'dues';
  const amountPrefix = isIncomeLike ? '+' : '-';

  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-container-neutral-alternative flex w-full cursor-pointer items-center gap-400 rounded-md p-200 text-left transition-colors"
    >
      <TransactionTypeIcon type={transaction.type} />

      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <div className="flex items-center gap-100">
          {transaction.type === 'dues' && (
            <Icon src={PinIcon} size={16} className="text-icon-alternative" />
          )}
          <span className="typo-sub3 text-text-strong truncate">{transaction.title}</span>
        </div>
        <span className="typo-caption2 text-text-alternative truncate">
          {transaction.description} · {formatCompactDateDisplay(transaction.date)}
        </span>
      </div>

      <span
        className={cn(
          'typo-sub3 shrink-0',
          isIncomeLike ? 'text-state-success' : 'text-text-strong',
        )}
      >
        {amountPrefix}
        {formatAmount(transaction.amount)}
      </span>
    </button>
  );
}

function TransactionTypeIcon({ type }: { type: DuesTransactionType }) {
  const config = {
    dues: {
      icon: NoneIcon,
      className: 'bg-icon-alternative/10 text-icon-alternative',
      size: 24,
    },
    income: {
      icon: ArrowIncreaseIcon,
      className: 'bg-state-success/10 text-state-success',
      size: 14,
    },
    expense: {
      icon: ArrowDecreaseIcon,
      className: 'bg-state-error/10 text-state-error',
      size: 14,
    },
  } satisfies Record<
    DuesTransactionType,
    { icon: typeof NoneIcon; className: string; size: number }
  >;
  const { icon, className, size } = config[type];

  return (
    <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-md', className)}>
      <Icon src={icon} size={size} />
    </span>
  );
}

function getTransactionCounts(transactions: DuesTransaction[]) {
  return {
    all: transactions.length,
    expense: transactions.filter((transaction) => transaction.type === 'expense').length,
    income: transactions.filter((transaction) => transaction.type === 'income').length,
    dues: transactions.filter((transaction) => transaction.type === 'dues').length,
  } satisfies Record<DuesTransactionFilter, number>;
}

export { DuesTransactionSection, type DuesTransactionSectionProps };
