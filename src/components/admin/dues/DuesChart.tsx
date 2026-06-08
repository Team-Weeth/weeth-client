import { Card } from '@/components/ui';
import { cn } from '@/lib/cn';

interface MonthlyData {
  month: string;
  amount: number;
}

interface DuesChartProps {
  className?: string;
  data: MonthlyData[];
  activeMonth: string;
  periodStart: string;
  periodEnd: string;
  activeExpense: number;
  activeIncome: number;
}

function formatAmount(amount: number) {
  return amount.toLocaleString('ko-KR');
}

function DuesChart({
  className,
  data,
  activeMonth,
  periodStart,
  periodEnd,
  activeExpense,
  activeIncome,
}: DuesChartProps) {
  const activeData = data.find((d) => d.month === activeMonth);
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);
  const CHART_HEIGHT = 180;

  return (
    <Card className={cn('flex flex-col gap-500 p-400 tablet:p-600', className)}>
      <div className="flex items-start justify-between gap-400">
        <div className="flex flex-col gap-100">
          <span className="typo-sub3 text-text-strong">월별 잔액 추이</span>
          <span className="typo-caption2 text-text-alternative">
            {periodStart} - {periodEnd}
          </span>
        </div>

        <div className="flex flex-col items-end gap-100">
          <span className="typo-sub3 text-text-strong">
            {activeMonth} &nbsp;{formatAmount(activeData?.amount ?? 0)} 원
          </span>
          <span className="typo-caption2 text-state-error">
            지출 &nbsp;-{formatAmount(activeExpense)} 원
          </span>
          <span className="typo-caption2 text-brand-secondary">
            수입 &nbsp;+{formatAmount(activeIncome)} 원
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-200">
        {/* Y axis label */}
        <span className="typo-caption2 text-text-disabled">
          {formatAmount(maxAmount)}원
        </span>

        {/* Bars */}
        <div className="flex items-end gap-300" style={{ height: CHART_HEIGHT }}>
          {data.map((item) => {
            const isActive = item.month === activeMonth;
            const barHeight = item.amount > 0 ? Math.max((item.amount / maxAmount) * CHART_HEIGHT, 4) : 0;

            return (
              <div key={item.month} className="flex flex-1 flex-col items-center gap-200">
                {isActive && item.amount > 0 && (
                  <span className="typo-caption2 text-brand-primary whitespace-nowrap">
                    {formatAmount(item.amount)}원
                  </span>
                )}
                <div
                  className="flex w-full flex-col justify-end"
                  style={{ height: CHART_HEIGHT - 20 }}
                >
                  <div
                    style={{ height: barHeight }}
                    className={cn(
                      'w-full rounded-t-sm',
                      isActive ? 'bg-brand-primary' : 'bg-container-neutral-alternative',
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* X axis labels */}
        <div className="flex gap-300">
          {data.map((item) => (
            <div key={item.month} className="flex flex-1 justify-center">
              <span
                className={cn(
                  'typo-caption2',
                  item.month === activeMonth ? 'text-brand-primary' : 'text-text-alternative',
                )}
              >
                {item.month}
              </span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export { DuesChart, type DuesChartProps, type MonthlyData };
