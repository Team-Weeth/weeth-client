'use client';

import { Button } from '@/components/ui';
import type { DuesAccount } from '@/types/dues';
import { copyTextToClipboard } from '@/utils/shared/clipboard';

interface DuesPaymentButtonProps {
  account: DuesAccount;
}

function DuesPaymentButton({ account }: DuesPaymentButtonProps) {
  const handleClick = async () => {
    await copyTextToClipboard(
      `${account.bankName} ${account.accountNumber} ${account.holderName}`,
      {
        successMessage: '계좌번호를 복사했어요',
        errorMessage: '계좌번호 복사에 실패했어요',
      },
    );
  };

  return (
    <Button variant="primary" size="lg" onClick={handleClick} className="w-full">
      계좌 복사하고 납부하기
    </Button>
  );
}

export { DuesPaymentButton, type DuesPaymentButtonProps };
