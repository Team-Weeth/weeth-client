import { formatAmount } from '@/lib/formatAmount';
import { cn } from '@/lib/cn';

interface DuesAmountCardProps {
  cardinalNumber: number;
  amount: number;
  title?: string;
  children?: React.ReactNode;
  className?: string;
}

function DuesAmountCard({
  cardinalNumber,
  amount,
  title,
  children,
  className,
}: DuesAmountCardProps) {
  return (
    <section className={cn('bg-container-neutral flex flex-col rounded-lg p-450', className)}>
      <div className="flex flex-col gap-100">
        <span className="typo-caption1 text-text-alternative">
          {title ?? `${cardinalNumber}기 회비`}
        </span>
        <strong className="text-text-strong typo-h2">{formatAmount(amount)}원</strong>
      </div>
      {children && <div className="mt-300 flex flex-col gap-300">{children}</div>}
    </section>
  );
}

export { DuesAmountCard, type DuesAmountCardProps };
