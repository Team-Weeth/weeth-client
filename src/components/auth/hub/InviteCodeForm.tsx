'use client';

import { useState } from 'react';

import { useRouter } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';

import { Button, FormCard, Input } from '@/components/ui';
import { inviteCodeSchema, type InviteCodeFormData } from '@/lib/schemas/inviteCode';
import type { Club } from '@/types';

import { ClubSearchDropdown } from './ClubSearchDropdown';
import { ClubSelectedCard } from './ClubSelectedCard';

function InviteCodeForm() {
  const router = useRouter();
  const [searchResults, setSearchResults] = useState<Club[]>([]);
  const [selectedClub, setSelectedClub] = useState<Club | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { isValid },
  } = useForm<InviteCodeFormData>({
    resolver: zodResolver(inviteCodeSchema),
    mode: 'onChange',
  });

  // TODO: 실제 API 연동
  function handleInviteCodeChange(value: string) {
    setServerError(null);
    setSelectedClub(null);
    if (value.trim()) {
      setSearchResults([
        {
          id: '1',
          name: '가천대 검도부',
          description: '날씨가 춥네요, 건강이 최고',
          logoUrl: undefined,
        },
      ]);
    } else {
      setSearchResults([]);
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

  function onSubmit(_data: InviteCodeFormData) {
    // TODO: API call
    const clubName = selectedClub?.name ?? '동아리';
    router.push(`/hub/joining?clubName=${encodeURIComponent(clubName)}`);
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
            disabled={!isValid || !selectedClub}
            className="w-full"
          >
            동아리 가입하기
          </Button>
        }
      >
        <div className="flex flex-col gap-300">
          <span className="typo-caption1 text-text-alternative">동아리 초대 링크</span>
          <div className="relative">
            <Input
              {...register('inviteCode', {
                onChange: (e) => handleInviteCodeChange(e.target.value),
              })}
              error={!!serverError}
              clearable
              placeholder="https://weeth.kr/clubId=TSID?code=UUID 추후에 실제 예시 코드로 변경"
              className="bg-container-neutral-alternative px-300 py-400"
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
