'use client';

import { useState, type ReactNode } from 'react';

import { AdminCheckboxIcon, AdminCloseIcon, AdminUncheckboxIcon } from '@/assets/icons/admin';
import { Button, Icon, SuffixInput } from '@/components/ui';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface AddCardinalModalProps {
  children: ReactNode;
  onSubmit?: (data: { cardinal: number; isCurrent: boolean }) => void;
}

function AddCardinalModal({ children, onSubmit }: AddCardinalModalProps) {
  const [open, setOpen] = useState(false);
  const [cardinal, setCardinal] = useState('');
  const [isCurrent, setIsCurrent] = useState(false);

  const resetForm = () => {
    setCardinal('');
    setIsCurrent(false);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) resetForm();
  };

  const isValid = cardinal !== '';

  const handleSubmit = () => {
    if (!isValid) return;
    onSubmit?.({
      cardinal: Number(cardinal),
      isCurrent,
    });
    handleOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        adminMobileFullscreen={false}
        className="bg-container-neutral max-tablet:w-[320px] flex w-[440px] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden rounded-lg p-0"
      >
        <div className="flex items-center justify-between px-500 py-400">
          <DialogTitle className="typo-sub1 text-text-strong">새로운 기수 추가</DialogTitle>
          <button
            type="button"
            onClick={() => handleOpenChange(false)}
            className="flex cursor-pointer items-center justify-center rounded-sm p-200"
            aria-label="닫기"
          >
            <Icon src={AdminCloseIcon} size={24} className="text-icon-normal" alt="닫기버튼" />
          </button>
        </div>

        <div className="flex flex-col gap-300 px-500 pb-600">
          <p className="typo-body1 text-text-normal">추가할 새로운 기수를 작성해주세요</p>
          <SuffixInput
            suffix="기"
            aria-label="기수"
            type="number"
            inputMode="numeric"
            value={cardinal}
            onChange={(e) => {
              const v = e.target.value.replace(/\D/g, '');
              if (v === '' || Number(v) > 0) setCardinal(v);
            }}
          />

          <div className="flex items-center justify-between pt-400">
            <button
              aria-pressed={isCurrent}
              aria-label="현재 진행 중 여부 토글"
              type="button"
              className="flex cursor-pointer items-center gap-200"
              onClick={() => setIsCurrent(!isCurrent)}
            >
              <Icon
                src={isCurrent ? AdminCheckboxIcon : AdminUncheckboxIcon}
                alt={isCurrent ? '선택됨' : '선택 안됨'}
                size={24}
                className={!isCurrent ? 'text-icon-disabled' : undefined}
              />
              <span className="typo-body1 text-text-normal">현재 진행 중</span>
            </button>
            <Button
              variant="primary"
              size="md"
              className="rounded-md px-400"
              disabled={!isValid}
              onClick={handleSubmit}
            >
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { AddCardinalModal, type AddCardinalModalProps };
