'use client';

import { useState } from 'react';

import { useParams, useRouter } from 'next/navigation';

import type { MonthlyData, DuesTransaction } from '@/types/admin/dues';
import { useCardinalSelector } from '@/hooks';
import { DuesTopBar } from './DuesTopBar';
import { DuesBalanceCard } from './DuesBalanceCard';
import { DuesChart } from './DuesChart';

import { DuesGenerationFilter } from './DuesGenerationFilter';
import { AddTransactionModal } from './modal/AddTransactionModal';
import { EditTransactionModal } from './modal/EditTransactionModal';
import { TransactionDetailModal } from './modal/TransactionDetailModal';
import type { TransactionDetail } from './modal/TransactionDetailModal';
import type { TransactionFormData } from './modal/TransactionForm';
import { DuesTransactionTable } from './DuesTransactionTable';
import { DuesTutorialModal } from './modal/DuesTutorialModal';

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

function toTransactionDetail(tx: DuesTransaction): TransactionDetail {
  return {
    type: tx.type === 'expense' ? 'EXPENSE' : 'INCOME',
    amount: String(tx.amount),
    description: tx.content,
    vendor: tx.counterparty,
    date: tx.date,
  };
}

function DuesPageContent() {
  const [isPublic, setIsPublic] = useState(true);
  const [activeMonth, setActiveMonth] = useState('4월');
  const { cardinals, setSelectedCardinalId, activeCardinal } = useCardinalSelector();
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  // TODO: 총 회비 정보 입력 안 됐을 때만 모달 띄우기
  const [tutorialOpen, setTutorialOpen] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<DuesTransaction | null>(null);
  const [editingValues, setEditingValues] = useState<Partial<TransactionFormData>>();

  const handleMoreClick = (tx: DuesTransaction) => {
    setSelectedTransaction(tx);
    setDetailOpen(true);
  };

  const handleEditOpen = () => {
    if (!selectedTransaction) return;
    setDetailOpen(false);
    setEditingValues({
      type: selectedTransaction.type === 'expense' ? 'EXPENSE' : 'INCOME',
      amount: String(selectedTransaction.amount),
      description: selectedTransaction.content,
      vendor: selectedTransaction.counterparty,
      date: selectedTransaction.date,
    });
    setEditOpen(true);
  };

  return (
    <div className="tablet:p-700 flex min-w-85 flex-col gap-400 p-400">
      <DuesTopBar
        isPublic={isPublic}
        onPublicChange={setIsPublic}
        onAddClick={() => setAddOpen(true)}
      />
      <DuesGenerationFilter
        cardinals={cardinals}
        activeCardinal={activeCardinal}
        lastUpdated="2026. 7. 20(목) 14:00"
        onSelect={setSelectedCardinalId}
      />
      <div className="tablet:flex-row flex flex-col gap-1">
        {/* TODO: 온보딩 현재 진행 중인 스텝으로 보내주기 */}
        <DuesBalanceCard
          currentBalance={152129}
          totalDues={1425000}
          onViewPaymentDetail={() => router.push(`/${clubId}/admin/dues/payment-status`)}
          onSetTotalDues={() => router.push(`/${clubId}/admin/dues/setup/1`)}
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
      <DuesTransactionTable transactions={MOCK_TRANSACTIONS} onMoreClick={handleMoreClick} />

      <AddTransactionModal
        open={addOpen}
        onOpenChange={setAddOpen}
        onSubmit={() => {
          // TODO: API 연동
        }}
      />
      {selectedTransaction && (
        <TransactionDetailModal
          open={detailOpen}
          onOpenChange={setDetailOpen}
          transaction={toTransactionDetail(selectedTransaction)}
          onEdit={handleEditOpen}
          onDelete={() => {
            // TODO: API 연동
          }}
        />
      )}
      <EditTransactionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={editingValues}
        onSubmit={() => {
          // TODO: API 연동
        }}
      />
      <DuesTutorialModal
        open={tutorialOpen}
        onOpenChange={setTutorialOpen}
        onStart={() => router.push(`/${clubId}/admin/dues/setup/1`)}
      />
    </div>
  );
}

export { DuesPageContent };
