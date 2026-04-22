'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { isAxiosError } from 'axios';
import { useRouter } from 'next/navigation';

import { ProgressBar } from '@/components/ui';
import { setClubCookie } from '@/lib/actions/club';
import { useProgressAnimation } from '@/hooks';
import { clubApi } from '@/lib/apis/club';
import { useClubActions, useCreateClubDraftStore } from '@/stores';
import { toastError } from '@/stores/useToastStore';
import type { CreateClubDraftState } from '@/stores/useCreateClubDraftStore';

interface ClubCreatingPageProps {
  onCancel?: () => void;
}

function ClubCreatingPage({ onCancel }: ClubCreatingPageProps) {
  const router = useRouter();
  const resetDraft = useCreateClubDraftStore((state) => state.reset);
  const { setClub } = useClubActions();
  const [apiDone, setApiDone] = useState(false);
  const apiDoneRef = useRef(false);
  const animationDoneRef = useRef(false);
  const hasNavigatedRef = useRef(false);
  const requestStartedRef = useRef(false);
  const cancelledRef = useRef(false);
  const clubIdRef = useRef<string | null>(null);

  const navigate = useCallback(() => {
    if (hasNavigatedRef.current || cancelledRef.current || !clubIdRef.current) return;
    hasNavigatedRef.current = true;
    resetDraft();
    router.replace(`/${clubIdRef.current}/home?onboarding=club-created`);
  }, [resetDraft, router]);

  const progress = useProgressAnimation({
    duration: 5000,
    onComplete: () => {
      animationDoneRef.current = true;
      if (apiDoneRef.current) navigate();
    },
  });

  // progress >= 80일 때 API 호출
  useEffect(() => {
    if (progress < 80 || requestStartedRef.current) return;
    requestStartedRef.current = true;

    const { school, name, description, generation, phone, email, contactType } =
      useCreateClubDraftStore.getState() as CreateClubDraftState & Record<string, unknown>;

    if (!school || !name || !contactType) {
      toastError('동아리 정보가 올바르지 않습니다.');
      cancelledRef.current = true;
      onCancel?.();
      return;
    }

    const schoolName = school.replace(/\(.*\)$/, '').trim();

    const payload = {
      name,
      schoolName,
      description,
      contactEmail: email || null,
      contactPhoneNumber: phone.replace(/-/g, ''),
      primaryContact: contactType.toUpperCase() as 'PHONE' | 'EMAIL',
      currentCardinal: Number(generation),
      profileImage: null,
      backgroundImage: null,
    };

    clubApi
      .create(payload)
      .then(async (response) => {
        const { data, message } = response.data;

        if (!data) {
          toastError(message || '동아리 생성에 실패했습니다.');
          cancelledRef.current = true;
          onCancel?.();
          return;
        }

        const clubId = data.clubId;
        clubIdRef.current = clubId;
        await setClubCookie(clubId, name);
        apiDoneRef.current = true;
        setClub(clubId, name);
        setApiDone(true);

        if (animationDoneRef.current) {
          navigate();
        }
      })
      .catch((error) => {
        const message = isAxiosError(error) ? error.response?.data?.message : undefined;
        toastError(message || '동아리 생성에 실패했습니다.');
        cancelledRef.current = true;
        onCancel?.();
      });
  }, [progress, navigate, onCancel, setClub]);

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
