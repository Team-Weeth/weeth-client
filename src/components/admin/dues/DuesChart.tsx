'use client';

import { Bar, BarChart, Cell, LabelList, XAxis } from 'recharts';
import type { LabelProps } from 'recharts';
import { Card, ChartContainer, type ChartConfig } from '@/components/ui';
import { cn } from '@/lib/cn';

interface MonthlyData {
  month: string;
  amount: number;
}

interface DuesChartProps {
  className?: string;
  data: MonthlyData[];
  activeMonth: string;
  onMonthChange?: (month: string) => void;
  periodStart: string;
  periodEnd: string;
  activeExpense: number;
  activeIncome: number;
}

const chartConfig = {} satisfies ChartConfig;

function formatAmount(amount: number) {
  return amount.toLocaleString('ko-KR');
}

interface BarLabelProps extends LabelProps {
  data: MonthlyData[];
  activeMonth: string;
}

function BarLabel({ x, y, width, value, index, data, activeMonth }: BarLabelProps) {
  const item = data[index as number];
  if (!item) return null;

  const isActive = item.month === activeMonth;
  const label = Number(value) === 0 ? '0' : `${formatAmount(Number(value))}원`;

  return (
    <text
      x={Number(x) + Number(width) / 2}
      y={Number(y) - 6}
      textAnchor="middle"
      fontSize={12}
      fontWeight={isActive ? 600 : 400}
      fill={isActive ? 'var(--color-brand-primary)' : 'var(--color-text-alternative)'}
    >
      {label}
    </text>
  );
}

function DuesChart({
  className,
  data,
  activeMonth,
  onMonthChange,
  periodStart,
  periodEnd,
  activeExpense,
  activeIncome,
}: DuesChartProps) {
  const activeData = data.find((d) => d.month === activeMonth);
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <Card className={cn('flex flex-col gap-500 p-400 tablet:p-600', className)}>
      <div className="flex items-start justify-between gap-400">
        <div className="flex flex-col gap-100">
          <span className="typo-sub3 text-text-strong">월별 잔액 추이</span>
          <span className="typo-caption2 text-text-alternative">
            {periodStart} - {periodEnd}
          </span>
        </div>

        <div
          className="bg-container-neutral rounded-md shrink-0 overflow-hidden"
          style={{ boxShadow: '0px 1px 5px 0px rgba(17,33,49,0.15)', minWidth: 180 }}
        >
          <div className="flex items-center justify-between gap-300 px-300 py-200">
            <span className="typo-caption2 text-text-normal">{activeMonth}</span>
            <span className="typo-sub3 text-text-strong">{formatAmount(activeData?.amount ?? 0)} 원</span>
          </div>
          <div className="border-line border-t" />
          <div className="flex items-center justify-between px-300 py-100">
            <span className="typo-caption2 text-text-alternative">지출</span>
            <span className="typo-caption2 text-state-error">-{formatAmount(activeExpense)} 원</span>
          </div>
          <div className="flex items-center justify-between px-300 py-100">
            <span className="typo-caption2 text-text-alternative">수입</span>
            <span className="typo-caption2 text-state-success">+{formatAmount(activeIncome)} 원</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-100">
        <span className="typo-caption2 text-text-disabled">{formatAmount(maxAmount)}원</span>

        <ChartContainer config={chartConfig} className="h-[260px] w-full">
          <BarChart
            data={data}
            margin={{ top: 24, right: 0, bottom: 0, left: 0 }}
            maxBarSize={46}
            barCategoryGap="20%"
            onClick={(payload: unknown) => {
              const month = (payload as { activePayload?: { payload: MonthlyData }[] } | null)?.activePayload?.[0]?.payload?.month;
              if (month) onMonthChange?.(month);
            }}
          >
            <XAxis
              dataKey="month"
              axisLine={{ stroke: 'var(--color-line)' }}
              tickLine={false}
              tick={{ fontSize: 13, fill: 'var(--color-text-alternative)' }}
              dy={8}
            />
            <Bar dataKey="amount" radius={[8, 8, 0, 0]} cursor="pointer" isAnimationActive={false}>
              {data.map((item) => (
                <Cell
                  key={item.month}
                  fill={
                    item.month === activeMonth
                      ? 'var(--color-brand-primary)'
                      : 'var(--color-container-neutral-alternative)'
                  }
                />
              ))}
              <LabelList
                dataKey="amount"
                content={(props: LabelProps) => (
                  <BarLabel {...props} data={data} activeMonth={activeMonth} />
                )}
              />
            </Bar>
          </BarChart>
        </ChartContainer>
      </div>
    </Card>
  );
}

export { DuesChart, type DuesChartProps, type MonthlyData };
