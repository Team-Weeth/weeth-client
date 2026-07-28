import { DotIcon, InfoCircleIcon, Penalty2Icon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface DuesPaymentStatusBannerProps {
  targeted: boolean;
  isPaid: boolean;
  className?: string;
}

function DuesPaymentStatusBanner({ targeted, isPaid, className }: DuesPaymentStatusBannerProps) {
  return (
    <div
      className={cn(
        'typo-sub1 flex items-center gap-300 rounded-md px-400 py-300',
        targeted
          ? 'bg-button-neutral text-text-alternative'
          : isPaid
            ? 'bg-container-primary-alternative text-brand-primary'
            : 'bg-state-error/10 text-state-error',
        className,
      )}
    >
      <Icon src={targeted ? InfoCircleIcon : isPaid ? DotIcon : Penalty2Icon} size={20} />
      <span className="typo-sub3">
        {targeted
          ? '이번 기수 회비 납부 대상이 아니에요'
          : isPaid
            ? '나의 회비 납부 완료'
            : '나의 회비가 아직 납부되지 않았어요'}
      </span>
    </div>
  );
}

export { DuesPaymentStatusBanner, type DuesPaymentStatusBannerProps };
