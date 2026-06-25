'use client';

import { useEffect } from 'react';

import { useRouter, useParams } from 'next/navigation';

import { BackButton } from '@/components/admin/dues';
import { MOCK_PREVIOUS_BALANCE } from '@/constants/mock';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';

import {
  DuesSetupStepIndicator,
  FormCard,
  NextButton,
  PrevButton,
  CarryOverCard,
} from '@/components/admin/dues/setup/components';

import { ScheduleTextareaField } from '@/components/admin/schedule/general/ScheduleTextareaField';
import { ScheduleTextField } from '../../schedule/general/ScheduleTextField';

const DESCRIPTION_MAX = 30;

function DuesSetupStep3() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  const { generationNumber, carryOverOption, carryOverDescription, carryOverInitialized } =
    useDuesSetupValues();
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

        <FormCard title="이월 설정" step={3} description="이전 기수에서 이월할 잔액을 설정해주세요">
          {/* 이전 기수 잔액 정보 카드 */}
          <div className="bg-container-primary-alternative rounded-lg px-400 py-300">
            {hasPreviousBalance ? (
              <>
                <p className="typo-sub1 text-text-strong">{previousBalance.toLocaleString()} 원</p>
                <p className="typo-body2 text-text-alternative">
                  이전 기수 {previousGeneration}기 잔액
                </p>
              </>
            ) : (
              <p className="typo-body2 text-brand-primary">
                이전 기수 정보가 없습니다! 직접 금액을 작성해주세요.
              </p>
            )}
          </div>

          {/* 이월 옵션 라디오 카드 */}
          <div className="flex gap-400">
            <CarryOverCard
              title="이월하지 않기"
              description="이월 금액이 지출 내역으로 기록됩니다."
              selected={carryOverOption === 'none'}
              onClick={() => setField({ carryOverOption: 'none' })}
            />
            <CarryOverCard
              title="잔액을 이번 기수로 이월하기"
              description="아래 금액을 작성해주세요"
              selected={carryOverOption === 'carry'}
              onClick={() => setField({ carryOverOption: 'carry' })}
            />
          </div>

          {/* 이월하기 선택 + 이전 기수 정보 없을 때: 설명 입력 */}
          {carryOverOption === 'carry' && (
            <ScheduleTextField
              value={carryOverDescription}
              label="이월 금액 설명 (선택)"
              onChange={(value) => setField({ carryOverDescription: value })}
              placeholder="설명을 작성해주세요"
              maxLength={DESCRIPTION_MAX}
              className="bg-container-neutral-alternative"
            />
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
