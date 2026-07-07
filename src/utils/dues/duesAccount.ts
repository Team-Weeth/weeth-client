import type { DuesAccount } from '@/types/dues';
import { copyTextToClipboard } from '@/utils/shared/clipboard';

interface CopyDuesAccountOptions {
  successMessage?: string;
  errorMessage?: string;
}

async function copyDuesAccountToClipboard(
  account: DuesAccount,
  {
    successMessage = '계좌번호를 복사했어요',
    errorMessage = '계좌번호 복사에 실패했어요',
  }: CopyDuesAccountOptions = {},
) {
  await copyTextToClipboard(account.accountNumber, {
    successMessage,
    errorMessage,
  });
}

export { copyDuesAccountToClipboard, type CopyDuesAccountOptions };
