'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ProgressBar } from '@/components/ui';

interface ClubJoiningPageProps {
  clubName: string;
}

function ClubJoiningPage({ clubName }: ClubJoiningPageProps) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const TARGET = 100;
    const DURATION = 3000;
    let startTime: number | null = null;
    let rafId: number;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 2.5);
    }

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const t = Math.min((timestamp - startTime) / DURATION, 1);
      const value = easeOut(t) * TARGET;
      setProgress(value);
      if (t < 1) {
        rafId = requestAnimationFrame(animate);
      } else {
        // TODO: 실제 가입 API 완료 시점으로 교체
        router.push('/hub/welcome?userName=OOO');
      }
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [router]);

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
