'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ProgressBar } from '@/components/ui';
import { createClubAction } from '@/lib/actions/club';
import { useProgressAnimation } from '@/hooks';
import { useClubActions, useCreateClubDraftStore } from '@/stores';
import { toastError } from '@/stores/useToastStore';
import type { CreateClubDraftState } from '@/stores/useCreateClubDraftStore';

interface ClubCreatingPageProps {
  intent?: string;
  onCancel?: () => void;
}

function ClubCreatingPage({ intent, onCancel }: ClubCreatingPageProps) {
  const router = useRouter();
  const resetDraft = useCreateClubDraftStore((state) => state.reset);
  const { setClub } = useClubActions();
  const [apiDone, setApiDone] = useState(false);
  const apiCalledRef = useRef(false);
  const apiDoneRef = useRef(false);
  const animationDoneRef = useRef(false);
  const isMountedRef = useRef(true);
  const hasNavigatedRef = useRef(false);

  const nextPath = intent === 'create' ? '/home?onboarding=club-created' : '/hub/welcome';

  const navigate = useCallback(() => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    if (intent === 'create') resetDraft();
    router.replace(nextPath);
  }, [intent, nextPath, resetDraft, router]);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const progress = useProgressAnimation({
    duration: 5000,
    onComplete: () => {
      animationDoneRef.current = true;
      if (apiDoneRef.current) navigate();
    },
  });

  // 프로그레스 80% 시점에 API 호출
  useEffect(() => {
    if (progress < 80 || apiCalledRef.current) return;
    apiCalledRef.current = true;

    const { school, name, description, generation, phone, email, contactType } =
      useCreateClubDraftStore.getState() as CreateClubDraftState & Record<string, unknown>;

    createClubAction({
      school,
      name,
      description,
      generation,
      phone,
      email,
      contactType,
    })
      .then((result) => {
        if (!isMountedRef.current) return;

        if (result?.error) {
          toastError(result.error);
          apiCalledRef.current = false;
          onCancel?.();
          return;
        }

        if (!result.clubId) {
          toastError('동아리 생성에 실패했습니다. 다시 시도해주세요.');
          apiCalledRef.current = false;
          onCancel?.();
          return;
        }

        apiDoneRef.current = true;
        setClub(result.clubId, name);
        setApiDone(true);

        if (animationDoneRef.current) {
          navigate();
        }
      })
      .catch(() => {
        if (!isMountedRef.current) return;

        toastError('동아리 생성에 실패했습니다. 다시 시도해주세요.');
        apiCalledRef.current = false;
        onCancel?.();
      });
  }, [navigate, onCancel, progress, setClub]);

  // API가 애니메이션 이후에 완료된 경우 즉시 navigate
  useEffect(() => {
    if (apiDone && animationDoneRef.current) {
      navigate();
    }
  }, [apiDone, navigate]);

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
          onClick={onCancel ?? (() => router.push('/club/create'))}
          className="typo-button2 text-text-alternative cursor-pointer"
        >
          개설 중단하기
        </button>
      </div>
    </div>
  );
}

export { ClubCreatingPage };
