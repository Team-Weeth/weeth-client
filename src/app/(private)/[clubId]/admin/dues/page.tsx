'use client';

import { useState } from 'react';

import { AdminPlusIcon } from '@/assets/icons/admin';
import { Button, Icon } from '@/components/ui';
import { AddTransactionModal } from '@/components/dues/modal/AddTransactionModal';
import type { TransactionFormData } from '@/components/dues/modal/AddTransactionModal';

export default function DuesPageContent() {
  const [modalOpen, setModalOpen] = useState(false);

  const handleSubmit = (data: TransactionFormData) => {
    // TODO: API 연동
    console.log(data);
    setModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-600 p-600">
      <div className="flex items-center justify-between">
        <h1 className="typo-h2 text-text-strong">거래내역</h1>
        <Button variant="primary" size="md" onClick={() => setModalOpen(true)} className="gap-200">
          <Icon src={AdminPlusIcon} size={16} alt="" className="text-icon-inverse" />
          거래내역 추가
        </Button>
      </div>

      <AddTransactionModal open={modalOpen} onOpenChange={setModalOpen} onSubmit={handleSubmit} />
    </div>
  );
}
