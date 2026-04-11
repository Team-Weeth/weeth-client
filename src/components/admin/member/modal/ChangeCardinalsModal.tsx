'use client';

import { useState, type ReactNode } from 'react';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { ModalFooter } from '@/components/mypage/SetCardinalModal/components/ModalFooter';
import { ModalHeader } from '@/components/mypage/SetCardinalModal/components/ModalHeader';
import {
  CardinalTags,
  Step2Select,
} from '@/components/mypage/SetCardinalModal/components/steps/Step2Select';
import { useCardinals } from '@/hooks/queries';

interface ChangeCardinalsModalProps {
  children: ReactNode;
  overline?: string;
  onSubmit?: (cardinalIds: number[]) => void;
}

function ChangeCardinalsModal({
  children,
  overline = '멤버 기수 변경',
  onSubmit,
}: ChangeCardinalsModalProps) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const { data: cardinalsData = [] } = useCardinals();
  const availableCardinals = cardinalsData.map((c) => c.cardinalNumber);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setSelected(new Set());
  };

  const handleClose = () => handleOpenChange(false);

  const handleToggle = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const selectedArray = [...selected].sort((a, b) => a - b);

  const handleSave = () => {
    if (selected.size === 0) return;
    onSubmit?.(selectedArray);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>

      <DialogContent
        showCloseButton={false}
        className="bg-container-neutral-alternative border-line flex h-120.25 w-full max-w-135 flex-col gap-0 rounded-lg p-0"
      >
        <ModalHeader
          overline={overline}
          title="활동한 기수를 모두 선택해주세요."
          onClose={handleClose}
        />
        <Step2Select
          availableCardinals={availableCardinals}
          selected={selected}
          onToggle={handleToggle}
        />
        <ModalFooter
          primaryLabel={`저장 (${selected.size}개 선택)`}
          secondaryLabel="취소"
          onPrimary={handleSave}
          onSecondary={handleClose}
          primaryDisabled={selected.size === 0}
        >
          {selected.size > 0 && (
            <div className="flex items-center gap-400 px-2.5 pt-200">
              <span className="typo-sub2 text-text-alternative shrink-0">선택됨</span>
              <CardinalTags cardinals={selectedArray} />
            </div>
          )}
        </ModalFooter>
      </DialogContent>
    </Dialog>
  );
}

export { ChangeCardinalsModal, type ChangeCardinalsModalProps };
