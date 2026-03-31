import { toastError, toastSuccess } from '@/stores/useToastStore';

interface CopyTextOptions {
  successMessage?: string;
  errorMessage?: string;
}

async function copyTextToClipboard(text: string, options: CopyTextOptions = {}) {
  const {
    successMessage = '클립보드에 복사되었습니다.',
    errorMessage = '복사에 실패했습니다.',
  } = options;

  try {
    await navigator.clipboard.writeText(text);
    toastSuccess(successMessage);
  } catch {
    toastError(errorMessage);
  }
}

export { copyTextToClipboard };
