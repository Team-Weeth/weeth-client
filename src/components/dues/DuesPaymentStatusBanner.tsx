import { DotIcon, Penalty2Icon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface DuesPaymentStatusBannerProps {
  isPaid: boolean;
  className?: string;
}

function DuesPaymentStatusBanner({ isPaid, className }: DuesPaymentStatusBannerProps) {
  return (
    <div
      className={cn(
        'typo-sub1 flex items-center gap-300 rounded-md px-400 py-300',
        isPaid
          ? 'bg-container-primary-alternative text-brand-primary'
          : 'bg-state-error/10 text-state-error',
        className,
      )}
    >
      <Icon src={isPaid ? DotIcon : Penalty2Icon} size={20} />
      <span className="typo-sub3">
        {isPaid ? '나의 회비 납부 완료' : '나의 회비가 아직 납부되지 않았어요'}
      </span>
    </div>
  );
}

export { DuesPaymentStatusBanner, type DuesPaymentStatusBannerProps };
