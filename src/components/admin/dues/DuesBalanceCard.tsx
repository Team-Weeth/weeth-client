import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';
import { DuesStatusSection } from './DuesStatusSection';

interface DuesBalanceCardProps {
  className?: string;
  currentBalance: number;
  paidCount: number;
  totalCount: number;
  bankName: string;
  accountNumber: string;
  holderName: string;
  isAccountPublic: boolean;
  onAddTransaction?: () => void;
  onViewPaymentDetail?: () => void;
}

function DuesBalanceCard({
  className,
  currentBalance,
  paidCount,
  totalCount,
  bankName,
  accountNumber,
  holderName,
  isAccountPublic,
  onAddTransaction,
  onViewPaymentDetail,
}: DuesBalanceCardProps) {
  return (
    <Card className={cn('tablet:p-600 flex flex-col gap-400 p-400', className)}>
      <p className="typo-h3 text-text-strong">현재 남은 금액은</p>

      <div className="flex items-end gap-200">
        <span className="text-text-strong text-[36px] leading-[44px] font-bold tracking-[-0.18px]">
          {formatAmount(currentBalance)}원
        </span>
      </div>

      <div className="flex items-center gap-300">
        <button
          type="button"
          onClick={onAddTransaction}
          className="bg-button-primary typo-button1 text-text-inverse hover:bg-button-primary-interaction cursor-pointer rounded-md px-400 py-300"
        >
          내역 추가
        </button>
      </div>
      <DuesStatusSection
        className="mt-14"
        paidCount={paidCount}
        totalCount={totalCount}
        bankName={bankName}
        accountNumber={accountNumber}
        holderName={holderName}
        isAccountPublic={isAccountPublic}
        onViewPaymentDetail={onViewPaymentDetail}
      />
    </Card>
  );
}

export { DuesBalanceCard, type DuesBalanceCardProps };
