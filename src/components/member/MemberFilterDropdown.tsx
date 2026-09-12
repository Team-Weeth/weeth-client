'use client';

import { useState } from 'react';
import ArrowFillDownIcon from '@/assets/icons/arrow_fill_down.svg';
import { BottomSheet } from '@/components/ui/bottom-sheet/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Divider } from '@/components/ui/Divider';
import { Icon } from '@/components/ui/Icon';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import { MemberFilterChip } from './MemberFilterChip';

interface MemberFilterOption<T extends string> {
  value: T;
  label: string;
}

interface MemberFilterDropdownProps<T extends string> {
  label: string;
  options: MemberFilterOption<T>[];
  selected: T[];
  onApply: (values: T[]) => void;
  className?: string;
}

function MemberFilterDropdown<T extends string>({
  label,
  options,
  selected,
  onApply,
  className,
}: MemberFilterDropdownProps<T>) {
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<T[]>(selected);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setDraft(selected);
    }
    setOpen(nextOpen);
  };

  const toggleDraftValue = (value: T) => {
    setDraft((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const handleReset = () => {
    setDraft([]);
  };

  const handleApply = () => {
    onApply(draft);
    setOpen(false);
  };

  const isDraftUnchanged =
    draft.length === selected.length && draft.every((value) => selected.includes(value));

  const firstSelectedLabel = options.find((option) => option.value === selected[0])?.label;
  const triggerLabel =
    selected.length === 0
      ? label
      : selected.length === 1
        ? firstSelectedLabel
        : `${firstSelectedLabel} 외 ${selected.length - 1}`;

  const triggerButton = (
    <button
      type="button"
      onClick={isMobile ? () => handleOpenChange(true) : undefined}
      className={cn(
        'bg-container-neutral typo-button2 text-text-strong group flex cursor-pointer items-center justify-center gap-100 rounded-sm border px-300 py-200 hover:border-neutral-800',
        selected.length > 0 || open ? 'text-brand-primary' : 'border-line',
        className,
      )}
    >
      {triggerLabel}
      <Icon
        src={ArrowFillDownIcon}
        size={20}
        className={cn('text-icon-normal transition-transform duration-200', open && 'rotate-180')}
      />
    </button>
  );

  const optionChips = (
    <div className="flex flex-wrap content-start items-start gap-200">
      {options.map((option) => (
        <MemberFilterChip
          key={option.value}
          selected={draft.includes(option.value)}
          onClick={() => toggleDraftValue(option.value)}
        >
          {option.label}
        </MemberFilterChip>
      ))}
    </div>
  );

  if (isMobile) {
    return (
      <>
        {triggerButton}
        <BottomSheet
          open={open}
          onOpenChange={handleOpenChange}
          title={label}
          header={<p className="typo-sub1 text-text-strong text-center">{label}</p>}
          footer={
            <div className="flex gap-200">
              <Button variant="secondary" size="lg" className="w-[115px]" onClick={handleReset}>
                초기화
              </Button>
              <Button
                variant="primary"
                size="lg"
                className="flex-1"
                disabled={isDraftUnchanged}
                onClick={handleApply}
              >
                확인
              </Button>
            </div>
          }
        >
          <div className="h-[280px]">{optionChips}</div>
        </BottomSheet>
      </>
    );
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>{triggerButton}</PopoverTrigger>
      <PopoverContent>
        <div className="min-h-[160px] p-400">{optionChips}</div>
        <Divider className="mx-400 w-auto" />
        <div className="flex gap-2 px-400 pt-[10px] pb-400">
          <Button variant="secondary" size="lg" className="w-[86px]" onClick={handleReset}>
            초기화
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={isDraftUnchanged}
            onClick={handleApply}
          >
            적용
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export { MemberFilterDropdown, type MemberFilterDropdownProps, type MemberFilterOption };
