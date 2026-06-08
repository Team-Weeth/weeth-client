'use client';

import { useState } from 'react';

import {
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Tag,
} from '@/components/ui';
import { cn } from '@/lib/cn';

type TransactionType = 'income' | 'expense' | 'dues';

interface DuesTransaction {
  id: number;
  type: TransactionType;
  content: string;
  counterparty: string;
  amount: number;
  totalBalance: number;
}

type FilterTab = 'all' | 'expense' | 'income' | 'dues';

interface TabConfig {
  key: FilterTab;
  label: string;
  count: number;
}

interface DuesTransactionTableProps extends React.HTMLAttributes<HTMLDivElement> {
  transactions: DuesTransaction[];
}

const TYPE_LABEL: Record<TransactionType, string> = {
  income: '수입',
  expense: '지출',
  dues: '회비',
};

function TransactionTypeTag({ type }: { type: TransactionType }) {
  if (type === 'income') {
    return (
      <Tag variant="primary" className="bg-brand-primary/10 text-brand-primary">
        수입
      </Tag>
    );
  }
  if (type === 'dues') {
    return (
      <Tag className="bg-brand-secondary/10 text-brand-secondary">
        회비
      </Tag>
    );
  }
  return (
    <Tag className="bg-state-caution/10 text-state-caution">
      지출
    </Tag>
  );
}

function DuesTransactionTable({ className, transactions, ...props }: DuesTransactionTableProps) {
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
    <div className={cn('flex flex-col gap-400', className)} {...props}>
      <span className="typo-sub3 text-text-strong">거래 내역</span>

      <Card className="flex flex-col gap-0 overflow-hidden p-0">
        {/* Tabs + Sort */}
        <div className="flex items-center justify-between gap-300 border-b border-line px-400 py-300">
          <div className="flex items-center gap-100">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'typo-button2 cursor-pointer rounded-sm px-300 py-200 transition-colors',
                  activeTab === tab.key
                    ? 'bg-container-primary text-text-inverse'
                    : 'text-text-alternative hover:bg-container-neutral-interaction',
                )}
              >
                {tab.label} {tab.count}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => setSortDesc((prev) => !prev)}
            className="typo-caption1 text-text-alternative hover:text-text-normal cursor-pointer"
          >
            {sortDesc ? '최근 순' : '오래된 순'}
          </button>
        </div>

        <Table wrapperClassName="overflow-auto">
          <TableHeader className="bg-container-neutral">
            <TableRow className="border-0 hover:bg-transparent">
              <TableHead className="typo-body2 text-text-alternative w-20">상태</TableHead>
              <TableHead className="typo-body2 text-text-alternative">수입/지출 내용</TableHead>
              <TableHead className="typo-body2 text-text-alternative">거래처</TableHead>
              <TableHead className="typo-body2 text-text-alternative text-right">금액(원)</TableHead>
              <TableHead className="typo-body2 text-text-alternative text-right">총 잔액</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={5} className="py-700 text-center">
                  <span className="typo-body2 text-text-alternative">거래 내역이 없습니다.</span>
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((tx) => (
                <TableRow
                  key={tx.id}
                  className="hover:bg-container-neutral-interaction border-0 cursor-default"
                >
                  <TableCell>
                    <TransactionTypeTag type={tx.type} />
                  </TableCell>
                  <TableCell className="typo-body2 text-text-strong">{tx.content}</TableCell>
                  <TableCell className="typo-body2 text-text-normal">{tx.counterparty}</TableCell>
                  <TableCell
                    className={cn(
                      'typo-body2 text-right',
                      tx.type === 'income' || tx.type === 'dues'
                        ? 'text-brand-secondary'
                        : 'text-state-error',
                    )}
                  >
                    {tx.type === 'income' || tx.type === 'dues' ? '+' : '-'}&nbsp;
                    {tx.amount.toLocaleString('ko-KR')}
                  </TableCell>
                  <TableCell className="typo-body2 text-text-normal text-right">
                    {tx.totalBalance.toLocaleString('ko-KR')}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

export { DuesTransactionTable, type DuesTransactionTableProps, type DuesTransaction, type TransactionType };
