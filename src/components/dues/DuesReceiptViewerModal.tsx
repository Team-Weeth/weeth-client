'use client';

import { useState } from 'react';

import { DeleteIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import type { DuesReceiptFile } from '@/types/dues';
import { DuesReceiptPageButton } from './DuesReceiptPageButton';

interface DuesReceiptViewerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  receiptFiles: DuesReceiptFile[];
}

function DuesReceiptViewerModal({ open, onOpenChange, receiptFiles }: DuesReceiptViewerModalProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const receiptCount = receiptFiles.length;
  const activeReceipt = receiptFiles[activeIndex];
  const hasMultipleReceipts = receiptCount > 1;

  const handlePrevious = () => {
    setActiveIndex((prevIndex) => (prevIndex === 0 ? receiptCount - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) => (prevIndex === receiptCount - 1 ? 0 : prevIndex + 1));
  };

  if (!activeReceipt) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        adminMobileFullscreen={false}
        overlayClassName="bg-transparent"
        className="max-tablet:h-[calc(100dvh-160px)] max-tablet:max-w-[calc(100%-36px)] flex h-[520px] max-h-[calc(100dvh-80px)] w-full max-w-[760px] flex-col gap-0 rounded-lg border-0 bg-neutral-800 p-0 text-white shadow-lg"
      >
        <div className="flex items-center justify-between p-450">
          <DialogTitle className="typo-sub1 text-white">
            {activeIndex + 1}/{receiptCount}
          </DialogTitle>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer p-100 text-white transition-opacity hover:opacity-70"
            aria-label="영수증 원본 닫기"
          >
            <Icon src={DeleteIcon} size={24} />
          </button>
        </div>

        <div className="relative flex min-h-0 flex-1 items-center justify-center px-450 py-450">
          {hasMultipleReceipts && (
            <DuesReceiptPageButton
              direction="previous"
              onClick={handlePrevious}
              className="left-450"
            />
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={activeReceipt.fileUrl}
            alt={`영수증 원본 ${activeIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />

          {hasMultipleReceipts && (
            <DuesReceiptPageButton direction="next" onClick={handleNext} className="right-450" />
          )}
        </div>

        <footer className="h-20 shrink-0" aria-hidden="true" />
      </DialogContent>
    </Dialog>
  );
}

export { DuesReceiptViewerModal, type DuesReceiptViewerModalProps };
