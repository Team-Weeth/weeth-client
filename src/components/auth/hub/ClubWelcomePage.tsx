'use client';

import { useEffect } from 'react';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

import { Button, ClubAvatar } from '@/components/ui';
import { clubApi } from '@/lib/apis/club';
import { useAuthName, useClubName } from '@/stores';
import { useClubId } from '@/stores/useClubStore';

function ClubWelcomePage() {
  const router = useRouter();
  const name = useAuthName();
  const clubId = useClubId();
  const clubName = useClubName();

  const { data: clubProfileImageUrl } = useQuery({
    queryKey: ['club', clubId, 'profile'],
    queryFn: () => clubApi.getById(clubId!).then((res) => res.data.data.profileImageUrl ?? null),
    enabled: !!clubId,
  });

  useEffect(() => {
    if (!clubId) return;
    const timer = setTimeout(() => {
      router.replace(`/${clubId}/home`);
    }, 3000);
    return () => clearTimeout(timer);
  }, [router, clubId]);

  return (
    <div className="flex min-h-screen items-center justify-center px-400">
      <div className="flex w-full max-w-[520px] flex-col items-center gap-400">
        <ClubAvatar
          size={128}
          src={clubProfileImageUrl}
          name={clubName ?? '동아리'}
          className="rounded-[32px] border-2"
        />
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
            disabled={!clubId}
            onClick={() => clubId && router.push(`/${clubId}/home`)}
          >
            바로 사이트로 이동하기
          </Button>
        </div>
      </div>
    </div>
  );
}

export { ClubWelcomePage };
