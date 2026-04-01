'use client';

import { useRef, useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { Button, FormCard, Input } from '@/components/ui';
import { clubApi } from '@/lib/apis/club';
import { inviteCodeSchema, type InviteCodeFormData } from '@/lib/schemas/inviteCode';
import type { Club } from '@/types';

import { ClubSearchDropdown } from './ClubSearchDropdown';
import { ClubSelectedCard } from './ClubSelectedCard';

function parseInviteLink(url: string): { clubId: string; code: string } | null {
  try {
    const urlObj = new URL(url);
    const clubIdMatch = urlObj.pathname.match(/clubId=([^?&/]+)/);
    const code = urlObj.searchParams.get('code');
    if (clubIdMatch?.[1] && code) return { clubId: clubIdMatch[1], code };
    return null;
  } catch {
    return null;
  }
}

function InviteCodeForm() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [parsedLink, setParsedLink] = useState<{
    clubId: string;
    code: string;
  } | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isValid, isSubmitting },
  } = useForm<InviteCodeFormData>({
    resolver: zodResolver(inviteCodeSchema),
    mode: 'onChange',
  });

  async function handleInviteCodeChange(value: string) {
    abortControllerRef.current?.abort();
    setServerError(null);
    setSelectedClub(null);
    setParsedLink(null);
    setSearchResults([]);

    const parsed = parseInviteLink(value.trim());
    if (!parsed) return;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const { data } = await clubApi.getById(parsed.clubId);
      if (controller.signal.aborted) return;
      setParsedLink(parsed);
      setSearchResults([data.data]);
    } catch (error) {
      if (controller.signal.aborted) return;
      const axiosError = error as import('axios').AxiosError<{ message?: string }>;
      setServerError(axiosError.response?.data?.message ?? '동아리를 찾을 수 없습니다.');
    }
  }

  function handleSelect(club: Club) {
    setSelectedClub(club);
    setSearchResults([]);
    setServerError(null);
  }

  function handleRemove() {
    setSelectedClub(null);
  }

  async function onSubmit(_data: InviteCodeFormData) {
    if (!parsedLink || !selectedClub) return;

    try {
      await clubApi.join(parsedLink.clubId, parsedLink.code);
      router.push('/home');
    } catch (error) {
      const axiosError = error as import('axios').AxiosError<{ message?: string }>;
      setServerError(axiosError.response?.data?.message ?? '가입에 실패했습니다.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[520px]">
      <FormCard
        label="동아리에 가입하기"
        title="동아리에서 받은 초대 링크를 입력해주세요."
        footer={
          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={!isValid || !selectedClub || isSubmitting}
            className="w-full"
          >
            동아리 가입하기
          </Button>
        }
      >
        <div className="flex flex-col gap-300">
          <span className="typo-caption1 text-text-alternative">동아리 초대 링크</span>
          <div className="relative">
            <Controller
              name="inviteCode"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  error={!!serverError}
                  clearable
                  placeholder="https://weeth.kr/clubId=TSID?code=UUID"
                  className="bg-container-neutral-alternative px-300 py-400"
                  onChange={(e) => {
                    field.onChange(e);
                    void handleInviteCodeChange(e.target.value);
                  }}
                />
              )}
            />
            {!selectedClub && <ClubSearchDropdown clubs={searchResults} onSelect={handleSelect} />}
          </div>
          {selectedClub && <ClubSelectedCard club={selectedClub} onRemove={handleRemove} />}
          {serverError && <span className="typo-caption2 text-state-error">{serverError}</span>}
        </div>
      </FormCard>
    </form>
  );
}

export { InviteCodeForm };
