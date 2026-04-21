'use client';

import { useEffect, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { buttonVariants, ProgressBar } from '@/components/ui';
import { CLUB_JOIN_ERROR_CODE } from '@/constants/errorCode';
import { useProgressAnimation } from '@/hooks';
import { setClubCookie } from '@/lib/actions/club';
import { clubApi } from '@/lib/apis/club';
import { cn } from '@/lib/cn';
import { useClubActions } from '@/stores';
import { toastError } from '@/stores/useToastStore';

interface ClubJoiningPageProps {
  clubName: string;
  clubId: string;
  code: string;
}

type ErrorState = { code: number; message: string } | null;

function JoiningProgress({ clubName, onComplete }: { clubName: string; onComplete: () => void }) {
  const progress = useProgressAnimation({ duration: 3000, onComplete });

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

function ClubJoiningPage({ clubName, clubId, code }: ClubJoiningPageProps) {
  const router = useRouter();
  const { setClub } = useClubActions();
  const [status, setStatus] = useState<'pending' | 'joining' | 'error'>('pending');
  const [errorState, setErrorState] = useState<ErrorState>(null);
  const apiCalledRef = useRef(false);
  const apiDoneRef = useRef(false);

  const setClubInfo = async (profileImageUrl?: string | null) => {
    await setClubCookie(clubId, clubName);
    setClub(clubId, clubName, profileImageUrl);
  };

  useEffect(() => {
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;

    clubApi
      .join(clubId, code)
      .then(async () => {
        const { data } = await clubApi.getById(clubId);
        await setClubInfo(data.data.profileImageUrl);
        apiDoneRef.current = true;
        setStatus('joining');
      })
      .catch(async (error) => {
        if (isAxiosError(error)) {
          const errorCode = error.response?.data?.code;
          if (errorCode === CLUB_JOIN_ERROR_CODE.INVALID_INVITE_LINK) {
            setErrorState({
              code: CLUB_JOIN_ERROR_CODE.INVALID_INVITE_LINK,
              message: '잘못된 가입 링크입니다.',
            });
            setStatus('error');
            return;
          }
          if (errorCode === CLUB_JOIN_ERROR_CODE.ALREADY_JOINED) {
            await setClubInfo();
            setErrorState({
              code: CLUB_JOIN_ERROR_CODE.ALREADY_JOINED,
              message: '이미 가입된 동아리입니다. 동아리로 이동할까요?',
            });
            setStatus('error');
            return;
          }
          if (errorCode === CLUB_JOIN_ERROR_CODE.CLUB_MEMBER_LIMIT_EXCEEDED) {
            setErrorState({
              code: CLUB_JOIN_ERROR_CODE.CLUB_MEMBER_LIMIT_EXCEEDED,
              message: '가입 가능한 동아리 수를 초과했습니다.',
            });
            setStatus('error');
            return;
          }
        }
        toastError();
        router.replace('/hub');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'pending') {
    return <div className="flex min-h-screen items-center justify-center" />;
  }

  if (errorState) {
    return (
      <div className="flex min-h-screen items-center justify-center px-400">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-500">
          <h1 className="typo-h3 text-text-strong text-center">{errorState.message}</h1>
          {errorState.code === CLUB_JOIN_ERROR_CODE.ALREADY_JOINED ? (
            <Link
              href={`/${clubId}/home`}
              className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
            >
              홈으로 이동
            </Link>
          ) : (
            <Link
              href="/hub"
              className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
            >
              허브로 이동
            </Link>
          )}
        </div>
      </div>
    );
  }

  return <JoiningProgress clubName={clubName} onComplete={() => router.replace('/welcome')} />;
}

export { ClubJoiningPage };
