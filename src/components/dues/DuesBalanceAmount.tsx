import { formatAmount } from '@/lib/formatAmount';

interface DuesBalanceAmountProps {
  currentBalance: number;
  targetBalance: number;
}

function DuesBalanceAmount({ currentBalance, targetBalance }: DuesBalanceAmountProps) {
  return (
    <div className="flex items-end gap-200">
      <strong className="text-text-strong typo-h3">{formatAmount(currentBalance)}원</strong>
      <span className="typo-caption2 text-text-alternative pb-100">
        / {formatAmount(targetBalance)}
      </span>
    </div>
  );
}

export { DuesBalanceAmount, type DuesBalanceAmountProps };
