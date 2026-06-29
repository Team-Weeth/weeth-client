'use client';

import { DotIcon } from '@/assets/icons';
import { DuesAccountCard } from '@/components/dues/DuesAccountCard';
import { DuesAmountCard } from '@/components/dues/DuesAmountCard';
import { DuesBalanceCard } from '@/components/dues/DuesBalanceCard';
import { DuesPaymentButton } from '@/components/dues/DuesPaymentButton';
import { DuesPaymentStatusBanner } from '@/components/dues/DuesPaymentStatusBanner';
import { Icon } from '@/components/ui';
import { formatAmount } from '@/lib/formatAmount';
import type { DuesSummary } from '@/types/dues';

interface DuesLeftSectionProps {
  dues: DuesSummary;
}

function DuesLeftSection({ dues }: DuesLeftSectionProps) {
  const publicAccount = dues.isAccountPublic ? dues.account : undefined;

  if (dues.isPaid) {
    return (
      <aside className="desktop:w-[374px] flex w-full flex-col gap-450">
        <DuesBalanceCard
          currentBalance={dues.currentBalance}
          targetBalance={dues.targetBalance}
          compactTitle
        />

        {publicAccount ? (
          <DuesAccountCard account={publicAccount} variant="plain" showCopyButton />
        ) : (
          <div className="bg-container-neutral typo-body2 text-text-alternative rounded-lg p-450">
            회비 계좌는 운영진에게 문의해 주세요.
          </div>
        )}

        <div className="bg-container-primary-alternative flex items-center justify-between rounded-md px-400 py-300">
          <span className="typo-sub3 text-brand-primary flex items-center gap-200">
            <Icon src={DotIcon} size={4} className="text-brand-primary" />
            나의 회비 납부 완료
          </span>
          <span className="typo-sub3 text-text-alternative">{formatAmount(dues.duesAmount)}원</span>
        </div>
      </aside>
    );
  }

  return (
    <aside className="desktop:w-[374px] flex w-full flex-col gap-450">
      <DuesPaymentStatusBanner isPaid={false} />
      <DuesAmountCard cardinalNumber={dues.cardinalNumber} amount={dues.duesAmount}>
        {publicAccount ? (
          <>
            <DuesAccountCard account={publicAccount} />
            <div className="flex flex-col gap-200">
              <DuesPaymentButton account={publicAccount} />
              <p className="typo-caption2 text-text-alternative text-center">
                입금 후 운영진이 확인하면 &apos;납부 완료&apos;로 바뀌어요.
              </p>
            </div>
          </>
        ) : (
          <p className="typo-body2 text-text-alternative">회비 계좌는 운영진에게 문의해 주세요.</p>
        )}
      </DuesAmountCard>
      <DuesBalanceCard currentBalance={dues.currentBalance} targetBalance={dues.targetBalance} />
    </aside>
  );
}

export { DuesLeftSection, type DuesLeftSectionProps };
