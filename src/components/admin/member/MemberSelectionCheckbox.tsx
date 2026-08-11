import type { MouseEvent } from 'react';

import AdminCheckboxIcon from '@/assets/icons/admin/ic_admin_checkbox.svg';
import AdminUncheckboxIcon from '@/assets/icons/admin/ic_admin_uncheckbox.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface MemberSelectionCheckboxProps {
  checked: boolean;
  partial?: boolean;
  className?: string;
  ariaLabel: string;
  checkedLabel?: string;
  uncheckedLabel?: string;
  checkedClassName?: string;
  uncheckedClassName?: string;
  onClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

function MemberSelectionCheckbox({
  checked,
  partial = false,
  className,
  ariaLabel,
  checkedLabel = '선택됨',
  uncheckedLabel = '선택 안됨',
  checkedClassName = 'text-brand-primary',
  uncheckedClassName = 'text-icon-alternative',
  onClick,
}: MemberSelectionCheckboxProps) {
  return (
    <button
      aria-pressed={partial ? 'mixed' : checked}
      aria-label={ariaLabel}
      type="button"
      className={cn('flex cursor-pointer items-center justify-center p-300', className)}
      onClick={onClick}
    >
      <span className="flex size-5 items-center justify-center">
        {partial ? (
          <span
            aria-hidden
            className="bg-brand-primary flex size-[18px] items-center justify-center rounded-[2px]"
          >
            <span className="bg-text-inverse h-0.5 w-2 rounded-full" />
          </span>
        ) : (
          <Icon
            src={checked ? AdminCheckboxIcon : AdminUncheckboxIcon}
            alt={checked ? checkedLabel : uncheckedLabel}
            size={20}
            className={cn(checked ? checkedClassName : uncheckedClassName)}
          />
        )}
      </span>
    </button>
  );
}

export { MemberSelectionCheckbox };
