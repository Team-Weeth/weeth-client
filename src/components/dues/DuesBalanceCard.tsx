import { formatAmount } from '@/lib/formatAmount';
import { cn } from '@/lib/cn';

interface DuesBalanceCardProps {
  currentBalance: number;
  targetBalance: number;
  compactTitle?: boolean;
  className?: string;
}

function DuesBalanceCard({
  currentBalance,
  targetBalance,
  compactTitle = false,
  className,
}: DuesBalanceCardProps) {
  return (
    <section className={cn('bg-container-neutral rounded-lg p-450', className)}>
      <div className="flex flex-col gap-200">
        <span
          className={cn(
            compactTitle ? 'typo-sub1 text-text-normal' : 'typo-caption1 text-text-alternative',
          )}
        >
          현재 남은 금액{compactTitle ? '은' : ''}
        </span>
        <div className="flex items-end gap-200">
          <strong className="text-text-strong typo-h3">{formatAmount(currentBalance)}원</strong>
          <span className="typo-caption2 text-text-alternative pb-100">
            / {formatAmount(targetBalance)}
          </span>
        </div>
      </div>
    </section>
  );
}

export { DuesBalanceCard, type DuesBalanceCardProps };
