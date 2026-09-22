'use client';

import { useEffect, useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { ProgressBar } from '@/components/ui/ProgressBar';
import { getHomeTutorialPendingKey } from '@/constants/home/tutorial';
import { createClubAction } from '@/lib/actions/club';
import { useProgressAnimation } from '@/hooks/useProgressAnimation';
import { useClubActions, useCreateClubDraftStore } from '@/stores';
import { toastError } from '@/stores/useToastStore';
import type { CreateClubDraftState } from '@/stores/useCreateClubDraftStore';

interface ClubCreatingPageProps {
  onCancel?: () => void;
}

type Status = 'idle' | 'requesting' | 'api-done' | 'navigated';

function ClubCreatingPage({ onCancel }: ClubCreatingPageProps) {
  const router = useRouter();
  const resetDraft = useCreateClubDraftStore((state) => state.reset);
  const { setClub } = useClubActions();
  const [status, setStatus] = useState<Status>('idle');
  const animationDoneRef = useRef(false);
  const clubIdRef = useRef<string | null>(null);

  const navigate = () => {
    if (status === 'navigated' || !clubIdRef.current) return;
    setStatus('navigated');
    window.sessionStorage.setItem(getHomeTutorialPendingKey('lead'), clubIdRef.current);
    resetDraft();
    router.replace(`/${clubIdRef.current}/home`);
  };

  const progress = useProgressAnimation({
    duration: 5000,
    onComplete: () => {
      animationDoneRef.current = true;
      if (status === 'api-done') navigate();
    },
  });

  useEffect(() => {
    if (progress < 80 || status !== 'idle') return;
    setStatus('requesting');

    const { school, name, description, generation, phone, email, contactType } =
      useCreateClubDraftStore.getState() as CreateClubDraftState & Record<string, unknown>;

    if (!school || !name || !contactType) {
      toastError('동아리 정보가 올바르지 않습니다.');
      onCancel?.();
      return;
    }

    createClubAction({ school, name, description, generation, phone, email, contactType })
      .then(async (result) => {
        if (result.error) {
          toastError(result.error);
          onCancel?.();
          return;
        }

        if (!result.clubId) {
          toastError('동아리 생성에 실패했습니다.');
          onCancel?.();
          return;
        }

        clubIdRef.current = result.clubId;
        setClub(result.clubId, name);
        setStatus('api-done');

        if (animationDoneRef.current) {
          navigate();
        }
      })
      .catch(() => {
        toastError('동아리 생성에 실패했습니다.');
        onCancel?.();
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [progress]);

  // API가 애니메이션 이후에 완료된 경우 즉시 navigate
  useEffect(() => {
    if (status === 'api-done' && animationDoneRef.current) {
      navigate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

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
