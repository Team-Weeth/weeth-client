'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import type { Cardinal } from '@/types/admin/cardinal';
import { useCardinalSelector } from '@/hooks';
import { DuesTopBar } from './DuesTopBar';
import { DuesBalanceCard } from './DuesBalanceCard';
import { DuesChart, type MonthlyData } from './DuesChart';
import { DuesTransactionTable, type DuesTransaction } from './DuesTransactionTable';
import { DuesGenerationFilter } from './DuesGenerationFilter';

const MOCK_MONTHLY_DATA: MonthlyData[] = [
  { month: '3월', amount: 1425000 },
  { month: '4월', amount: 152129 },
  { month: '5월', amount: 0 },
  { month: '6월', amount: 0 },
  { month: '7월', amount: 0 },
  { month: '8월', amount: 0 },
];

const MOCK_TRANSACTIONS: DuesTransaction[] = [
  {
    id: 1,
    type: 'income',
    content: '수입 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 2,
    type: 'income',
    content: '수입 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 3,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 4,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 5,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 6,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 7,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 8,
    type: 'dues',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 9,
    type: 'dues',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
  {
    id: 10,
    type: 'dues',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
    date: '2000.00.00',
  },
];

function DuesPageContent() {
  const [isPublic, setIsPublic] = useState(true);
  const [activeMonth, setActiveMonth] = useState('4월');
  const { cardinals, setSelectedCardinalId, activeCardinal } = useCardinalSelector();
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  return (
    <div className="tablet:p-700 flex min-w-[340px] flex-col gap-400 p-400">
      <DuesTopBar isPublic={isPublic} onPublicChange={setIsPublic} />
      <DuesGenerationFilter
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        lastUpdated="2026. 7. 20(목) 14:00"
        onSelect={setSelectedCardinalId}
      />
      <div className="tablet:flex-row flex flex-col gap-1">
        <DuesBalanceCard
          currentBalance={152129}
          totalDues={1425000}
          onViewPaymentDetail={() => router.push(`/${clubId}/admin/dues/payment-status`)}
        />
        <DuesChart
          data={MOCK_MONTHLY_DATA}
          activeMonth={activeMonth}
          onMonthChange={setActiveMonth}
          periodStart="2026.03."
          periodEnd="2026.08"
          activeExpense={314129}
          activeIncome={23}
        />
      </div>
      <DuesTransactionTable transactions={MOCK_TRANSACTIONS} />
    </div>
  );
}

export { DuesPageContent };
