'use client';

import { useState } from 'react';

import {
  Dialog,
  DialogContent,
  DialogTitle,
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
import { DuesPagination } from '@/components/admin/dues/setup/components';
import type { DuesTransaction, TransactionType } from '@/types/admin/dues';

type FilterTab = 'all' | TransactionType;

/** 페이지당 거래 내역 수 */
const ITEMS_PER_PAGE = 10;

interface TabConfig {
  key: FilterTab;
  label: string;
  count: number;
}

interface DuesTransactionTableProps extends React.HTMLAttributes<HTMLDivElement> {
  transactions: DuesTransaction[];
  onMoreClick?: (transaction: DuesTransaction) => void;
}

/** 거래내역 타입별 태그 라벨/색상 */
const TRANSACTION_TYPE_TAG: Record<TransactionType, { label: string; className: string }> = {
  CARRY_OVER: { label: '이월', className: 'bg-brand-secondary/10 text-brand-secondary' },
  DUES: { label: '회비', className: 'bg-brand-primary/10 text-brand-primary' },
  INCOME: { label: '수입', className: 'bg-state-success/10 text-state-success' },
  EXPENSE: { label: '지출', className: 'bg-state-error/10 text-state-error' },
  REFUND: { label: '환불', className: 'bg-brand-purple/10 text-brand-purple' },
};

function TransactionTypeTag({ type }: { type: TransactionType }) {
  const { label, className } = TRANSACTION_TYPE_TAG[type];
  return <span className={cn('typo-caption1 tag-base', className)}>{label}</span>;
}

function DuesTransactionTable({
  className,
  transactions,
  onMoreClick,
  ...props
}: DuesTransactionTableProps) {
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [sortDesc, setSortDesc] = useState(true);
  const [page, setPage] = useState(1);
  // const [receiptUrl, setReceiptUrl] = useState<string | null>(null);

  const allCount = transactions.length;
  const expenseCount = transactions.filter((t) => t.type === 'EXPENSE').length;
  const incomeCount = transactions.filter((t) => t.type === 'INCOME').length;
  const duesCount = transactions.filter((t) => t.type === 'DUES').length;

  const tabs: TabConfig[] = [
    { key: 'all', label: '전체', count: allCount },
    { key: 'EXPENSE', label: '지출', count: expenseCount },
    { key: 'INCOME', label: '수입', count: incomeCount },
    { key: 'DUES', label: '회비', count: duesCount },
  ];

  const filtered = transactions.filter((t) => {
    if (activeTab === 'all') return true;
    return t.type === activeTab;
  });

  const sorted = sortDesc ? [...filtered] : [...filtered].reverse();

  const totalPages = Math.max(1, Math.ceil(sorted.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(page, totalPages);
  const paged = sorted.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleTabChange = (key: FilterTab) => {
    setActiveTab(key);
    setPage(1);
  };

  const handleSortToggle = () => {
    setSortDesc((prev) => !prev);
    setPage(1);
  };

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
                onClick={() => handleTabChange(tab.key)}
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
            onClick={handleSortToggle}
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
              {paged.length === 0 ? (
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={8} className="py-700 text-center">
                    <span className="typo-body2 text-text-alternative">거래 내역이 없습니다.</span>
                  </TableCell>
                </TableRow>
              ) : (
                paged.map((tx) => (
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
                        tx.direction === 'INCOME' ? 'text-state-success' : 'text-state-error',
                      )}
                    >
                      <span className="flex items-center gap-100">
                        <span>{tx.direction === 'INCOME' ? '+' : '-'}</span>
                        <span>{tx.amount.toLocaleString('ko-KR')}</span>
                      </span>
                    </TableCell>
                    <TableCell className="typo-body2 text-text-strong">
                      {tx.totalBalance.toLocaleString('ko-KR')}
                    </TableCell>
                    <TableCell className="typo-body2 text-text-strong tablet:table-cell hidden">
                      {tx.date}
                    </TableCell>
                    {/* TODO: 영수증 정상화시 복구 */}
                    {/* <TableCell className="tablet:table-cell hidden">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (tx.receiptUrl) setReceiptUrl(tx.receiptUrl);
                        }}
                        disabled={!tx.receiptUrl}
                        className="text-icon-alternative hover:text-icon-strong cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label="영수증 보기"
                      >
                        <Icon src={AdminReceiptIcon} alt="영수증" size={24} />
                      </button>
                    </TableCell> */}
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

        {totalPages > 1 && (
          <DuesPagination page={currentPage} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* <Dialog open={!!receiptUrl} onOpenChange={(open) => !open && setReceiptUrl(null)}>
        <DialogContent
          showCloseButton={false}
          adminMobileFullscreen={false}
          className="w-auto max-w-[calc(100%-2rem)] border-0 bg-transparent p-0 shadow-none sm:max-w-2xl"
        >
          <DialogTitle className="sr-only">영수증</DialogTitle>
          {receiptUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={receiptUrl}
              alt="영수증"
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          )}
        </DialogContent>
      </Dialog> */}
    </div>
  );
}

export {
  DuesTransactionTable,
  TRANSACTION_TYPE_TAG,
  type DuesTransactionTableProps,
  type DuesTransaction,
  type TransactionType,
};
