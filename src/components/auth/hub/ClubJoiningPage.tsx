'use client';

import { useRouter } from 'next/navigation';

import { useProgressAnimation } from '@/hooks';
import { ProgressBar } from '@/components/ui';

interface ClubJoiningPageProps {
  clubName: string;
}

function ClubJoiningPage({ clubName }: ClubJoiningPageProps) {
  const router = useRouter();
  const progress = useProgressAnimation({
    duration: 3000,
    // TODO: 실제 가입 API 완료 시점으로 교체
    onComplete: () => router.push('/hub/welcome?userName=OOO'),
  });

  return (
    <div className="flex min-h-screen items-center justify-center px-400">
      <div className="flex w-full max-w-[520px] flex-col items-center">
        <div className="flex flex-col items-center gap-200 text-center">
          <h1 className="typo-h3 text-text-strong">초대 코드로 {clubName}에 가입하고 있어요.</h1>
          <p className="typo-body2 text-text-alternative">잠시만 기다려주세요...</p>
        </div>
        <ProgressBar value={progress} className="mt-500 w-full" />
      </div>
    </div>
  );
}

export { ClubJoiningPage };
