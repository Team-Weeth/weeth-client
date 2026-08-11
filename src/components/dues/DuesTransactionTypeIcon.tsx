import ArrowDecreaseIcon from '@/assets/icons/arrow_decrease.svg';
import ArrowIncreaseIcon from '@/assets/icons/arrow_increase.svg';
import NoneIcon from '@/assets/icons/none.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import type { DuesTransactionType } from '@/types/dues';

const TYPE_ICON_CONFIG = {
  dues: {
    icon: NoneIcon,
    className: 'bg-icon-alternative/10 text-icon-alternative',
    size: 24,
  },
  income: {
    icon: ArrowIncreaseIcon,
    className: 'bg-state-success/10 text-state-success',
    size: 14,
  },
  expense: {
    icon: ArrowDecreaseIcon,
    className: 'bg-state-error/10 text-state-error',
    size: 14,
  },
} satisfies Record<DuesTransactionType, { icon: typeof NoneIcon; className: string; size: number }>;

function DuesTransactionTypeIcon({ type }: { type: DuesTransactionType }) {
  const { icon, className, size } = TYPE_ICON_CONFIG[type];

  return (
    <span className={cn('flex size-12 shrink-0 items-center justify-center rounded-md', className)}>
      <Icon src={icon} size={size} />
    </span>
  );
}

export { DuesTransactionTypeIcon };
