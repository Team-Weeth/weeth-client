'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { toastError } from '@/stores/useToastStore';
import { useDuesCarryOverSourceQuery } from '@/hooks/queries/admin';
import { useSaveDuesCarryOver } from '@/hooks/mutations/admin';

import { CarryOverCard } from '@/components/admin/dues/setup/components/CarryOverCard';
import { DuesAmountField } from '@/components/admin/dues/setup/components/DuesAmountField';
import { DuesSetupStep3Skeleton } from '@/components/admin/dues/setup/components/DuesSetupStepSkeleton';
import { DuesSetupStepIndicator } from '@/components/admin/dues/setup/components/DuesSetupStepIndicator';
import { FormCard } from '@/components/admin/dues/setup/components/FormCard';
import { NextButton } from '@/components/admin/dues/setup/components/NextButton';
import { PrevButton } from '@/components/admin/dues/setup/components/PrevButton';
import { SetupHeader } from '@/components/admin/dues/setup/components/SetupHeader';
import { useDuesSetupNavigation } from '@/hooks/admin/useDuesSetupNavigation';
import { useDuesStepNavigator } from '@/hooks/admin/useDuesStepNavigator';
import { useEnsureDuesAccountId } from '@/hooks/admin';
import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';

const DESCRIPTION_MAX = 30;

function DuesSetupStep3() {
  const { clubId } = useParams<{ clubId: string }>();
  const { goToStep } = useDuesSetupNavigation();

  const {
    accountId,
    cardinalNumber,
    carryOverOption,
    carryOverAmount,
    carryOverDescription,
    carryOverInitialized,
  } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  // 새로고침으로 accountId(메모리 전용)가 사라진 경우 초안을 재조회해 복구한다.
  useEnsureDuesAccountId(clubId);

  const { data: source, isPending } = useDuesCarryOverSourceQuery(clubId, accountId);
  const saveCarryOver = useSaveDuesCarryOver(clubId, accountId, {
    onError: () => toastError('이월 설정 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'),
  });

  // 최초 조회 시 이전 기수 잔액 유무로 이월 옵션 기본값을 설정한다(1회).
  useEffect(() => {
    if (!source || carryOverInitialized) return;

    setField({
      carryOverOption: source.hasPreviousAccount ? 'carry' : 'none',
      carryOverInitialized: true,
    });
  }, [source, carryOverInitialized, setField]);

  // 조회한 이전 기수 잔액 정보를 store에 보관해 Step5(최종 확인)에서 재사용한다.
  useEffect(() => {
    if (source) setField({ previousAccount: source });
  }, [source, setField]);

  const hasPreviousBalance = source?.hasPreviousAccount ?? false;
  const previousBalance = source?.balance ?? 0;
  const previousGeneration = source?.cardinalNumber ?? cardinalNumber - 1;

  const commitStep = async () => {
    if (accountId === null) return false;

    try {
      await saveCarryOver.mutateAsync({
        enabled: carryOverOption === 'carry',
        amount: hasPreviousBalance ? previousBalance : Number(carryOverAmount || 0),
        memo: carryOverDescription.trim(),
      });
      return true;
    } catch {
      return false;
    }
  };

  const { goNext, isEditMode } = useDuesStepNavigator(3, commitStep);

  // accountId 확보 전(skipToken) 또는 이월 재원 조회 중에는 스켈레톤을 노출한다.
  if (isPending) return <DuesSetupStep3Skeleton />;

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <SetupHeader cardinalNumber={cardinalNumber} />

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
              description={
                hasPreviousBalance
                  ? '이전 기수 잔액이 자동으로 이월됩니다.'
                  : '아래에 금액을 작성해주세요'
              }
              selected={carryOverOption === 'carry'}
              onClick={() => setField({ carryOverOption: 'carry' })}
            />
          </div>

          {/* 이전 기수 정보가 없는 경우: 이월 금액 직접 입력 */}
          {carryOverOption === 'carry' && !hasPreviousBalance && (
            <>
              <DuesAmountField
                id="carry-over-amount"
                label="이월 금액"
                value={carryOverAmount}
                onChange={(value) => setField({ carryOverAmount: value })}
              />
              <ScheduleTextField
                value={carryOverDescription}
                label="이월 금액 설명 (선택)"
                onChange={(value) => setField({ carryOverDescription: value })}
                placeholder="설명을 작성해주세요"
                maxLength={DESCRIPTION_MAX}
                className="bg-container-neutral-alternative"
              />
            </>
          )}
        </FormCard>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <PrevButton handlePrev={() => goToStep(2)} disabled={isEditMode} />
        <NextButton handleNext={goNext} editMode={isEditMode} disabled={saveCarryOver.isPending} />
      </div>
    </div>
  );
}

export { DuesSetupStep3 };
