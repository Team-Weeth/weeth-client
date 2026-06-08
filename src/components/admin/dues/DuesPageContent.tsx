'use client';

import { useState } from 'react';

import { DuesTopBar } from './DuesTopBar';
import { DuesBalanceCard } from './DuesBalanceCard';
import { DuesChart, type MonthlyData } from './DuesChart';
import { DuesTransactionTable, type DuesTransaction } from './DuesTransactionTable';

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
  },
  {
    id: 2,
    type: 'income',
    content: '수입 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 3,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 4,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 5,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 6,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 7,
    type: 'expense',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 8,
    type: 'dues',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 9,
    type: 'dues',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
  {
    id: 10,
    type: 'dues',
    content: '지출 내용',
    counterparty: '거래처 내용',
    amount: 0,
    totalBalance: 0,
  },
];

function DuesPageContent() {
  const [isPublic, setIsPublic] = useState(true);

  return (
    <div className="tablet:p-700 flex flex-col gap-400 p-400">
      <DuesTopBar isPublic={isPublic} onPublicChange={setIsPublic} />
      <div className="tablet:flex-row flex flex-col gap-1">
        <DuesBalanceCard currentBalance={152129} totalDues={1425000} />
        <DuesChart
          data={MOCK_MONTHLY_DATA}
          activeMonth="4월"
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
