'use client';

import { useState } from 'react';

import { QuestionCircleIcon } from '@/assets/icons';
import { BackButton, PaymentTargetModal } from '@/components/admin/dues';
import { Icon, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui';
import { MOCK_PAYMENT_TARGETS, MOCK_PREVIOUS_BALANCE } from '@/constants/mock';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';

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
  const { goToStep, goToDues } = useDuesSetupNavigation();

  const {
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

  const handleComplete = () => {
    // TODO: API 연결 후 실제 저장 로직 추가
    reset();
    goToDues();
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
        <NextButton handleNext={handleComplete} last />
      </div>
    </div>
  );
}

export { DuesSetupStep5 };
