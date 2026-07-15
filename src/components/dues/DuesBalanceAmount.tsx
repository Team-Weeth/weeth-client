import { formatAmount } from '@/lib/formatAmount';

interface DuesBalanceAmountProps {
  currentBalance: number;
}

function DuesBalanceAmount({ currentBalance }: DuesBalanceAmountProps) {
  return (
    <div className="flex items-end gap-200">
      <strong className="text-text-strong typo-h3">{formatAmount(currentBalance)}원</strong>
    </div>
  );
}

export { DuesBalanceAmount, type DuesBalanceAmountProps };
