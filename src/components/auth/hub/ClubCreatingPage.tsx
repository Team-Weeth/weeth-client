'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import { useProgressAnimation } from '@/hooks';
import { useCreateClubDraftStore } from '@/stores';
import { ProgressBar } from '@/components/ui';

function ClubCreatingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resetDraft = useCreateClubDraftStore((state) => state.reset);
  const intent = searchParams.get('intent');
  const nextPath = intent === 'create' ? '/home' : '/hub/welcome';
  const progress = useProgressAnimation({
    duration: 5000,
    onComplete: () => {
      if (intent === 'create') {
        resetDraft();
      }
      router.push(nextPath);
    },
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-400">
      <div className="flex w-full max-w-[520px] flex-col items-center">
        <div className="flex flex-col items-center gap-200 text-center">
          <h1 className="typo-h3 text-text-strong">동아리의 공간이 만들어지고 있어요!</h1>
          <p className="typo-body2 text-text-alternative">
            사이트를 개설하고 있어요. 잠시만 기다려주세요...
          </p>
        </div>

        <ProgressBar value={progress} className="mt-500 mb-600 w-full" />

        <button
          type="button"
          onClick={() => router.push('/hub/create')}
          className="typo-button2 text-text-alternative cursor-pointer"
        >
          개설 중단하기
        </button>
      </div>
    </div>
  );
}

export { ClubCreatingPage };
