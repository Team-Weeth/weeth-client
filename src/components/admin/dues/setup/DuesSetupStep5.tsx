'use client';

import { useMemo, useState, type ReactNode } from 'react';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

import { EditIcon, ArrowRightIcon, ArrowLeftIcon, QuestionCircleIcon } from '@/assets/icons';
import { BackButton, PaymentTargetModal } from '@/components/admin/dues';
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  Card,
  Icon,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui';
import { cn } from '@/lib/cn';
import { MOCK_PAYMENT_TARGETS, MOCK_PREVIOUS_BALANCE } from '@/constants/mock';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';

import { DuesSetupStepIndicator, FormCard } from '@/components/admin/dues/setup/components';

const MAX_AVATAR_DISPLAY = 4;

interface InfoRowProps {
  label: string;
  value: string;
  valueClassName?: string;
}

function InfoRow({ label, value, valueClassName }: InfoRowProps) {
  return (
    <div className="grid grid-cols-[2fr_3fr] gap-300">
      <span className="typo-body2 text-text-alternative">{label}</span>
      <span className={cn('typo-body2 text-text-strong', valueClassName)}>{value}</span>
    </div>
  );
}

interface InfoCardProps {
  title: string;
  onEdit: () => void;
  children: ReactNode;
}

function InfoCard({ title, onEdit, children }: InfoCardProps) {
  return (
    <Card className="shadow-none">
      <div className="flex items-center justify-between">
        <span className="typo-sub3 text-text-strong">{title}</span>
        <button
          type="button"
          onClick={onEdit}
          className="bg-button-neutral text-icon-alternative hover:text-icon-normal flex cursor-pointer self-center rounded-sm p-1 transition-colors"
          aria-label={`${title} 수정`}
        >
          <Icon src={EditIcon} alt="" size={18} />
        </button>
      </div>
      <div className="flex flex-col gap-200">{children}</div>
    </Card>
  );
}

function DuesSetupStep5() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();

  const {
    generationNumber,
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
  const previousGeneration = MOCK_PREVIOUS_BALANCE?.generationNumber ?? generationNumber - 1;

  const totalCount = MOCK_PAYMENT_TARGETS.length;
  const selectedCount = selectedMemberIds.length;
  const excludedCount = totalCount - selectedCount;

  const selectedTargets = useMemo(
    () =>
      MOCK_PAYMENT_TARGETS.filter((t) =>
        selectedMemberIds.includes(t.paymentTargetInfo.clubMemberId),
      ),
    [selectedMemberIds],
  );

  const displayedAvatars = selectedTargets.slice(0, MAX_AVATAR_DISPLAY);
  const remainingCount = selectedTargets.length - MAX_AVATAR_DISPLAY;

  const expectedDuesIncome = Number(amount) * selectedCount;
  const carryOverAmount = carryOverOption === 'carry' ? previousBalance : 0;
  const expectedTotal = expectedDuesIncome + carryOverAmount;

  const handleComplete = () => {
    // TODO: API 연결 후 실제 저장 로직 추가
    reset();
    router.push(`/${clubId}/admin/dues`);
  };

  const goToStep = (step: number) => router.push(`/${clubId}/admin/dues/setup/${step}`);

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{generationNumber}기 총 회비 설정</h1>
      </div>

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator currentStep={5} />

        <FormCard
          title="최종 확인"
          step={5}
          description={`${generationNumber}기 총 회비 설정을 확인해주세요`}
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
          <div className="grid grid-cols-2 gap-400">
            {/* 기본 정보 */}
            <InfoCard title="기본 정보" onEdit={() => goToStep(1)}>
              <InfoRow label="기수" value={`${generationNumber} 기`} />
              <InfoRow label="회비 이름" value={name || '-'} />
              <InfoRow label="1인 회비 금액" value={`${Number(amount).toLocaleString()} 원`} />
            </InfoCard>

            {/* 이월 설정 */}
            <InfoCard title="이월 설정" onEdit={() => goToStep(3)}>
              {hasPreviousBalance ? (
                <>
                  <InfoRow label="이전 기수" value={`${previousGeneration} 기`} />
                  <InfoRow
                    label="이월 여부"
                    value={carryOverOption === 'carry' ? '이월함' : '이월 안 함'}
                  />
                  {carryOverOption === 'carry' && (
                    <InfoRow label="이월 금액" value={`${previousBalance.toLocaleString()} 원`} />
                  )}
                </>
              ) : (
                <>
                  <InfoRow
                    label="이월 여부"
                    value={carryOverOption === 'carry' ? '이월함' : '이월 안 함'}
                  />
                  {carryOverOption === 'carry' && carryOverDescription && (
                    <InfoRow label="설명" value={carryOverDescription} />
                  )}
                </>
              )}
            </InfoCard>

            {/* 납부 대상 */}
            <InfoCard title="납부 대상" onEdit={() => goToStep(2)}>
              <InfoRow label="납부 대상" value={`${selectedCount} 명`} />
              <InfoRow label="제외 대상" value={`${excludedCount} 명`} />
              <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-200">
                <span className="typo-body2 text-text-alternative">선택된 멤버</span>
                <button
                  type="button"
                  onClick={() => setIsPaymentTargetModalOpen(true)}
                  className="cursor-pointer"
                >
                  <AvatarGroup>
                    {displayedAvatars.map((t) => (
                      <Avatar key={t.paymentTargetInfo.clubMemberId} size={24} colorScheme="primary">
                        <AvatarFallback>{t.paymentTargetInfo.name[0]}</AvatarFallback>
                      </Avatar>
                    ))}
                    {remainingCount > 0 && (
                      <AvatarGroupCount className="size-6 text-xs">
                        +{remainingCount}
                      </AvatarGroupCount>
                    )}
                  </AvatarGroup>
                </button>
              </div>
            </InfoCard>

            {/* 계좌 공개 */}
            <InfoCard title="계좌 공개" onEdit={() => goToStep(4)}>
              <InfoRow label="계좌 공개 여부" value={isAccountPublic ? '공개함' : '비공개'} />
              {bankName && <InfoRow label="은행" value={bankName} />}
              {accountNumber && <InfoRow label="계좌번호" value={accountNumber} />}
              {accountHolder && <InfoRow label="예금주" value={accountHolder} />}
              {accountGuide && <InfoRow label="안내 문구" value={accountGuide} />}
            </InfoCard>
          </div>
        </FormCard>
      </div>

      <PaymentTargetModal
        open={isPaymentTargetModalOpen}
        onOpenChange={setIsPaymentTargetModalOpen}
        selectedMemberIds={selectedMemberIds}
      />

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => goToStep(4)}
          className="bg-button-neutral hover:bg-container-neutral-interaction typo-button1 text-text-normal flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors"
        >
          <Image src={ArrowLeftIcon} alt="" width={20} height={20} />
          이전으로
        </button>
        <button
          type="button"
          onClick={handleComplete}
          className="bg-button-primary hover:bg-button-primary-interaction typo-button1 text-text-inverse flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors"
        >
          저장하고 완료하기
          <Image src={ArrowRightIcon} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

export { DuesSetupStep5 };
