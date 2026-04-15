'use client';

import { useState, type ReactNode } from 'react';

import { AdminCheckboxIcon, AdminUncheckboxIcon } from '@/assets/icons/admin';
import { Button, Icon, Input } from '@/components/ui';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';

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

      <DialogContent className="bg-background w-97.5 min-w-90 p-700">
        <DialogHeader title="새로운 기수 추가" />

        <DialogBody className="gap-400 py-0">
          {/* 기수 입력 */}
          <div className="flex flex-col">
            <p className="typo-sub2 text-text-normal bg-background py-300">
              추가할 새로운 기수를 작성해주세요
            </p>
            <div className="relative">
              <Input
                aria-label="기수"
                type="number"
                min={1}
                value={cardinal}
                onChange={(e) => {
                  const v = (e.target as HTMLInputElement).value;
                  if (v === '' || Number(v) > 0) setCardinal(v);
                }}
                className="pr-10"
                placeholder=" "
              />
              <span className="typo-body2 text-text-alternative pointer-events-none absolute top-1/2 right-400 -translate-y-1/2">
                기
              </span>
            </div>
          </div>
        </DialogBody>

        <DialogFooter>
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
              />
              <span className="typo-button2 text-text-normal">현재 진행 중</span>
            </button>
            <Button variant="secondary" size="lg" disabled={!isValid} onClick={handleSubmit}>
              저장
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { AddCardinalModal, type AddCardinalModalProps };
