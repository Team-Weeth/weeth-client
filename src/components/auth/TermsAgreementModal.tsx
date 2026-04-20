'use client';

import { useState } from 'react';

import { TERMS_ITEMS } from '@/constants/login';

import { TermsDetailView } from './TermsDetailView';
import { TermsListView } from './TermsListView';

interface TermsAgreementModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAgree: () => void | Promise<void>;
}

function TermsAgreementModal({ open, onOpenChange, onAgree }: TermsAgreementModalProps) {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedTermId, setSelectedTermId] = useState<string | null>(null);

  const allChecked = TERMS_ITEMS.every((item) => checkedItems.has(item.id));
  const allRequiredChecked = TERMS_ITEMS.filter((item) => item.required).every((item) =>
    checkedItems.has(item.id),
  );

  const selectedTerm = TERMS_ITEMS.find((item) => item.id === selectedTermId);

  function handleToggleAll() {
    if (allChecked) {
      setCheckedItems(new Set());
    } else {
      setCheckedItems(new Set(TERMS_ITEMS.map((item) => item.id)));
    }
  }

  function handleToggleItem(id: string) {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function resetState() {
    setCheckedItems(new Set());
    setSelectedTermId(null);
  }

  async function handleAgree() {
    await onAgree();
    onOpenChange(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) resetState();
    onOpenChange(nextOpen);
  }

  return (
    <>
      <TermsListView
        checkedItems={checkedItems}
        onToggleItem={handleToggleItem}
        onToggleAll={handleToggleAll}
        onSelectTerm={setSelectedTermId}
        allChecked={allChecked}
        allRequiredChecked={allRequiredChecked}
        open={open}
        onOpenChange={handleOpenChange}
        onAgree={handleAgree}
      />
      {selectedTerm && (
        <TermsDetailView
          term={selectedTerm}
          onBack={() => setSelectedTermId(null)}
          open={!!selectedTermId}
          onOpenChange={(nextOpen) => {
            if (!nextOpen) setSelectedTermId(null);
          }}
        />
      )}
    </>
  );
}

export { TermsAgreementModal, type TermsAgreementModalProps };
