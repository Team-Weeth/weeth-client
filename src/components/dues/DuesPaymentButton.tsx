'use client';

import { Button } from '@/components/ui';
import { toastSuccess } from '@/stores/useToastStore';
import type { DuesAccount } from '@/types/dues';

interface DuesPaymentButtonProps {
  account: DuesAccount;
}

function DuesPaymentButton({ account }: DuesPaymentButtonProps) {
  const handleClick = async () => {
    await navigator.clipboard.writeText(
      `${account.bankName} ${account.accountNumber} ${account.holderName}`,
    );
    toastSuccess('계좌번호를 복사했어요');
  };

  return (
    <Button variant="primary" size="lg" onClick={handleClick} className="w-full">
      계좌 복사하고 납부하기
    </Button>
  );
}

export { DuesPaymentButton, type DuesPaymentButtonProps };
