'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';

import { duesBasicSchema, type DuesBasicFormData } from '@/lib/schemas/duesSetup';
import { useDuesSetupActions, useDuesSetupValues } from '@/stores/useDuesSetupStore';
import { toastError } from '@/stores/useToastStore';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useSyncFormToStore } from '@/hooks/useSyncFormToStore';
import { useCreateDuesDraft, useDiscardDuesDraft, useSaveDuesBasic } from '@/hooks/mutations/admin';

import { DuesAmountField } from '@/components/admin/dues/setup/components/DuesAmountField';
import { DuesSetupStep1Skeleton } from '@/components/admin/dues/setup/components/DuesSetupStepSkeleton';
import { DuesSetupStepIndicator } from '@/components/admin/dues/setup/components/DuesSetupStepIndicator';
import { FormCard } from '@/components/admin/dues/setup/components/FormCard';
import { NextButton } from '@/components/admin/dues/setup/components/NextButton';
import { SetupHeader } from '@/components/admin/dues/setup/components/SetupHeader';
import { useDuesStepNavigator } from '@/hooks/admin/useDuesStepNavigator';
import { useRestoreDuesDraft } from '@/hooks/admin/useRestoreDuesDraft';
import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';
import { AlertDialog } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/Button';

const NAME_MAX = 30;
const DESCRIPTION_MAX = 30;

function DuesSetupStep1() {
  const { clubId } = useParams<{ clubId: string }>();
  const { accountId, isFreshEntry, amount, name, description } = useDuesSetupValues();
  const { setField, reset } = useDuesSetupActions();
  const { activeCardinal } = useCardinalSelector({ autoSelectLatest: true, scope: 'dues' });

  const createDraft = useCreateDuesDraft(clubId);
  const discardDraft = useDiscardDuesDraft(clubId, accountId);
  const saveBasic = useSaveDuesBasic(clubId, accountId, {
    onError: () => toastError('기본 정보 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'),
  });

  const {
    control,
    handleSubmit,
    watch,
    reset: resetForm,
    formState: { errors },
  } = useForm<DuesBasicFormData>({
    resolver: zodResolver(duesBasicSchema),
    // defaultValues(마운트 1회 스냅샷) 대신 values로 store를 반응형 구독한다.
    // persist hydration이 첫 렌더보다 늦게 도착해도 폼이 store 값으로 갱신되므로
    // 새로고침 시 입력값(회비금액/이름/설명)이 유지된다.
    // keepDirtyValues: 사용자가 편집 중인 필드는 store 왕복 갱신으로 덮어쓰지 않는다.
    values: { amount, name, description },
    resetOptions: { keepDirtyValues: true },
    mode: 'onChange',
  });

  // rhf → store 동기화 (persist/새로고침 복원용 — store가 소스는 아니지만 값은 계속 유지한다)
  useSyncFormToStore(watch, (values) => {
    setField({
      amount: values.amount ?? '',
      name: values.name ?? '',
      description: values.description ?? '',
    });
  });

  const [draftAlert, setDraftAlert] = useState<{
    open: boolean;
    lastModifiedByName: string | null;
  }>({ open: false, lastModifiedByName: null });

  const { mutate: createDraftMutate } = createDraft;

  // accountId가 null인 경우에만 초안 생성 API 호출 (accountId 확보 목적)
  // - Step2 이전 버튼으로 돌아온 경우: accountId가 메모리에 남아 있어 호출하지 않음
  // - 새로고침 등으로 accountId가 비워진 경우에도 accountId 확보를 위해 호출은 하되,
  //   "이어서 작성" alert는 메인에서 신규 진입(isFreshEntry)했을 때만 노출
  useEffect(() => {
    if (accountId !== null || !activeCardinal) return;

    createDraftMutate(activeCardinal.cardinalNumber, {
      onSuccess: ({ accountId: id, isNew, lastModifiedByName }) => {
        setField({ accountId: id, isFreshEntry: false });
        if (!isNew && isFreshEntry) {
          setDraftAlert({ open: true, lastModifiedByName });
        }
      },
    });
  }, [accountId, isFreshEntry, activeCardinal, createDraftMutate, setField]);

  const cardinalNumber = activeCardinal?.cardinalNumber ?? 0;

  const restoreDraft = useRestoreDuesDraft(clubId, accountId, cardinalNumber);

  const handleContinue = async () => {
    setDraftAlert((prev) => ({ ...prev, open: false }));
    // rhf는 defaultValues가 마운트 시 고정이므로, Step1에 머무는 경우
    // 복원한 기본 정보가 입력창에 반영되도록 폼을 리셋한다.
    await restoreDraft({ onBasicRestored: (values) => resetForm(values) });
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

  const { goNext, isEditMode } = useDuesStepNavigator(1, commitStep);

  // 기수 정보가 확정되기 전에는 스켈레톤을 노출한다.
  if (!activeCardinal) return <DuesSetupStep1Skeleton />;

  return (
    <>
      <AlertDialog
        open={draftAlert.open}
        title="이어서 작성할까요?"
        description={
          draftAlert.lastModifiedByName != null
            ? `작성 중인 내용이 있어요.\n(이전 작성자 : ${draftAlert.lastModifiedByName})`
            : '작성 중인 내용이 있어요.'
        }
      >
        <div className="border-line flex flex-col gap-200 border-t">
          <Button
            variant="primary"
            size="lg"
            className="w-full"
            onClick={() => {
              handleContinue();
            }}
          >
            이어서 작성하기
          </Button>
          <Button
            variant="secondary"
            size="lg"
            className="w-full"
            onClick={async () => {
              if (accountId === null) return;
              setDraftAlert({ open: false, lastModifiedByName: null });
              await discardDraft.mutateAsync().catch(() => {});
              reset(); // accountId → null → useEffect 재실행 → createDraft 호출
            }}
          >
            새로 작성하기
          </Button>
        </div>
      </AlertDialog>

      <div className="flex min-w-85 flex-col gap-700 p-700">
        {/* 헤더 */}
        <SetupHeader cardinalNumber={cardinalNumber} />

        <div className="flex flex-col gap-600">
          {/* 스텝 인디케이터 */}
          <DuesSetupStepIndicator currentStep={1} />

          <FormCard title="기본 정보" step={1} description="총 회비의 기본 정보를 입력해주세요">
            {/* 필드 행: 회비금액 + 회비 이름 */}
            <div className="flex gap-400">
              {/* 1인당 회비금액 */}
              <Controller
                control={control}
                name="amount"
                render={({ field }) => (
                  <DuesAmountField
                    id="dues-amount"
                    label="1인 당 회비금액"
                    className="flex-1"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    error={errors.amount?.message}
                    helperText="회비 금액은 등록 후에도 수정할 수 있습니다."
                  />
                )}
              />

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
        <NextButton handleNext={goNext} editMode={isEditMode} disabled={saveBasic.isPending} />
      </div>
    </>
  );
}

export { DuesSetupStep1 };
