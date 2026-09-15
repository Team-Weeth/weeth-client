'use client';

import { toastSuccess, toastWarning, toastError } from '@/stores/useToastStore';

export default function ToastTestPage() {
  return (
    <div className="bg-background flex min-h-screen flex-col items-center justify-center gap-400">
      <h1 className="typo-h3 text-text-strong">Toast 디자인 확인</h1>
      <div className="flex gap-300">
        <button
          className="typo-button2 bg-state-success rounded-md px-400 py-200 text-white"
          onClick={() => toastSuccess('저장되었습니다')}
        >
          success
        </button>
        <button
          className="typo-button2 bg-state-caution rounded-md px-400 py-200 text-white"
          onClick={() => toastWarning('인터넷 연결을 확인해주세요')}
        >
          warning
        </button>
        <button
          className="typo-button2 bg-state-error rounded-md px-400 py-200 text-white"
          onClick={() => toastError('삭제에 실패했습니다')}
        >
          error
        </button>
      </div>
    </div>
  );
}
