'use client';

import { Button } from '@/components/ui/Button';
import type { DuesAccount } from '@/types/dues';
import { copyDuesAccountToClipboard } from '@/utils/dues/duesAccount';

interface DuesPaymentButtonProps {
  account: DuesAccount;
  targated: boolean;
}

function DuesPaymentButton({ account, targated }: DuesPaymentButtonProps) {
  const handleClick = async () => {
    await copyDuesAccountToClipboard(account);
  };

  return (
    <Button
      variant="primary"
      size="lg"
      onClick={handleClick}
      className="w-full"
      disabled={targated}
    >
      계좌 복사하고 납부하기
    </Button>
  );
}

export { DuesPaymentButton, type DuesPaymentButtonProps };
