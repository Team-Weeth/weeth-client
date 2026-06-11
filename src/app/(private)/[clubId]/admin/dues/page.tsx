'use client';

import { useState } from 'react';

import { AdminPlusIcon } from '@/assets/icons/admin';
import { Button, Icon } from '@/components/ui';
import { AddTransactionModal, EditTransactionModal } from '@/components/dues';
import type { TransactionFormData } from '@/components/dues';

const MOCK_TRANSACTION: TransactionFormData = {
  type: 'EXPENSE',
  amount: '50000',
  description: '스터디 지원금',
  vendor: '인프런',
  date: '2025-06-01',
  receiptFile: null,
};

export default function DuesPageContent() {
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Partial<TransactionFormData>>();

  const handleAddSubmit = (data: TransactionFormData) => {
    // TODO: API 연동
    console.log('추가:', data);
  };

  const handleEditSubmit = (data: TransactionFormData) => {
    // TODO: API 연동
    console.log('수정:', data);
  };

  const openEdit = (transaction: Partial<TransactionFormData>) => {
    setEditingTransaction(transaction);
    setEditOpen(true);
  };

  return (
    <div className="flex flex-col gap-600 p-600">
      <div className="flex items-center justify-between">
        <h1 className="typo-h2 text-text-strong">거래내역</h1>
        <Button variant="primary" size="md" onClick={() => setAddOpen(true)} className="gap-200">
          <Icon src={AdminPlusIcon} size={16} alt="" className="text-icon-inverse" />
          거래내역 추가
        </Button>
      </div>

      {/* 테스트용 거래내역 행 */}
      <div className="bg-container-neutral flex items-center justify-between rounded-md px-500 py-400">
        <div className="flex flex-col gap-100">
          <span className="typo-sub3 text-text-normal">{MOCK_TRANSACTION.description}</span>
          <span className="typo-caption2 text-text-alternative">
            {MOCK_TRANSACTION.vendor} · {MOCK_TRANSACTION.date}
          </span>
        </div>
        <div className="flex items-center gap-300">
          <span className="typo-sub3 text-state-error">-{Number(MOCK_TRANSACTION.amount).toLocaleString()}원</span>
          <Button variant="secondary" size="sm" onClick={() => openEdit(MOCK_TRANSACTION)}>
            수정
          </Button>
        </div>
      </div>

      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} onSubmit={handleAddSubmit} />
      <EditTransactionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={editingTransaction}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
