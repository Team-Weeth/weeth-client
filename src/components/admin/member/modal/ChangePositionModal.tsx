'use client';

import { useState } from 'react';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

interface ChangePositionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberCount: number;
  memberName?: string;
  options: readonly MemberPositionOption[];
  /** null이면 지정 해제 */
  onSubmit: (option: MemberPositionOption | null) => void;
}

/** 아직 아무것도 고르지 않은 상태(undefined)와 '지정 해제'(null)를 구분한다. */
type PositionSelection = MemberPositionOption | null | undefined;

export function ChangePositionModal(props: ChangePositionModalProps) {
  // 닫으면 선택 초안을 버리고 다음 진입 시 새로 선택합니다.
  return props.open ? <PositionSelectionDialog {...props} /> : null;
}

function PositionSelectionDialog({
  open,
  onOpenChange,
  memberCount,
  memberName,
  options,
  onSubmit,
}: ChangePositionModalProps) {
  const [selected, setSelected] = useState<PositionSelection>(undefined);
  const hasSelection = selected !== undefined;
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
            {options.map((option) => (
              <PositionChip
                key={option.id}
                label={option.name}
                pressed={selected?.id === option.id}
                onClick={() => setSelected(option)}
              />
            ))}
            {/* 목록 끝에서 포지션을 비우는 선택지. 고르면 positionOptionId를 null로 보낸다. */}
            <PositionChip
              label="지정 해제"
              pressed={selected === null}
              onClick={() => setSelected(null)}
            />
          </div>
        </div>
        {/* 다이얼로그와 같은 배경이라 따로 칠하지 않는다. 칠하면 하단 모서리 radius를 덮는다. */}
        <div className="max-tablet:px-400 max-tablet:pb-[calc(var(--safe-area-inset-bottom,0px)+16px)] flex shrink-0 flex-col gap-400 px-700 pt-300 pb-600">
          <div className="bg-line h-px" aria-hidden />
          <div className="flex min-h-8 items-center gap-400 px-300">
            <span className="typo-sub3 text-text-alternative shrink-0">선택됨</span>
            {hasSelection && (
              <span className="bg-button-primary-subtle text-brand-primary typo-button2 inline-flex h-8 items-center rounded-sm px-300">
                {selected?.name ?? '지정 해제'}
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-200">
            <Button variant="secondary" size="lg" onClick={close}>
              취소
            </Button>
            <Button
              size="lg"
              disabled={!hasSelection || memberCount === 0}
              onClick={() => {
                if (!hasSelection || memberCount === 0) return;
                onSubmit(selected ?? null);
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

function PositionChip({
  label,
  pressed,
  onClick,
}: {
  label: string;
  pressed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'typo-button2 flex min-w-0 cursor-pointer items-center justify-center rounded-[10px] px-200 py-200 transition-colors',
        pressed
          ? 'bg-button-primary text-text-inverse'
          : 'bg-button-neutral text-text-normal hover:bg-button-neutral-interaction',
      )}
    >
      {label}
    </button>
  );
}
