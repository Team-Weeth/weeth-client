'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';

import { cn } from '@/lib/cn';
import { duesBasicSchema, type DuesBasicFormData } from '@/lib/schemas/duesSetup';
import { useDuesSetupActions, useDuesSetupValues } from '@/stores/useDuesSetupStore';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useCreateDuesDraft, useDiscardDuesDraft, useSaveDuesBasic } from '@/hooks/mutations/admin';
import {
  duesRegistrationStatusQueryOptions,
  duesPaymentTargetsQueryOptions,
} from '@/hooks/queries/admin';

import { BackButton } from '@/components/admin/dues';
import {
  DuesSetupStepIndicator,
  DuesDraftAlert,
  FormCard,
  NextButton,
} from '@/components/admin/dues/setup/components';
import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';
import { useDuesStepNavigator } from '@/components/admin/dues/setup/useDuesStepNavigator';
import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';

const NAME_MAX = 30;
const DESCRIPTION_MAX = 30;

function DuesSetupStep1() {
  const { clubId } = useParams<{ clubId: string }>();
  const { goToStep } = useDuesSetupNavigation();
  const { accountId, isFreshEntry, amount, name, description } = useDuesSetupValues();
  const { setField, reset } = useDuesSetupActions();
  const { latestCardinal } = useCardinalSelector();
  const queryClient = useQueryClient();

  const createDraft = useCreateDuesDraft(clubId);
  const discardDraft = useDiscardDuesDraft(clubId, accountId);
  const saveBasic = useSaveDuesBasic(clubId, accountId);

  const {
    control,
    handleSubmit,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<DuesBasicFormData>({
    resolver: zodResolver(duesBasicSchema),
    defaultValues: { amount, name, description },
    mode: 'onChange',
  });

  // rhf → store 동기화 (persist/새로고침 복원용 — store가 소스는 아니지만 값은 계속 유지한다)
  useEffect(() => {
    const subscription = watch((values) => {
      setField({
        amount: values.amount ?? '',
        name: values.name ?? '',
        description: values.description ?? '',
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setField]);

  const [draftAlert, setDraftAlert] = useState<{
    open: boolean;
    lastModifiedByName: string | null;
  }>({ open: false, lastModifiedByName: null });

  const { mutate: createDraftMutate } = createDraft;

  // accountId가 null인 경우에만 초안 생성 API 호출 (accountId 확보 목적)
  // - Step2 이전 버튼으로 돌아온 경우: accountId가 메모리에 남아 있어 호출하지 않음
  // - 새로고침 등으로 accountId가 비워진 경우에도 accountId 확보를 위해 호출은 하되,
  //   "이어서 작성" alert는 메인에서 신규 진입(isFreshEntry)했을 때만 노출한다.
  useEffect(() => {
    if (accountId !== null || !latestCardinal) return;

    createDraftMutate(latestCardinal.cardinalNumber, {
      onSuccess: ({ accountId: id, isNew, lastModifiedByName }) => {
        setField({ accountId: id, isFreshEntry: false });
        if (!isNew && isFreshEntry) {
          setDraftAlert({ open: true, lastModifiedByName });
        }
      },
    });
  }, [accountId, isFreshEntry, latestCardinal, createDraftMutate, setField]);

  const STEP_MAP: Record<string, number> = {
    BASIC: 1,
    PAYMENT_TARGET: 2,
    CARRY_OVER: 3,
    BANK_ACCOUNT: 4,
    REVIEW: 5,
  };

  const cardinalNumber = latestCardinal?.cardinalNumber ?? 0;

  const handleContinue = async () => {
    if (accountId === null) return;
    setDraftAlert((prev) => ({ ...prev, open: false }));

    // "이어서 작성"은 사용자 인터랙션으로 트리거되는 lazy 복원이라 useQuery 대신
    // fetchQuery로 조회한다(캐시 키는 Step2/3의 useQuery와 공유).
    const status = await queryClient
      .fetchQuery(duesRegistrationStatusQueryOptions(clubId, accountId))
      .catch(() => null);
    if (!status) return;

    const { registrationStep, basic, carryOver, bankAccount } = status;

    setField({ cardinalNumber: cardinalNumber });

    if (basic) {
      const basicValues: DuesBasicFormData = {
        name: basic.name,
        amount: String(basic.duesAmount),
        description: basic.description ?? '',
      };
      setField(basicValues);
      // rhf는 defaultValues가 마운트 시 고정이므로, Step1에 머무는 경우
      // 복원 값이 입력창에 반영되도록 폼을 리셋한다.
      resetForm(basicValues);
    }

    if (carryOver) {
      setField({
        carryOverOption: carryOver.enabled ? 'carry' : 'none',
        carryOverDescription: carryOver.memo ?? '',
        carryOverInitialized: true,
      });
    }

    if (bankAccount) {
      setField({
        isAccountPublic: bankAccount.bankAccountVisible,
        bankName: bankAccount.bankAccount?.bankName ?? '',
        accountNumber: bankAccount.bankAccount?.accountNumber ?? '',
        accountHolder: bankAccount.bankAccount?.holder ?? '',
        accountGuide: bankAccount.bankAccount?.guide ?? '',
      });
    }

    // 납부 대상은 status 응답에 멤버 ID가 없어(개수만 제공) 목록 API로 별도 복원한다.
    const targetsData = await queryClient
      .fetchQuery(duesPaymentTargetsQueryOptions(clubId, accountId))
      .catch(() => null);
    if (targetsData) {
      const targetedIds = targetsData.targets.content
        .filter((t) => t.targetStatus === 'TARGETED')
        .map((t) => t.paymentTargetInfo.clubMemberId);
      setField({ selectedMemberIds: targetedIds, memberIdsInitialized: true });
    }

    const targetStep = STEP_MAP[registrationStep] ?? 1;
    if (targetStep > 1) {
      goToStep(targetStep);
    }
  };

  const commitStep = () =>
    new Promise<boolean>((resolve) => {
      handleSubmit(
        async (values) => {
          if (accountId === null) return resolve(false);
          setField({ cardinalNumber });
          try {
            await saveBasic.mutateAsync({
              name: values.name,
              duesAmount: Number(values.amount),
              description: values.description.trim(),
            });
            resolve(true);
          } catch {
            resolve(false);
          }
        },
        () => resolve(false), // 검증 실패 → 다음 단계로 이동 차단
      )();
    });

  const { goNext } = useDuesStepNavigator(1, commitStep);

  return (
    <>
      <DuesDraftAlert
        open={draftAlert.open}
        lastModifiedByName={draftAlert.lastModifiedByName}
        onContinue={() => {
          handleContinue();
        }}
        onNew={async () => {
          if (accountId === null) return;
          setDraftAlert({ open: false, lastModifiedByName: null });
          await discardDraft.mutateAsync().catch(() => {});
          reset(); // accountId → null → useEffect 재실행 → createDraft 호출
        }}
      />

      <div className="flex min-w-85 flex-col gap-700 p-700">
        {/* 헤더 */}
        <div className="flex flex-col gap-300">
          <BackButton />
          <h1 className="typo-h2 text-text-strong">{cardinalNumber}기 총 회비 설정</h1>
        </div>

        <div className="flex flex-col gap-600">
          {/* 스텝 인디케이터 */}
          <DuesSetupStepIndicator currentStep={1} />

          <FormCard title="기본 정보" step={1} description="총 회비의 기본 정보를 입력해주세요">
            {/* 필드 행: 회비금액 + 회비 이름 */}
            <div className="flex gap-400">
              {/* 1인당 회비금액 */}
              <div className="flex min-w-0 flex-1 flex-col">
                <label
                  htmlFor="dues-amount"
                  className="typo-sub3 text-text-normal flex h-12 items-center px-400"
                >
                  1인 당 회비금액
                </label>
                <Controller
                  control={control}
                  name="amount"
                  render={({ field }) => (
                    <div className="flex flex-col gap-200">
                      <div
                        className={cn(
                          'bg-container-neutral-alternative flex h-12 items-center gap-200 rounded-sm px-400',
                          errors.amount && 'ring-state-error ring-1',
                        )}
                      >
                        <input
                          id="dues-amount"
                          type="text"
                          inputMode="numeric"
                          value={field.value ? Number(field.value).toLocaleString() : ''}
                          onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                          onBlur={field.onBlur}
                          placeholder="0"
                          className={cn(
                            'typo-sub3 placeholder:text-text-alternative min-w-0 flex-1 bg-transparent focus:outline-none',
                            field.value ? 'text-text-normal' : 'text-text-alternative',
                          )}
                        />
                        <span className="typo-body1 text-text-normal shrink-0">원</span>
                      </div>
                      <div className="flex items-start px-400">
                        {errors.amount ? (
                          <span className="typo-caption2 text-state-error">
                            {errors.amount.message}
                          </span>
                        ) : (
                          <span className="typo-caption2 text-text-alternative">
                            회비 금액은 등록 후에도 수정할 수 있습니다.
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                />
              </div>

              {/* 회비 이름 */}
              <div className="min-w-0 flex-1">
                <Controller
                  control={control}
                  name="name"
                  render={({ field }) => (
                    <ScheduleTextField
                      label="회비 이름"
                      value={field.value}
                      onChange={field.onChange}
                      placeholder={`${cardinalNumber}기 정기회비`}
                      maxLength={NAME_MAX}
                      error={errors.name?.message}
                      className="bg-container-neutral-alternative"
                    />
                  )}
                />
              </div>
            </div>

            {/* 회비 설명 (선택) */}
            <Controller
              control={control}
              name="description"
              render={({ field }) => (
                <ScheduleTextField
                  label="회비 설명 (선택)"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="설명을 작성해주세요"
                  maxLength={DESCRIPTION_MAX}
                  error={errors.description?.message}
                  className="bg-container-neutral-alternative"
                />
              )}
            />
          </FormCard>
        </div>

        {/* 다음으로 버튼 */}
        <NextButton handleNext={goNext} />
      </div>
    </>
  );
}

export { DuesSetupStep1 };
