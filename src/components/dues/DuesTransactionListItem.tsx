import PinIcon from '@/assets/icons/pin.svg';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';
import type { DuesTransaction } from '@/types/dues';
import { DUES_TRANSACTION_TYPE_CONFIG } from '@/utils/dues/duesTransaction';
import { formatCompactDateDisplay } from '@/utils/shared/date';
import { DuesTransactionTypeIcon } from './DuesTransactionTypeIcon';

interface DuesTransactionListItemProps {
  transaction: DuesTransaction;
  onClick?: () => void;
}

function DuesTransactionListItem({ transaction, onClick }: DuesTransactionListItemProps) {
  const isIncomeLike = transaction.type === 'income' || transaction.type === 'dues';
  const amountPrefix = DUES_TRANSACTION_TYPE_CONFIG[transaction.type].sign;
  const dateText = formatCompactDateDisplay(transaction.date);
  const descriptionText = [transaction.description, dateText].filter(Boolean).join(' · ');

  return (
    <button
      type="button"
      onClick={onClick}
      className="hover:bg-container-neutral-alternative flex w-full cursor-pointer items-center gap-400 rounded-md p-200 text-left transition-colors"
    >
      <DuesTransactionTypeIcon type={transaction.type} />

      <div className="flex min-w-0 flex-1 flex-col gap-100">
        <div className="flex items-center gap-100">
          {transaction.type === 'dues' && (
            <Icon src={PinIcon} size={16} className="text-icon-alternative" />
          )}
          <span className="typo-sub3 text-text-strong truncate">{transaction.title}</span>
        </div>
        {descriptionText && (
          <span className="typo-caption2 text-text-alternative truncate">{descriptionText}</span>
        )}
      </div>

      <span
        className={cn(
          'typo-sub3 shrink-0',
          isIncomeLike ? 'text-state-success' : 'text-text-strong',
        )}
      >
        {amountPrefix}
        {formatAmount(transaction.amount)}
      </span>
    </button>
  );
}

export { DuesTransactionListItem, type DuesTransactionListItemProps };
