'use client';

import DotIcon from '@/assets/icons/dot.svg';
import { DuesAccountCard } from '@/components/dues/DuesAccountCard';
import { DuesAmountCard } from '@/components/dues/DuesAmountCard';
import { DuesBalanceCard } from '@/components/dues/DuesBalanceCard';
import { DuesPaymentButton } from '@/components/dues/DuesPaymentButton';
import { DuesPaymentStatusBanner } from '@/components/dues/DuesPaymentStatusBanner';
import { Icon } from '@/components/ui/Icon';
import { formatAmount } from '@/lib/formatAmount';
import { cn } from '@/lib/cn';
import type { DuesPaymentStatus, DuesSummary } from '@/types/dues';

interface DuesLeftSectionProps {
  dues: DuesSummary;
}

function DuesLeftSection({ dues }: DuesLeftSectionProps) {
  const publicAccount = dues.isAccountPublic ? dues.account : undefined;
  const paymentStatus = getDisplayPaymentStatus(dues);

  if (paymentStatus !== 'UNPAID') {
    return (
      <aside className="desktop:w-[374px] flex w-full flex-col gap-450">
        <DuesBalanceCard currentBalance={dues.currentBalance} compactTitle />

        {publicAccount ? (
          <DuesAccountCard account={publicAccount} variant="plain" showCopyButton />
        ) : (
          <div className="bg-container-neutral typo-body2 text-text-alternative rounded-lg p-450">
            회비 계좌는 운영진에게 문의해 주세요.
          </div>
        )}

        <DuesPaymentResultBadge status={paymentStatus} amount={dues.duesAmount} />
      </aside>
    );
  }

  return (
    <aside className="desktop:w-[374px] flex w-full flex-col gap-450">
      <DuesPaymentStatusBanner targeted={dues.isTargeted} isPaid={false} />
      <DuesAmountCard
        cardinalNumber={dues.cardinalNumber}
        amount={dues.duesAmount}
        title={dues.accountName}
      >
        {publicAccount ? (
          <>
            <DuesAccountCard account={publicAccount} />
            <div className="flex flex-col gap-200">
              <DuesPaymentButton account={publicAccount} targated={dues.isTargeted} />
              <p className="typo-caption2 text-text-alternative text-center">
                입금 후 운영진이 확인하면 &apos;납부 완료&apos;로 바뀌어요.
              </p>
            </div>
          </>
        ) : (
          <p className="typo-body2 text-text-alternative">회비 계좌는 운영진에게 문의해 주세요.</p>
        )}
      </DuesAmountCard>
      <DuesBalanceCard currentBalance={dues.currentBalance} />
    </aside>
  );
}

interface DuesPaymentResultBadgeProps {
  status: Exclude<DuesPaymentStatus, 'UNPAID'>;
  amount: number;
}

const PAYMENT_RESULT_CONFIG = {
  PAID: {
    label: '나의 회비 납부 완료',
    containerClassName: 'bg-container-primary-alternative',
    textClassName: 'text-brand-primary',
    showAmount: true,
  },
  REFUNDED: {
    label: '나의 회비 환불 완료',
    containerClassName: 'bg-container-secondary-alternative',
    textClassName: 'text-brand-secondary',
    showAmount: true,
  },
  EXCLUDED: {
    label: '이번 기수 회비 납부 대상이 아니에요',
    containerClassName: 'bg-container-neutral-alternative',
    textClassName: 'text-text-alternative',
    showAmount: false,
  },
} satisfies Record<
  Exclude<DuesPaymentStatus, 'UNPAID'>,
  {
    label: string;
    containerClassName: string;
    textClassName: string;
    showAmount: boolean;
  }
>;

function DuesPaymentResultBadge({ status, amount }: DuesPaymentResultBadgeProps) {
  const config = PAYMENT_RESULT_CONFIG[status];

  return (
    <div
      className={cn(
        'flex items-center justify-between rounded-md px-400 py-300',
        config.containerClassName,
      )}
    >
      <span className={cn('typo-sub3 flex items-center gap-200', config.textClassName)}>
        <Icon src={DotIcon} size={4} className={config.textClassName} />
        {config.label}
      </span>
      {config.showAmount && (
        <span className="typo-sub3 text-text-alternative">{formatAmount(amount)}원</span>
      )}
    </div>
  );
}

function getDisplayPaymentStatus(dues: DuesSummary): DuesPaymentStatus {
  if (isPaymentResultStatus(dues.paymentStatus) || dues.paymentStatus === 'UNPAID') {
    return dues.paymentStatus;
  }

  return dues.isPaid ? 'PAID' : 'UNPAID';
}

function isPaymentResultStatus(
  status: DuesPaymentStatus,
): status is Exclude<DuesPaymentStatus, 'UNPAID'> {
  return status in PAYMENT_RESULT_CONFIG;
}

export { DuesLeftSection, type DuesLeftSectionProps };
