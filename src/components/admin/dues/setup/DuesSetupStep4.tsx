'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { duesBankAccountSchema, type DuesBankAccountFormData } from '@/lib/schemas/duesSetup';
import { BackButton } from '@/components/admin/dues';
import { Switch } from '@/components/ui';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { useSaveDuesBankAccount } from '@/hooks/mutations/admin';

import {
  DuesSetupStepIndicator,
  FormCard,
  NextButton,
  PrevButton,
} from '@/components/admin/dues/setup/components';
import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';
import { useDuesStepNavigator } from '@/components/admin/dues/setup/useDuesStepNavigator';

import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';

const HOLDER_MAX = 30;
const GUIDE_MAX = 30;

function DuesSetupStep4() {
  const { clubId } = useParams<{ clubId: string }>();
  const { goToStep } = useDuesSetupNavigation();

  const {
    accountId,
    cardinalNumber,
    accountNumber,
    bankName,
    accountHolder,
    accountGuide,
    isAccountPublic,
  } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const saveBankAccount = useSaveDuesBankAccount(clubId, accountId);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<DuesBankAccountFormData>({
    resolver: zodResolver(duesBankAccountSchema),
    defaultValues: { accountNumber, bankName, accountHolder, accountGuide, isAccountPublic },
    mode: 'onChange',
  });

  // rhf → store 동기화 (persist/새로고침 복원용)
  useEffect(() => {
    const subscription = watch((values) => {
      setField({
        accountNumber: values.accountNumber ?? '',
        bankName: values.bankName ?? '',
        accountHolder: values.accountHolder ?? '',
        accountGuide: values.accountGuide ?? '',
        isAccountPublic: values.isAccountPublic ?? false,
      });
    });
    return () => subscription.unsubscribe();
  }, [watch, setField]);

  const commitStep = () =>
    new Promise<boolean>((resolve) => {
      handleSubmit(
        async (values) => {
          if (accountId === null) return resolve(false);
          try {
            await saveBankAccount.mutateAsync({
              bankAccountVisible: values.isAccountPublic,
              bankAccount: {
                bankName: values.bankName,
                accountNumber: values.accountNumber,
                holder: values.accountHolder,
                guide: values.accountGuide.trim() || null,
              },
            });
            resolve(true);
          } catch {
            resolve(false);
          }
        },
        () => resolve(false), // 검증 실패 → 다음 단계로 이동 차단
      )();
    });

  const { goNext, isEditMode } = useDuesStepNavigator(4, commitStep);

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{cardinalNumber}기 총 회비 설정</h1>
      </div>

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator currentStep={4} />

        <FormCard
          title="계좌 공개"
          step={4}
          description="입금 계좌 정보를 입력하고, 공개 여부를 설정해주세요"
        >
          {/* 행 1: 계좌번호 + 은행 */}
          <div className="grid grid-cols-2 gap-400">
            <Controller
              control={control}
              name="accountNumber"
              render={({ field }) => (
                <ScheduleTextField
                  label="계좌번호"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="계좌번호를 입력해주세요"
                  maxLength={20}
                  error={errors.accountNumber?.message}
                  className="bg-container-neutral-alternative"
                />
              )}
            />
            {/* TODO: 은행 선택 드롭다운 만들기 */}
            <Controller
              control={control}
              name="bankName"
              render={({ field }) => (
                <ScheduleTextField
                  label="은행"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="ex)카카오뱅크"
                  error={errors.bankName?.message}
                  className="bg-container-neutral-alternative"
                />
              )}
            />
          </div>

          {/* 행 2: 예금주 + 안내 문구 */}
          <div className="grid grid-cols-2 gap-400">
            <Controller
              control={control}
              name="accountHolder"
              render={({ field }) => (
                <ScheduleTextField
                  label="예금주"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="ex)가천대 검도부"
                  maxLength={HOLDER_MAX}
                  error={errors.accountHolder?.message}
                  className="bg-container-neutral-alternative"
                />
              )}
            />
            <Controller
              control={control}
              name="accountGuide"
              render={({ field }) => (
                <ScheduleTextField
                  label="안내 문구 (선택)"
                  value={field.value}
                  onChange={field.onChange}
                  placeholder="부원에게 계좌나 입금 안내를 해보세요"
                  maxLength={GUIDE_MAX}
                  error={errors.accountGuide?.message}
                  className="bg-container-neutral-alternative"
                />
              )}
            />
          </div>

          {/* 계좌 공개 토글 */}
          <div className="border-border flex items-center justify-between rounded-lg border p-400">
            <span className="typo-sub1 text-text-strong">멤버에게 계좌를 공개</span>
            <Controller
              control={control}
              name="isAccountPublic"
              render={({ field }) => (
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              )}
            />
          </div>
        </FormCard>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <PrevButton handlePrev={() => goToStep(3)} />
        <NextButton handleNext={goNext} editMode={isEditMode} />
      </div>
    </div>
  );
}

export { DuesSetupStep4 };
