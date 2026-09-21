'use client';

import { useId, useRef, useState } from 'react';
import Image from 'next/image';

import DeleteIcon from '@/assets/icons/delete_forever.svg';
import { Button } from '@/components/ui/Button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

/** 팝오버 하단이 트리거(삭제 버튼) 하단에서 이만큼 위에 오도록 겹쳐 띄운다. */
const POPOVER_BOTTOM_GAP = 24;

interface PenaltyRecordDeletePopoverProps {
  disabled: boolean;
  onConfirm: () => void;
}

export function PenaltyRecordDeletePopover({
  disabled,
  onConfirm,
}: PenaltyRecordDeletePopoverProps) {
  const [open, setOpen] = useState(false);
  const [boundary, setBoundary] = useState<HTMLElement | null>(null);
  const [triggerHeight, setTriggerHeight] = useState(0);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const descriptionId = useId();
  const cancelRef = useRef<HTMLButtonElement>(null);

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        if (next) {
          setBoundary(
            triggerRef.current?.closest<HTMLElement>('[data-slot="dialog-content"]') ?? null,
          );
          setTriggerHeight(triggerRef.current?.offsetHeight ?? 0);
        }
        setOpen(next);
      }}
      modal
    >
      <PopoverTrigger asChild>
        <Button ref={triggerRef} variant="danger" size="sm" disabled={disabled}>
          삭제
        </Button>
      </PopoverTrigger>
      <PopoverContent
        role="alertdialog"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        side="top"
        align="end"
        sideOffset={POPOVER_BOTTOM_GAP - triggerHeight}
        collisionPadding={16}
        collisionBoundary={boundary ?? undefined}
        className="bg-background border-line w-[339px] max-w-[calc(100vw-32px)] gap-500 rounded-lg border p-400 whitespace-normal"
        style={{ boxShadow: 'var(--shadow-dialog)' }}
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          cancelRef.current?.focus();
        }}
      >
        <div className="flex flex-col items-center gap-400 py-100 text-center">
          <Image src={DeleteIcon} alt="" width={48} height={48} />
          <h2 id={titleId} className="typo-sub1 text-text-strong">
            기록을 삭제하시겠어요?
          </h2>
          <p id={descriptionId} className="sr-only">
            삭제한 페널티 기록은 복구할 수 없습니다.
          </p>
        </div>
        <div className="border-line flex gap-200 border-t pt-200">
          <Button
            ref={cancelRef}
            variant="secondary"
            size="lg"
            className="min-w-0 flex-1"
            onClick={() => setOpen(false)}
          >
            취소
          </Button>
          <Button
            variant="danger"
            size="lg"
            className="min-w-0 flex-1"
            onClick={() => {
              setOpen(false);
              onConfirm();
            }}
          >
            삭제
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}
