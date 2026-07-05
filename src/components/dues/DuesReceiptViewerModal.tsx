'use client';

import { useState } from 'react';

import { DeleteIcon, DownloadIcon, PaperclipIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { toastError } from '@/stores/useToastStore';
import type { DuesReceiptFile } from '@/types/dues';
import { isPdfReceipt } from '@/utils/dues/duesTransaction';
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
  const isPdf = activeReceipt ? isPdfReceipt(activeReceipt) : false;
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

          {isPdf ? (
            <PdfReceiptPreview receipt={activeReceipt} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={activeReceipt.fileUrl}
              alt={`영수증 원본 ${activeIndex + 1}`}
              className="max-h-full max-w-full object-contain"
            />
          )}

          {hasMultipleReceipts && (
            <DuesReceiptPageButton direction="next" onClick={handleNext} className="right-450" />
          )}
        </div>

        <footer className="h-20 shrink-0" aria-hidden="true" />
      </DialogContent>
    </Dialog>
  );
}

function PdfReceiptPreview({ receipt }: { receipt: DuesReceiptFile }) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;

    setIsDownloading(true);

    try {
      const response = await fetch(receipt.fileUrl);
      if (!response.ok) throw new Error('PDF 다운로드에 실패했습니다.');

      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const anchor = document.createElement('a');

      anchor.href = objectUrl;
      anchor.download = receipt.fileName;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(objectUrl);
    } catch {
      toastError('파일 다운로드에 실패했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="flex w-full max-w-[360px] flex-col items-center gap-400 text-center">
      <div className="bg-container-neutral-alternative flex size-20 items-center justify-center rounded-lg">
        <Icon src={PaperclipIcon} size={32} className="text-icon-alternative" />
      </div>

      <div className="flex w-full flex-col gap-100">
        <p className="typo-sub1 truncate text-white">{receipt.fileName}</p>
        <p className="typo-body2 text-white/70">
          PDF 영수증은 원본 파일로 열거나 다운로드할 수 있어요
        </p>
      </div>

      <div className="flex w-full gap-200">
        <a
          href={receipt.fileUrl}
          target="_blank"
          rel="noreferrer"
          className="typo-button2 bg-container-neutral text-text-normal hover:bg-container-neutral-interaction flex h-12 flex-1 items-center justify-center rounded-sm transition-colors"
        >
          새 탭에서 열기
        </a>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="typo-button2 bg-button-primary text-text-inverse hover:bg-button-primary-interaction disabled:bg-button-neutral disabled:text-text-disabled flex h-12 flex-1 cursor-pointer items-center justify-center gap-100 rounded-sm transition-colors disabled:cursor-not-allowed"
        >
          <Icon src={DownloadIcon} size={18} />
          {isDownloading ? '다운로드 중' : '다운로드'}
        </button>
      </div>
    </div>
  );
}

export { DuesReceiptViewerModal, type DuesReceiptViewerModalProps };
