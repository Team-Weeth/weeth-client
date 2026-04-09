'use client';

import { useEffect } from 'react';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui';
import { useAuthName } from '@/stores';

function ClubWelcomePage() {
  const router = useRouter();
  const name = useAuthName();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/home');
    }, 3000);
    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-screen items-center justify-center px-400">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-400">
        <div className="bg-container-neutral-alternative h-20 w-20 rounded-full" />
        <h1 className="typo-h3 text-text-strong text-center">
          {name ? `${name}님, ` : ''}반가워요!
          <br />
          즐거운 동아리 활동을 이어나가요
        </h1>
        <div className="flex w-full flex-col items-center gap-300">
          <p className="typo-body2 text-text-alternative">3초 뒤에 자동으로 이동합니다.</p>
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => router.push('/home')}
          >
            바로 사이트로 이동하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ClubWelcomePage };
