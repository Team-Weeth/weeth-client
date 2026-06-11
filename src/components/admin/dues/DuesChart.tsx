'use client';

import { Bar, BarChart, Cell, LabelList, Tooltip as RechartsTooltip, XAxis } from 'recharts';
import type { LabelProps } from 'recharts';
import { cn } from '@/lib/cn';
import { formatAmount } from '@/lib/formatAmount';
import { QuestionCircleIcon } from '@/assets/icons';
import type { MonthlyData } from '@/types/admin/dues';
import {
  Icon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Card,
  ChartContainer,
  type ChartConfig,
} from '@/components/ui';

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
    <Card className={cn('tablet:p-600 min-[360px] flex flex-1 flex-col gap-500 p-400', className)}>
      <div className="flex items-start justify-between gap-400">
        <div className="flex flex-col gap-100">
          <span className="typo-h3 text-text-strong">월별 잔액 추이</span>
          <div className="flex flex-row items-center gap-1">
            <span className="typo-caption2 text-text-alternative">
              {periodStart} - {periodEnd}
            </span>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Icon
                    src={QuestionCircleIcon}
                    size={24}
                    className="text-icon-alternative flex self-center"
                  />
                </TooltipTrigger>
                <TooltipContent>
                  총 회비를 처음 등록한 월부터 현재 월까지 표시됩니다.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        <div
          className="bg-container-neutral shrink-0 overflow-hidden rounded-md"
          style={{ boxShadow: '0px 1px 5px 0px rgba(17,33,49,0.15)', minWidth: 180 }}
        >
          <div className="flex items-center justify-between gap-300 px-300 py-200">
            <span className="typo-caption2 text-text-normal">{activeMonth}</span>
            <span className="typo-sub3 text-text-strong">
              {formatAmount(activeData?.amount ?? 0)} 원
            </span>
          </div>
          <div className="border-line border-t" />
          <div className="flex items-center justify-between px-300 py-100">
            <span className="typo-caption2 text-text-alternative">지출</span>
            <span className="typo-caption2 text-state-error">
              -{formatAmount(activeExpense)} 원
            </span>
          </div>
          <div className="flex items-center justify-between px-300 py-100">
            <span className="typo-caption2 text-text-alternative">수입</span>
            <span className="typo-caption2 text-state-success">
              +{formatAmount(activeIncome)} 원
            </span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-100">
        <ChartContainer config={chartConfig} className="h-[260px] w-full [&_*:focus]:outline-none">
          <BarChart
            data={data}
            margin={{ top: 24, right: 0, bottom: 0, left: 0 }}
            maxBarSize={46}
            barCategoryGap="20%"
          >
            <RechartsTooltip content={() => null} cursor={false} />
            <XAxis
              dataKey="month"
              axisLine={{ stroke: 'var(--color-line)' }}
              tickLine={false}
              tick={{ fontSize: 13, fill: 'var(--color-text-alternative)' }}
              dy={8}
            />
            <Bar
              dataKey="amount"
              radius={[8, 8, 0, 0]}
              cursor="pointer"
              isAnimationActive={false}
              activeBar={false}
              onClick={(barData) => {
                const month = (barData as { payload?: MonthlyData } | undefined)?.payload?.month;
                if (month) onMonthChange?.(month);
              }}
            >
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
