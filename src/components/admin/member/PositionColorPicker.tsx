'use client';

import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import CheckIcon from '@/assets/icons/check.svg';
import DisabledIcon from '@/assets/icons/admin/ic_admin_disabled.svg';
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
  mobile = false,
  value,
  onChange,
  label,
  disabled,
  usedColors,
}: {
  mobile?: boolean;
  value: MemberPositionColor;
  onChange: (value: MemberPositionColor) => void;
  label: string;
  disabled: boolean;
  usedColors: MemberPositionColor[];
}) {
  const selected = POSITION_COLORS.find((color) => color.value === value)!;
  return (
    <DropdownMenu type="position">
      <DropdownMenuTrigger
        className={cn(
          'data-[state=open]:border-icon-normal',
          mobile && 'h-10 w-[58px] gap-100 px-200 py-0',
        )}
        disabled={disabled}
        aria-label={`${label}: ${selected.label}`}
      >
        <span className={cn('size-[18px] shrink-0 rounded-full', selected.className)} />
        <Icon src={ArrowDownIcon} size={20} />
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label={label} align="start" sideOffset={4} className="shadow-md">
        {POSITION_COLORS.map((color) => {
          const isSelected = color.value === value;
          const unavailable = !isSelected && usedColors.includes(color.value);
          return (
            <DropdownMenuItem
              key={color.value}
              aria-label={color.label}
              aria-current={isSelected ? 'true' : undefined}
              disabled={unavailable}
              className="hover:bg-container-neutral-alternative focus:bg-container-neutral-alternative active:bg-container-neutral-alternative data-[highlighted]:bg-container-neutral-alternative data-[disabled]:bg-container-neutral data-[disabled]:cursor-default data-[disabled]:opacity-100"
              onSelect={() => onChange(color.value)}
            >
              <span
                aria-hidden
                className={cn(
                  'relative flex shrink-0 items-center justify-center overflow-hidden rounded-full',
                  isSelected ? 'size-8' : 'size-6',
                  unavailable && 'cursor-not-allowed',
                )}
              >
                <span
                  className={cn(
                    'absolute inset-0 rounded-full',
                    color.className,
                    unavailable && 'opacity-30',
                  )}
                />
                {isSelected && (
                  <span className="absolute inset-[2px] flex items-center justify-center rounded-full border border-white">
                    <Icon src={CheckIcon} size={16} className="text-white" />
                  </span>
                )}
                {unavailable && (
                  <Icon src={DisabledIcon} size={18} className="relative text-white" />
                )}
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
