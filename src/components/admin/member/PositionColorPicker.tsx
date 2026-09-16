'use client';

import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import CheckIcon from '@/assets/icons/check.svg';
import { Icon } from '@/components/ui/Icon';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/DropdownMenu';
import { POSITION_COLORS, type MemberPositionColor } from '@/constants/admin/memberPosition';
import { cn } from '@/lib/cn';

function PositionColorPicker({
  value,
  onChange,
  label,
  disabled,
  usedColors,
}: {
  value: MemberPositionColor;
  onChange: (value: MemberPositionColor) => void;
  label: string;
  disabled: boolean;
  usedColors: MemberPositionColor[];
}) {
  const selected = POSITION_COLORS.find((color) => color.value === value)!;
  return (
    <DropdownMenu type="position">
      <DropdownMenuTrigger disabled={disabled} aria-label={`${label}: ${selected.label}`}>
        <span className={cn('size-5 shrink-0 rounded-full', selected.className)} />
        <Icon src={ArrowDownIcon} size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label={label} align="start">
        {POSITION_COLORS.map((color) => {
          const isSelected = color.value === value;
          const unavailable = !isSelected && usedColors.includes(color.value);
          return (
            <DropdownMenuItem
              key={color.value}
              aria-label={color.label}
              aria-current={isSelected ? 'true' : undefined}
              disabled={unavailable}
              className="data-[disabled]:cursor-not-allowed"
              onSelect={() => onChange(color.value)}
            >
              <span
                aria-hidden
                className={cn(
                  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
                  color.className,
                  isSelected ? 'size-7 p-[2px]' : 'size-6',
                  unavailable && 'opacity-50',
                )}
              >
                {isSelected && (
                  <span className="flex size-full items-center justify-center rounded-full border-2 border-white">
                    <Icon src={CheckIcon} size={16} className="text-white" />
                  </span>
                )}
                {unavailable && <span className="absolute h-[2px] w-[140%] rotate-45 bg-white" />}
              </span>
              <span className="sr-only">
                {isSelected ? '선택됨' : unavailable ? '다른 옵션에서 사용 중' : color.label}
              </span>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { PositionColorPicker };
