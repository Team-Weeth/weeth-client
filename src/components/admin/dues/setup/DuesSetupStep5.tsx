'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

import { QuestionCircleIcon } from '@/assets/icons';
import { BackButton, PaymentTargetModal } from '@/components/admin/dues';
import { Icon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { DUES_REGISTRATION_ERROR_CODE } from '@/constants/errorCode';
import { MOCK_PAYMENT_TARGETS, MOCK_PREVIOUS_BALANCE } from '@/constants/mock';
import { duesApi } from '@/lib/apis/dues';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorCode } from '@/utils/shared/getApiErrorCode';

import {
  DuesSetupStepIndicator,
  FormCard,
  NextButton,
  PrevButton,
  SettingResultCardGrid,
} from '@/components/admin/dues/setup/components';
import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';

const MAX_AVATAR_DISPLAY = 4;

function DuesSetupStep5() {
  const { clubId } = useParams<{ clubId: string }>();
  const { goToStep, goToDues } = useDuesSetupNavigation();

  const {
    accountId,
    isEditMode,
    cardinalNumber,
    amount,
    name,
    selectedMemberIds,
    carryOverOption,
    carryOverDescription,
    accountNumber,
    bankName,
    accountHolder,
    accountGuide,
    isAccountPublic,
  } = useDuesSetupValues();
  const { reset } = useDuesSetupActions();
  const [isPaymentTargetModalOpen, setIsPaymentTargetModalOpen] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const hasPreviousBalance = MOCK_PREVIOUS_BALANCE !== null;
  const previousBalance = MOCK_PREVIOUS_BALANCE?.balance ?? 0;
  const previousGeneration = MOCK_PREVIOUS_BALANCE?.generationNumber ?? cardinalNumber - 1;

  const totalCount = MOCK_PAYMENT_TARGETS.length;
  const selectedCount = selectedMemberIds.length;
  const excludedCount = totalCount - selectedCount;

  const selectedTargets = MOCK_PAYMENT_TARGETS.filter((t) =>
    selectedMemberIds.includes(t.paymentTargetInfo.clubMemberId),
  );

  const displayedAvatars = selectedTargets.slice(0, MAX_AVATAR_DISPLAY);
  const remainingCount = Math.max(0, selectedTargets.length - MAX_AVATAR_DISPLAY);

  const expectedDuesIncome = Number(amount) * selectedCount;
  const carryOverAmount = carryOverOption === 'carry' ? previousBalance : 0;
  const expectedTotal = expectedDuesIncome + carryOverAmount;

  const handleComplete = async () => {
    if (accountId === null || isCompleting) return;

    // 수정 모드: 각 단계 patch는 이미 반영되었고, 완료 장부 재-complete는 20104이므로 생략
    if (isEditMode) {
      toastSuccess('회비 정보가 수정되었습니다.');
      reset();
      goToDues();
      return;
    }

    setIsCompleting(true);
    try {
      await duesApi.completeRegistration(clubId, accountId);
      toastSuccess('회비 등록이 완료되었습니다.');
      reset();
      goToDues();
    } catch (error) {
      const code = getApiErrorCode(error);

      switch (code) {
        case DUES_REGISTRATION_ERROR_CODE.ALREADY_COMPLETED:
          // 이미 완료된 장부 — 더 진행할 필요 없이 목록으로 이동
          toastError('이미 등록이 완료된 장부입니다.');
          reset();
          goToDues();
          break;
        case DUES_REGISTRATION_ERROR_CODE.NOT_COMPLETED:
          // 미완료 단계 존재 — 처음 단계로 돌려보내 누락 단계 저장 유도
          toastError('저장되지 않은 단계가 있습니다. 각 단계를 다시 확인해주세요.');
          goToStep(1);
          break;
        case DUES_REGISTRATION_ERROR_CODE.CARRY_OVER_MISMATCH:
          // 이월 금액 불일치 — 이월 설정(3단계)에서 재원 재조회 후 다시 저장 필요
          toastError('이전 기수 잔액이 변경되었습니다. 이월 설정을 다시 저장한 뒤 재시도해주세요.');
          goToStep(3);
          break;
        default:
          toastError('회비 등록 완료에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{cardinalNumber}기 총 회비 설정</h1>
      </div>

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator currentStep={5} />

        <FormCard
          title="최종 확인"
          step={5}
          description={`${cardinalNumber}기 총 회비 설정을 확인해주세요`}
        >
          {/* 예상 관리 금액 요약 배너 */}
          <div className="bg-container-primary-alternative flex items-center justify-between rounded-lg px-500 py-400">
            <div className="flex flex-col gap-100">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex cursor-default items-center gap-100">
                      <span className="typo-caption1 text-text-alternative">예상 관리 금액</span>
                      <Icon
                        src={QuestionCircleIcon}
                        alt="설명"
                        size={20}
                        className="text-icon-alternative"
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    예상 관리 금액은 실제 계산된 금액과 차이가 있을 수 있습니다.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <span className="typo-h2 text-text-strong">{expectedTotal.toLocaleString()} 원</span>
            </div>
            <div className="flex flex-col gap-100 text-right">
              <div className="flex items-center justify-end gap-200">
                <span className="typo-body2 text-text-alternative">예상 회비 수입</span>
                <span className="typo-sub3 text-text-strong">
                  {expectedDuesIncome.toLocaleString()} 원
                </span>
              </div>
              <div className="flex items-center justify-end gap-200">
                <span className="typo-body2 text-text-alternative">이월 금액</span>
                <span className="typo-sub3 text-text-strong">
                  {carryOverAmount.toLocaleString()} 원
                </span>
              </div>
            </div>
          </div>

          {/* 4개 정보 카드 2×2 그리드 */}
          <SettingResultCardGrid
            cardinalNumber={cardinalNumber}
            amount={amount}
            name={name}
            selectedCount={selectedCount}
            excludedCount={excludedCount}
            displayedAvatars={displayedAvatars}
            remainingCount={remainingCount}
            onOpenPaymentTargetModal={() => setIsPaymentTargetModalOpen(true)}
            hasPreviousBalance={hasPreviousBalance}
            previousGeneration={previousGeneration}
            previousBalance={previousBalance}
            carryOverOption={carryOverOption}
            carryOverDescription={carryOverDescription}
            isAccountPublic={isAccountPublic}
            accountNumber={accountNumber}
            bankName={bankName}
            accountHolder={accountHolder}
            accountGuide={accountGuide}
            goToStep={goToStep}
          />
        </FormCard>
      </div>

      <PaymentTargetModal
        open={isPaymentTargetModalOpen}
        onOpenChange={setIsPaymentTargetModalOpen}
        selectedMemberIds={selectedMemberIds}
      />

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <PrevButton handlePrev={() => goToStep(4)} />
        <NextButton handleNext={handleComplete} disabled={isCompleting} last />
      </div>
    </div>
  );
}

export { DuesSetupStep5 };
