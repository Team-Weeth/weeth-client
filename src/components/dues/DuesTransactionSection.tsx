'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import type { DuesTransaction } from '@/types/dues';
import {
  DUES_TRANSACTION_FILTERS,
  getTransactionCounts,
  sortDuesTransactions,
  type DuesTransactionFilter,
} from '@/utils/dues/duesTransaction';
import { DuesTransactionDetailModal } from './DuesTransactionDetailModal';
import { DuesTransactionFilterChip } from './DuesTransactionFilterChip';
import { DuesTransactionListItem } from './DuesTransactionListItem';

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
  const counts = getTransactionCounts(transactions);
  const nextTransactions =
    activeFilter === 'all'
      ? transactions
      : transactions.filter((transaction) => transaction.type === activeFilter);
  const filteredTransactions = sortDuesTransactions(nextTransactions);

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
          {DUES_TRANSACTION_FILTERS.map((filter) => (
            <DuesTransactionFilterChip
              key={filter.key}
              active={activeFilter === filter.key}
              onClick={() => setActiveFilter(filter.key)}
            >
              {filter.label} {counts[filter.key]}
            </DuesTransactionFilterChip>
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

export { DuesTransactionSection, type DuesTransactionSectionProps };
