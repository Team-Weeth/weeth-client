import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';

function formatAmount(amount: number) {
  return amount.toLocaleString('ko-KR');
}

interface DuesPaymentSummaryCardProps {
  className?: string;
  totalCollected: number;
  totalTarget: number;
  onUpdatePayment?: () => void;
  onSetTotal?: () => void;
}

function DuesPaymentSummaryCard({
  className,
  totalCollected,
  totalTarget,
  onUpdatePayment,
  onSetTotal,
}: DuesPaymentSummaryCardProps) {
  const percentage = totalTarget > 0 ? Math.round((totalCollected / totalTarget) * 100) : 0;

  return (
    <Card
      className={cn(
        'flex min-w-[339px] flex-1 flex-col overflow-hidden p-400',
        className,
      )}
    >
      <p className="typo-h3 text-text-normal">총 수납액</p>

      <div className="mt-400 flex items-end gap-200">
        <span className="text-text-strong text-[36px] leading-[44px] font-bold tracking-[-0.18px]">
          {formatAmount(totalCollected)}원
        </span>
        <span className="typo-body2 text-text-alternative mb-100">
          /{formatAmount(totalTarget)}원
        </span>
      </div>

      <div className="mt-400 flex flex-wrap items-center gap-300">
        <button
          type="button"
          onClick={onUpdatePayment}
          className="bg-button-primary typo-button1 text-text-inverse hover:bg-button-primary-interaction cursor-pointer rounded-md px-400 py-300 transition-colors"
        >
          납부 현황 업데이트
        </button>
        <button
          type="button"
          onClick={onSetTotal}
          className="bg-button-neutral typo-button1 text-text-strong hover:bg-container-neutral-interaction cursor-pointer rounded-md px-400 py-300 transition-colors"
        >
          총 회비 설정
        </button>
      </div>

      <div className="mt-auto pt-500">
        <p className="typo-caption2 text-text-alternative mb-200">
          목표 금액의 {percentage}%가 납부되었어요.
        </p>
        <div className="bg-button-neutral h-[15px] overflow-hidden rounded-[4px]">
          <div
            className="from-brand-primary to-button-primary-interaction h-full rounded-[4px] bg-gradient-to-r transition-[width] duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    </Card>
  );
}

export { DuesPaymentSummaryCard, type DuesPaymentSummaryCardProps };
