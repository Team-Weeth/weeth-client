'use client';

import Image from 'next/image';

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui';
import type { Club } from '@/types';

interface ClubAccessPageProps {
  club: Club;
}

function ClubAccessPage({ club }: ClubAccessPageProps) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-400">
        <h1 className="typo-h3 text-text-strong">이 사이트는 동아리 회원만 이용할 수 있어요.</h1>
        {club.logoUrl ? (
          <Image
            src={club.logoUrl}
            alt={club.name}
            width={80}
            height={80}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="bg-container-neutral-alternative h-20 w-20 rounded-full" />
        )}
        <div className="flex flex-col items-center gap-200">
          <span className="typo-h3 text-text-strong">{club.name}</span>
          <span className="typo-body2 text-text-normal">{club.description}</span>
        </div>
        <Button variant="primary" size="lg" className="w-full" onClick={() => router.push('/login')}>
          로그인하고 들어가기
        </Button>
      </div>
    </div>
  );
}

export { ClubAccessPage };
