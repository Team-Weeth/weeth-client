'use client';

import CopyIcon from '@/assets/icons/copy.svg';
import { Icon } from '@/components/ui/Icon';
import type { DuesAccount } from '@/types/dues';
import { copyDuesAccountToClipboard } from '@/utils/dues/duesAccount';

interface DuesAccountCopyButtonProps {
  account: DuesAccount;
  successMessage: string;
}

function DuesAccountCopyButton({ account, successMessage }: DuesAccountCopyButtonProps) {
  const handleCopy = async () => {
    await copyDuesAccountToClipboard(account, {
      successMessage,
    });
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="계좌번호 복사"
      className="text-icon-normal hover:text-icon-strong cursor-pointer p-100"
    >
      <Icon src={CopyIcon} size={24} />
    </button>
  );
}

export { DuesAccountCopyButton, type DuesAccountCopyButtonProps };
