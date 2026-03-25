'use client';

import { useEffect, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ProgressBar } from '@/components/ui';

function ClubCreatingPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const TARGET = 100;
    const DURATION = 5000;
    let startTime: number | null = null;
    let rafId: number;

    function easeOut(t: number) {
      return 1 - Math.pow(1 - t, 2.5);
    }

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp;
      const t = Math.min((timestamp - startTime) / DURATION, 1);
      setProgress(easeOut(t) * TARGET);
      if (t < 1) rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, []);

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
