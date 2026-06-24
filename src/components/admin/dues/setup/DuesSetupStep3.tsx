'use client';

import { useEffect } from 'react';

import { useRouter, useParams } from 'next/navigation';

import { BackButton } from '@/components/admin/dues';
import { cn } from '@/lib/cn';
import { MOCK_PREVIOUS_BALANCE } from '@/constants/mock';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';

import {
  DuesSetupStepIndicator,
  FormCard,
  NextButton,
  PrevButton,
} from '@/components/admin/dues/setup/components';

const DESCRIPTION_MAX = 30;

interface CarryOverCardProps {
  title: string;
  description?: string;
  selected: boolean;
  onClick: () => void;
}

function CarryOverCard({ title, description, selected, onClick }: CarryOverCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 cursor-pointer items-center justify-between rounded-lg border p-400 text-left transition-colors',
        selected ? 'border-brand-primary' : 'border-border',
      )}
    >
      <div className="flex flex-col gap-100">
        <span
          className={cn(
            'typo-sub3',
            selected ? 'text-brand-primary' : 'text-text-normal',
          )}
        >
          {title}
        </span>
        {description && (
          <span className="typo-caption2 text-text-alternative">{description}</span>
        )}
      </div>
      <div
        className={cn(
          'flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
          selected ? 'border-brand-primary' : 'border-border',
        )}
      >
        {selected && <div className="bg-brand-primary size-2.5 rounded-full" />}
      </div>
    </button>
  );
}

function DuesSetupStep3() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  const {
    generationNumber,
    carryOverOption,
    carryOverDescription,
    carryOverInitialized,
  } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const hasPreviousBalance = MOCK_PREVIOUS_BALANCE !== null;
  const previousBalance = MOCK_PREVIOUS_BALANCE?.balance ?? 0;
  const previousGeneration = MOCK_PREVIOUS_BALANCE?.generationNumber ?? generationNumber - 1;

  // 첫 진입 시 기본값 설정
  useEffect(() => {
    if (!carryOverInitialized) {
      setField({
        carryOverOption: hasPreviousBalance ? 'none' : 'carry',
        carryOverInitialized: true,
      });
    }
  }, [carryOverInitialized, hasPreviousBalance, setField]);

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{generationNumber}기 총 회비 설정</h1>
      </div>

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator currentStep={3} />

        <FormCard
          title="이월 설정"
          step={3}
          description="이전 기수에서 이월할 잔액을 설정해주세요"
        >
          {/* 이전 기수 잔액 정보 카드 */}
          <div className="bg-container-primary-alternative rounded-lg px-400 py-300">
            {hasPreviousBalance ? (
              <>
                <p className="typo-sub1 text-text-strong">
                  {previousBalance.toLocaleString()} 원
                </p>
                <p className="typo-body2 text-text-alternative">
                  이전 기수 {previousGeneration}기 잔액
                </p>
              </>
            ) : (
              <p className="typo-body1 text-brand-primary">
                이전 기수 정보가 없습니다! 직접 금액을 작성해주세요.
              </p>
            )}
          </div>

          {/* 이월 옵션 라디오 카드 */}
          <div className="flex gap-400">
            <CarryOverCard
              title="이월하지 않기"
              description={
                hasPreviousBalance ? '이월 금액이 지출 내역으로 기록됩니다.' : undefined
              }
              selected={carryOverOption === 'none'}
              onClick={() => setField({ carryOverOption: 'none' })}
            />
            <CarryOverCard
              title="잔액을 이번 기수로 이월하기"
              description={
                !hasPreviousBalance ? '아래 금액을 작성해주세요' : undefined
              }
              selected={carryOverOption === 'carry'}
              onClick={() => setField({ carryOverOption: 'carry' })}
            />
          </div>

          {/* 이월하기 선택 + 이전 기수 정보 없을 때: 설명 입력 */}
          {carryOverOption === 'carry' && !hasPreviousBalance && (
            <div className="flex flex-col gap-200">
              <label className="typo-sub3 text-text-normal px-400">
                이월 금액 설명 (선택)
              </label>
              <div className="flex flex-col gap-100">
                <textarea
                  value={carryOverDescription}
                  onChange={(e) =>
                    setField({ carryOverDescription: e.target.value.slice(0, DESCRIPTION_MAX) })
                  }
                  placeholder="설명을 작성해주세요"
                  rows={3}
                  className="bg-container-neutral-alternative typo-body2 placeholder:text-text-alternative text-text-normal w-full resize-none rounded-sm px-400 py-300 focus:outline-none"
                />
                <p className="typo-caption2 text-text-alternative text-right">
                  {carryOverDescription.length}/{DESCRIPTION_MAX}
                </p>
              </div>
            </div>
          )}
        </FormCard>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <PrevButton handlePrev={() => router.push(`/${clubId}/admin/dues/setup/2`)} />
        <NextButton handleNext={() => router.push(`/${clubId}/admin/dues/setup/4`)} />
      </div>
    </div>
  );
}

export { DuesSetupStep3 };
