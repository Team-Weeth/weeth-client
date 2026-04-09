'use client';

import { useEffect, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import { buttonVariants, ProgressBar } from '@/components/ui';
import { CLUB_JOIN_ERROR_CODE } from '@/constants/errorCode';
import { useProgressAnimation } from '@/hooks';
import { clubApi } from '@/lib/apis/club';
import { cn } from '@/lib/cn';
import { toastError } from '@/stores/useToastStore';

interface ClubJoiningPageProps {
  clubName: string;
  clubId: string;
  code: string;
}

type ErrorState = { code: number; message: string } | null;

function ClubJoiningPage({ clubName, clubId, code }: ClubJoiningPageProps) {
  const router = useRouter();
  const [apiDone, setApiDone] = useState(false);
  const [errorState, setErrorState] = useState<ErrorState>(null);
  const apiCalledRef = useRef(false);
  const animationDoneRef = useRef(false);

  const progress = useProgressAnimation({
    duration: 3000,
    onComplete: () => {
      animationDoneRef.current = true;
      if (apiDone) router.replace('/welcome');
    },
  });

  useEffect(() => {
    if (apiCalledRef.current) return;
    apiCalledRef.current = true;

    clubApi
      .join(clubId, code)
      .then(() => {
        setApiDone(true);
      })
      .catch((error) => {
        if (isAxiosError(error)) {
          const errorCode = error.response?.data?.code;
          if (errorCode === CLUB_JOIN_ERROR_CODE.INVALID_INVITE_LINK) {
            setErrorState({
              code: CLUB_JOIN_ERROR_CODE.INVALID_INVITE_LINK,
              message: '잘못된 가입 링크입니다.',
            });
            return;
          }
          if (errorCode === CLUB_JOIN_ERROR_CODE.ALREADY_JOINED) {
            setErrorState({
              code: CLUB_JOIN_ERROR_CODE.ALREADY_JOINED,
              message: '이미 가입된 동아리입니다. 동아리로 이동할까요?',
            });
            return;
          }
          if (errorCode === CLUB_JOIN_ERROR_CODE.CLUB_MEMBER_LIMIT_EXCEEDED) {
            setErrorState({
              code: CLUB_JOIN_ERROR_CODE.CLUB_MEMBER_LIMIT_EXCEEDED,
              message: '가입 가능한 동아리 수를 초과했습니다.',
            });
            return;
          }
        }
        toastError();
        router.replace('/hub');
      });
  }, [clubId, code, router]);

  // API가 애니메이션 이후에 완료된 경우 즉시 navigate
  useEffect(() => {
    if (apiDone && animationDoneRef.current) router.replace('/welcome');
  }, [apiDone, router]);

  if (errorState) {
    return (
      <div className="flex min-h-screen items-center justify-center px-400">
        <div className="flex w-full max-w-[520px] flex-col items-center gap-500">
          <h1 className="typo-h3 text-text-strong text-center">{errorState.message}</h1>
          {errorState.code === CLUB_JOIN_ERROR_CODE.ALREADY_JOINED ? (
            <Link
              href="/home"
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
