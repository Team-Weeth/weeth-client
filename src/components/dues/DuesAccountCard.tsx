'use client';

import CopyIcon from '@/assets/icons/copy.svg';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { DuesAccount } from '@/types/dues';
import { copyDuesAccountToClipboard } from '@/utils/dues/duesAccount';

interface DuesAccountCardProps {
  account: DuesAccount;
  variant?: 'highlight' | 'plain';
  showCopyButton?: boolean;
  copyMessage?: string;
  className?: string;
}

function DuesAccountCard({
  account,
  variant = 'highlight',
  showCopyButton = false,
  copyMessage = '계좌번호를 복사했어요',
  className,
}: DuesAccountCardProps) {
  const accountText = `${account.bankName} ${account.accountNumber}`;
  const isHighlight = variant === 'highlight';

  const handleCopy = async () => {
    await copyDuesAccountToClipboard(account, {
      successMessage: copyMessage,
    });
  };

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-300 rounded-md p-400',
        isHighlight ? 'bg-container-primary-alternative' : 'bg-container-neutral',
        className,
      )}
    >
      <div className="flex min-w-0 flex-col gap-100">
        {!isHighlight && <span className="typo-caption1 text-text-alternative">회비 계좌</span>}
        <span
          className={cn(
            'truncate',
            isHighlight ? 'typo-sub3 text-text-strong' : 'typo-sub1 text-text-strong',
          )}
        >
          {accountText}
        </span>
        <span
          className={cn(
            'truncate',
            isHighlight ? 'typo-caption2 text-text-normal' : 'typo-body2 text-text-alternative',
          )}
        >
          {account.holderName}
        </span>
      </div>
      {showCopyButton && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label="계좌번호 복사"
          className="text-icon-normal hover:text-icon-strong cursor-pointer p-100"
        >
          <Icon src={CopyIcon} size={24} />
        </button>
      )}
    </div>
  );
}

export { DuesAccountCard, type DuesAccountCardProps };
