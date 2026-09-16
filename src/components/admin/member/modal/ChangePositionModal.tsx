'use client';

import { useState } from 'react';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { MOCK_MEMBER_POSITIONS } from '@/mocks/memberPositions';
import { cn } from '@/lib/cn';

interface ChangePositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberCount: number;
  memberName?: string;
  onSubmit: (positionId: string) => void;
}

export function ChangePositionModal(props: ChangePositionModalProps) {
  // 닫으면 선택 초안을 버리고 다음 진입 시 새로 선택합니다.
  return props.open ? <PositionSelectionDialog {...props} /> : null;
}

function PositionSelectionDialog({
  open,
  onOpenChange,
  memberCount,
  memberName,
  onSubmit,
}: ChangePositionModalProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = MOCK_MEMBER_POSITIONS.find((option) => option.id === selectedId);
  const close = () => onOpenChange(false);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background border-line max-tablet:h-dvh max-tablet:max-h-dvh max-tablet:rounded-none max-tablet:border-0 flex h-[636px] w-full max-w-[672px] grid-rows-none flex-col gap-0 overflow-hidden rounded-[20px] border p-0"
      >
        <div className="max-tablet:px-400 max-tablet:pt-500 max-tablet:pb-400 flex items-start justify-between gap-400 px-700 pt-700 pb-600">
          <div className="flex flex-col gap-200">
            <p className="typo-sub3 text-text-alternative">
              {memberCount === 1 && memberName
                ? `'${memberName}'의 포지션을 선택하세요`
                : `${memberCount}명의 포지션을 일괄 변경합니다.`}
            </p>
            <DialogTitle className="typo-h2 text-text-strong">포지션 변경</DialogTitle>
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="닫기"
            className="flex cursor-pointer items-center justify-center rounded-sm p-100"
          >
            <Icon src={AdminCloseIcon} size={24} className="text-icon-normal" />
          </button>
        </div>
        <div className="max-tablet:px-400 min-h-0 flex-1 overflow-y-auto px-700">
          <div
            className="max-tablet:grid-cols-3 mt-100 grid grid-cols-5 gap-[5px]"
            role="group"
            aria-label="포지션 선택"
          >
            {MOCK_MEMBER_POSITIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                aria-pressed={selectedId === option.id}
                onClick={() => setSelectedId(option.id)}
                className={cn(
                  'typo-button2 flex min-w-0 cursor-pointer items-center justify-center rounded-[10px] px-200 py-200 transition-colors',
                  selectedId === option.id
                    ? 'bg-button-primary text-text-inverse'
                    : 'bg-button-neutral text-text-normal hover:bg-button-neutral-interaction',
                )}
              >
                {option.name}
              </button>
            ))}
          </div>
        </div>
        <div className="bg-background max-tablet:px-400 max-tablet:pb-[calc(var(--safe-area-inset-bottom,0px)+16px)] flex shrink-0 flex-col gap-400 px-700 pt-300 pb-600">
          <div className="bg-line h-px" aria-hidden />
          <div className="flex min-h-8 items-center gap-400 px-300">
            <span className="typo-sub3 text-text-alternative shrink-0">선택됨</span>
            {selected && (
              <span className="bg-button-primary-subtle text-brand-primary typo-button2 inline-flex h-8 items-center rounded-sm px-300">
                {selected.name}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-200">
            <Button variant="secondary" size="lg" onClick={close}>
              취소
            </Button>
            <Button
              size="lg"
              disabled={!selected || memberCount === 0}
              onClick={() => {
                if (!selected || memberCount === 0) return;
                onSubmit(selected.id);
                close();
              }}
            >
              저장
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
