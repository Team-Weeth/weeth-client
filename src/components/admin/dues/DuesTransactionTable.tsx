'use client';

import { useState } from 'react';

import {
  Icon,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { MoreHorizIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import { AdminReceiptIcon } from '@/assets/icons/admin';
import { TransactionType } from '@/types/admin/dues';

interface DuesTransaction {
  id: number;
  type: TransactionType;
  content: string;
  counterparty: string;
  amount: number;
  totalBalance: number;
  date: string;
}

type FilterTab = 'all' | TransactionType;

interface TabConfig {
  key: FilterTab;
  label: string;
  count: number;
}

interface DuesTransactionTableProps extends React.HTMLAttributes<HTMLDivElement> {
  transactions: DuesTransaction[];
  onReceiptClick?: (transaction: DuesTransaction) => void;
  onMoreClick?: (transaction: DuesTransaction) => void;
}

function TransactionTypeTag({ type }: { type: TransactionType }) {
  if (type === 'income') {
    return (
      <span className="typo-caption1 bg-state-success/10 text-state-success inline-flex h-6 items-center justify-center rounded-[5px] px-200 py-100 whitespace-nowrap">
        수입
      </span>
    );
  }
  if (type === 'dues') {
    return (
      <span className="typo-caption1 bg-brand-primary/10 text-brand-primary inline-flex h-6 items-center justify-center rounded-[5px] px-200 py-100 whitespace-nowrap">
        회비
      </span>
    );
  }
  return (
    <span className="typo-caption1 bg-state-error/10 text-state-error inline-flex h-6 items-center justify-center rounded-[5px] px-200 py-100 whitespace-nowrap">
      지출
    </span>
  );
}

function DuesTransactionTable({
  className,
  transactions,
  onReceiptClick,
  onMoreClick,
  ...props
}: DuesTransactionTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortDesc, setSortDesc] = useState(true);

  const allCount = transactions.length;
  const expenseCount = transactions.filter((t) => t.type === 'expense').length;
  const incomeCount = transactions.filter((t) => t.type === 'income').length;
  const duesCount = transactions.filter((t) => t.type === 'dues').length;

  const tabs: TabConfig[] = [
    { key: 'all', label: '전체', count: allCount },
    { key: 'expense', label: '지출', count: expenseCount },
    { key: 'income', label: '수입', count: incomeCount },
    { key: 'dues', label: '회비', count: duesCount },
  ];

  const filtered = transactions.filter((t) => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  const sorted = sortDesc ? [...filtered] : [...filtered].reverse();

  return (
    <div
      className={cn('bg-container-neutral flex flex-col gap-600 rounded-lg p-450', className)}
      {...props}
    >
      <span className="typo-h3 text-text-strong">거래 내역</span>

      <div className="flex flex-col gap-400">
        {/* Chips + Sort */}
        <div className="flex flex-wrap items-center justify-between gap-200">
          <div className="flex items-center gap-[5px]">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'typo-button2 min-w-10 cursor-pointer rounded-[10px] px-400 py-200 transition-colors',
                  activeTab === tab.key
                    ? 'bg-button-neutral text-text-strong'
                    : 'border-line text-text-normal hover:bg-container-neutral-interaction border',
                )}
              >
                {tab.label} {tab.count}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSortDesc((prev) => !prev)}
            className="typo-button2 border-line text-text-normal hover:bg-container-neutral-interaction min-w-10 cursor-pointer rounded-[10px] border px-400 py-200 transition-colors"
          >
            {sortDesc ? '최근 순' : '오래된 순'}
          </button>
        </div>

        <div className="border-line overflow-x-auto rounded-sm border">
          <Table>
            <TableHeader className="bg-container-neutral-alternative">
              <TableRow className="border-line border-b hover:bg-transparent">
                <TableHead className="typo-body2 text-text-alternative w-[88px]">상태</TableHead>
                <TableHead className="typo-body2 text-text-alternative min-w-32">
                  수입/지출 내용
                </TableHead>
                <TableHead className="typo-body2 text-text-alternative min-w-32">거래처</TableHead>
                <TableHead className="typo-body2 text-text-alternative w-32">금액(원)</TableHead>
                <TableHead className="typo-body2 text-text-alternative w-32">총 잔액</TableHead>
                <TableHead className="typo-body2 text-text-alternative tablet:table-cell hidden w-32">
                  일자
                </TableHead>
                <TableHead className="tablet:table-cell hidden w-14" />
                <TableHead className="tablet:table-cell hidden w-14" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="py-700 text-center">
                    <span className="typo-body2 text-text-alternative">거래 내역이 없습니다.</span>
                  </TableCell>
                </TableRow>
              ) : (
                sorted.map((tx) => (
                  <TableRow
                    key={tx.id}
                    onClick={() => onMoreClick?.(tx)}
                    className="border-line hover:bg-container-neutral-interaction cursor-pointer border-t"
                  >
                    <TableCell>
                      <TransactionTypeTag type={tx.type} />
                    </TableCell>
                    <TableCell className="typo-body2 text-text-strong">{tx.content}</TableCell>
                    <TableCell className="typo-body2 text-text-strong">{tx.counterparty}</TableCell>
                    <TableCell
                      className={cn(
                        'typo-body2',
                        tx.type === 'income' || tx.type === 'dues'
                          ? 'text-state-success'
                          : 'text-state-error',
                      )}
                    >
                      <span className="flex items-center gap-100">
                        <span>{tx.type === 'income' || tx.type === 'dues' ? '+' : '-'}</span>
                        <span>{tx.amount.toLocaleString('ko-KR')}</span>
                      </span>
                    </TableCell>
                    <TableCell className="typo-body2 text-text-strong">
                      {tx.totalBalance.toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell className="typo-body2 text-text-strong tablet:table-cell hidden">
                      {tx.date}
                    </TableCell>
                    <TableCell className="tablet:table-cell hidden">
                      <button
                        type="button"
                        className="text-icon-alternative hover:text-icon-strong cursor-pointer"
                        aria-label="영수증 보기"
                      >
                        <Icon src={AdminReceiptIcon} alt="영수증" size={24} />
                      </button>
                    </TableCell>
                    <TableCell className="tablet:table-cell hidden">
                      <button
                        type="button"
                        onClick={() => onMoreClick?.(tx)}
                        className="text-icon-alternative hover:text-icon-strong cursor-pointer"
                        aria-label="더보기"
                      >
                        <Icon src={MoreHorizIcon} alt="더보기" size={16} />
                      </button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}

export {
  DuesTransactionTable,
  type DuesTransactionTableProps,
  type DuesTransaction,
  type TransactionType,
};
