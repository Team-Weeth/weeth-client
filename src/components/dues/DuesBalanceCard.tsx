import { cn } from '@/lib/cn';
import { DuesBalanceAmount } from './DuesBalanceAmount';

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
        <DuesBalanceAmount currentBalance={currentBalance} targetBalance={targetBalance} />
      </div>
    </section>
  );
}

export { DuesBalanceCard, type DuesBalanceCardProps };
