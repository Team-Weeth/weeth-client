'use client';

import { useState } from 'react';

import { AdminPlusIcon } from '@/assets/icons/admin';
import { Button, Icon } from '@/components/ui';
import { AddTransactionModal, EditTransactionModal, TransactionDetailModal } from '@/components/dues';
import type { TransactionDetail, TransactionFormData } from '@/components/dues';

const MOCK_TRANSACTION: TransactionDetail = {
  type: 'EXPENSE',
  amount: '123000',
  description: '스터디 지원금',
  vendor: '인프런',
  date: '2026-07-20',
};

export default function DuesPageContent() {
  const [addOpen, setAddOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Partial<TransactionFormData>>();

  const handleAddSubmit = () => {
    // TODO: API 연동
  };

  const handleEditSubmit = () => {
    // TODO: API 연동
  };

  const handleDelete = () => {
    // TODO: API 연동
  };

  const openEdit = (transaction: TransactionDetail) => {
    setDetailOpen(false);
    setEditingTransaction({
      type: transaction.type,
      amount: transaction.amount,
      description: transaction.description,
      vendor: transaction.vendor,
      date: transaction.date,
      receiptFile: null,
    });
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
      <button
        type="button"
        onClick={() => setDetailOpen(true)}
        className="bg-container-neutral flex items-center justify-between rounded-md px-500 py-400 text-left"
      >
        <div className="flex flex-col gap-100">
          <span className="typo-sub3 text-text-normal">{MOCK_TRANSACTION.description}</span>
          <span className="typo-caption2 text-text-alternative">
            {MOCK_TRANSACTION.vendor} · {MOCK_TRANSACTION.date}
          </span>
        </div>
        <span className="typo-sub3 text-state-error">
          -{Number(MOCK_TRANSACTION.amount).toLocaleString()}원
        </span>
      </button>

      <AddTransactionModal open={addOpen} onOpenChange={setAddOpen} onSubmit={handleAddSubmit} />
      <TransactionDetailModal
        open={detailOpen}
        onOpenChange={setDetailOpen}
        transaction={MOCK_TRANSACTION}
        onEdit={() => openEdit(MOCK_TRANSACTION)}
        onDelete={handleDelete}
      />
      <EditTransactionModal
        open={editOpen}
        onOpenChange={setEditOpen}
        initialValues={editingTransaction}
        onSubmit={handleEditSubmit}
      />
    </div>
  );
}
