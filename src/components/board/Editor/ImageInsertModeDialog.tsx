'use client';

import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { X } from 'lucide-react';

interface ImageInsertModeDialogProps {
  open: boolean;
  onIndividual: () => void;
  onGroup: () => void;
  onCancel: () => void;
}

function ImageInsertModeDialog({
  open,
  onIndividual,
  onGroup,
  onCancel,
}: ImageInsertModeDialogProps) {
  return (
    <AlertDialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) onCancel();
      }}
    >
      <AlertDialogContent className="w-[420px] p-700 pb-600">
        {/* 닫기 버튼 */}
        <button
          type="button"
          aria-label="닫기"
          onClick={onCancel}
          className="text-icon-alternative hover:text-icon-normal absolute top-400 right-400 transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col gap-700">
          {/* 헤더 */}
          <div className="flex flex-col items-center gap-200">
            <AlertDialogTitle className="text-center">사진 첨부 방식</AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              이미지를 첨부할 레이아웃을 선택할 수 있어요.
            </AlertDialogDescription>
          </div>

          {/* 옵션 카드 */}
          <div className="flex gap-400">
            <InsertOptionCard label="개별 이미지" onClick={onIndividual}>
              {/* 세로로 쌓인 이미지 */}
              <div className="flex w-full flex-col gap-100">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-container-neutral-alternative h-200 w-full rounded-sm" />
                ))}
              </div>
            </InsertOptionCard>
            <InsertOptionCard label="한 줄 이미지" onClick={onGroup}>
              {/* 가로로 나란한 이미지 */}
              <div className="flex w-full gap-100">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="bg-container-neutral-alternative h-700 flex-1 rounded-sm" />
                ))}
              </div>
            </InsertOptionCard>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

interface InsertOptionCardProps {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}

function InsertOptionCard({ label, onClick, children }: InsertOptionCardProps) {
  return (
    <button
      type="button"
      className="border-line flex flex-1 cursor-pointer flex-col items-center gap-300 rounded-md border p-500 transition-all hover:border-brand-primary hover:shadow-sm"
      onClick={onClick}
    >
      {children}
      <span className="typo-button2 text-text-strong">{label}</span>
    </button>
  );
}

export { ImageInsertModeDialog };
