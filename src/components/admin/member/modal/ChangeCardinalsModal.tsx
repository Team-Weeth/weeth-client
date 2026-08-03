'use client';

import { useMemo, useState, type ReactNode } from 'react';

import { InfoCircleIcon } from '@/assets/icons';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { Button, DialogTitle, Icon } from '@/components/ui';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { useCardinals } from '@/hooks/queries';
import { cn } from '@/lib/cn';
import {
  getCommonCardinals,
  getPartialCardinals,
  isEveryCardinalSelected,
} from '@/utils/admin/cardinalSelectionUtils';

interface ChangeCardinalsModalProps {
  children?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  overline?: string;
  title?: string;
  memberCount?: number;
  memberCardinals?: number[][];
  onSubmit?: (cardinalIds: number[], cardinalNumbers: number[]) => void;
}

function ChangeCardinalsModal({
  children,
  open: controlledOpen,
  onOpenChange,
  overline = '멤버 기수 변경',
  title = '기수 변경',
  memberCount = 1,
  memberCardinals = [],
  onSubmit,
}: ChangeCardinalsModalProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [selected, setSelected] = useState<Set<number> | null>(null);
  const { data: cardinalsData = [] } = useCardinals();
  const availableCardinals = cardinalsData.map((c) => c.cardinalNumber).sort((a, b) => b - a);
  const open = controlledOpen ?? internalOpen;
  const initialSelected = useMemo(() => getCommonCardinals(memberCardinals), [memberCardinals]);
  const partialCardinals = useMemo(
    () => getPartialCardinals(memberCardinals, memberCount),
    [memberCardinals, memberCount],
  );
  const currentSelected = selected ?? new Set(initialSelected);
  const showPartialCardinalsGuide = memberCount > 1;

  const handleOpenChange = (next: boolean) => {
    onOpenChange?.(next);
    if (controlledOpen === undefined) setInternalOpen(next);
    if (!next) setSelected(null);
  };

  const handleClose = () => handleOpenChange(false);

  const handleToggle = (n: number) => {
    setSelected((prev) => {
      const next = new Set(prev ?? initialSelected);
      if (next.has(n)) next.delete(n);
      else next.add(n);
      return next;
    });
  };

  const handleSelectAll = () => {
    setSelected((prev) => {
      const nextSelected = prev ?? new Set(initialSelected);
      const isAllSelected = isEveryCardinalSelected(availableCardinals, nextSelected);
      return isAllSelected ? new Set() : new Set(availableCardinals);
    });
  };

  const selectedArray = [...currentSelected].sort((a, b) => b - a);

  const handleSave = () => {
    if (currentSelected.size === 0) return;
    const cardinalIds = cardinalsData
      .filter((c) => currentSelected.has(c.cardinalNumber))
      .map((c) => c.id);
    onSubmit?.(cardinalIds, selectedArray);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children && <DialogTrigger asChild>{children}</DialogTrigger>}

      <DialogContent
        showCloseButton={false}
        className="bg-background border-line max-tablet:h-dvh max-tablet:max-h-dvh max-tablet:rounded-none max-tablet:border-0 flex h-[636px] w-full max-w-[672px] grid-rows-none flex-col gap-0 rounded-[20px] border p-0"
      >
        <div className="max-tablet:px-400 max-tablet:pt-500 max-tablet:pb-400 flex items-start justify-between gap-400 px-700 pt-700 pb-600">
          <div className="flex flex-col gap-200">
            <p className="typo-sub3 text-text-alternative">{overline}</p>
            <DialogTitle className="typo-h2 text-text-strong">{title}</DialogTitle>
          </div>
          <button
            type="button"
            onClick={handleClose}
            aria-label="닫기"
            className="flex cursor-pointer items-center justify-center rounded-sm p-100"
          >
            <Icon src={AdminCloseIcon} size={24} className="text-icon-normal" />
          </button>
        </div>

        <div className="max-tablet:min-h-0 max-tablet:overflow-y-auto max-tablet:px-400 flex flex-1 flex-col px-700">
          {showPartialCardinalsGuide && (
            <div className="bg-container-neutral-alternative flex items-center gap-300 rounded-md p-300">
              <Icon src={InfoCircleIcon} size={24} className="text-icon-alternative shrink-0" />
              <p className="flex-1 leading-4">
                <span className="typo-caption1 text-text-normal">연한 항목</span>
                <span className="typo-caption2 text-text-alternative">
                  은 일부 멤버만 가진 기수예요. 선택하면 모두에게 추가되고,
                  <br />
                  그대로 두면 기존 상태가 유지됩니다.
                </span>
              </p>
            </div>
          )}

          <div
            className={cn(
              'max-tablet:grid-cols-3 grid grid-cols-5 gap-[5px]',
              showPartialCardinalsGuide ? 'mt-500' : 'mt-100',
            )}
          >
            <CardinalOption
              selected={isEveryCardinalSelected(availableCardinals, currentSelected)}
              onClick={handleSelectAll}
            >
              전체
            </CardinalOption>
            {availableCardinals.map((cardinal) => (
              <CardinalOption
                key={cardinal}
                selected={currentSelected.has(cardinal)}
                partial={partialCardinals.has(cardinal)}
                onClick={() => handleToggle(cardinal)}
              >
                {cardinal}기
              </CardinalOption>
            ))}
          </div>
        </div>

        <div className="bg-background max-tablet:px-400 max-tablet:pb-[calc(var(--safe-area-inset-bottom,0px)+16px)] flex shrink-0 flex-col gap-400 px-700 pt-300 pb-600">
          <div className="bg-line h-px" aria-hidden />

          <div className="flex min-h-8 items-center gap-400 px-300">
            <span className="typo-sub3 text-text-alternative shrink-0">선택됨</span>
            {selectedArray.length > 0 && <SelectedCardinalTags cardinals={selectedArray} />}
          </div>

          <div className="grid grid-cols-2 gap-200">
            <Button variant="secondary" size="lg" onClick={handleClose}>
              취소
            </Button>
            <Button size="lg" disabled={currentSelected.size === 0} onClick={handleSave}>
              저장 ({currentSelected.size}개 선택)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function CardinalOption({
  children,
  selected,
  partial,
  onClick,
}: {
  children: ReactNode;
  selected: boolean;
  partial?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'typo-button2 flex min-w-[40px] cursor-pointer items-center justify-center rounded-[10px] px-400 py-200 transition-colors',
        selected
          ? 'bg-button-primary text-text-inverse'
          : partial
            ? 'border-button-primary-subtle-interaction bg-button-primary-subtle text-brand-primary border'
            : 'bg-button-neutral text-text-normal hover:bg-button-neutral-interaction',
      )}
    >
      {children}
    </button>
  );
}

function SelectedCardinalTags({ cardinals }: { cardinals: number[] }) {
  return (
    <div className="flex flex-wrap gap-100">
      {cardinals.map((n) => (
        <span
          key={n}
          className="bg-button-primary-subtle text-brand-primary typo-button2 inline-flex h-8 items-center rounded-sm px-300"
        >
          {n}기
        </span>
      ))}
    </div>
  );
}

export { ChangeCardinalsModal, type ChangeCardinalsModalProps };
