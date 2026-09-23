import { Card } from '@/components/ui/card';
import { cn } from '@/lib/cn';

interface DuesPaymentStatCardProps {
  label: string;
  value: string;
  className?: string;
}

function DuesPaymentStatCard({ label, value, className }: DuesPaymentStatCardProps) {
  return (
    <Card
      className={cn('flex flex-1 flex-row items-center justify-between px-400 py-300', className)}
    >
      <div className="flex flex-col gap-100">
        <span className="typo-sub3 text-text-normal">{value}</span>
        <span className="typo-caption2 text-text-alternative">{label}</span>
      </div>
    </Card>
  );
}

export { DuesPaymentStatCard, type DuesPaymentStatCardProps };
