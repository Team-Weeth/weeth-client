'use client';

import { useEffect, useState } from 'react';

import { cn } from '@/lib/cn';
import type { DuesTransaction, DuesTransactionCounts } from '@/types/dues';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useDuesTransactionDetail } from '@/hooks/queries';
import {
  DUES_TRANSACTION_FILTERS,
  getTransactionCounts,
  mergeTransactionCounts,
  sortDuesTransactions,
  type DuesTransactionFilter,
} from '@/utils/dues/duesTransaction';
import { DuesTransactionDetailModal } from './DuesTransactionDetailModal';
import { DuesTransactionFilterChip } from './DuesTransactionFilterChip';
import { DuesTransactionListItem } from './DuesTransactionListItem';

interface DuesTransactionSectionProps {
  cardinal?: number;
  transactions: DuesTransaction[];
  counts?: DuesTransactionCounts;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onFetchNextPage?: () => void;
  onTransactionClick?: (transaction: DuesTransaction) => void;
  className?: string;
}

function DuesTransactionSection({
  cardinal,
  transactions,
  counts: apiCounts,
  hasNextPage = false,
  isFetchingNextPage = false,
  onFetchNextPage,
  onTransactionClick,
  className,
}: DuesTransactionSectionProps) {
  const [activeFilter, setActiveFilter] = useState<DuesTransactionFilter>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<DuesTransaction | null>(null);
  const { data: transactionDetail } = useDuesTransactionDetail(
    cardinal,
    selectedTransaction && selectedTransaction.id > 0 ? selectedTransaction.id : undefined,
  );
  const fallbackCounts = getTransactionCounts(transactions);
  const counts = mergeTransactionCounts(fallbackCounts, apiCounts);
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '160px',
  });
  const nextTransactions =
    activeFilter === 'all'
      ? transactions
      : transactions.filter((transaction) => transaction.type === activeFilter);
  const filteredTransactions = sortDuesTransactions(nextTransactions);

  const handleTransactionClick = (transaction: DuesTransaction) => {
    setSelectedTransaction(transaction);
    onTransactionClick?.(transaction);
  };

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      onFetchNextPage?.();
    }
  }, [hasNextPage, isFetchingNextPage, isIntersecting, onFetchNextPage]);

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
          <div ref={sentinelRef} className="h-px w-full" />
          {isFetchingNextPage && (
            <p className="typo-caption2 text-text-alternative py-200 text-center">
              거래 내역을 더 불러오는 중이에요.
            </p>
          )}
        </div>
      </section>

      <DuesTransactionDetailModal
        open={selectedTransaction !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedTransaction(null);
        }}
        transaction={transactionDetail ?? selectedTransaction}
      />
    </>
  );
}

export { DuesTransactionSection, type DuesTransactionSectionProps };
