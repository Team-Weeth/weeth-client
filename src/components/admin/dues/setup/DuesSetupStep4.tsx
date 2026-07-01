'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

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

interface Errors {
  accountNumber?: string;
  bankName?: string;
  accountHolder?: string;
}

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

  const [errors, setErrors] = useState<Errors>({});

  const commitStep = async () => {
    const next: Errors = {};
    if (!accountNumber.trim()) next.accountNumber = '계좌번호를 입력해주세요';
    if (!bankName.trim()) next.bankName = '은행을 입력해주세요';
    if (!accountHolder.trim()) next.accountHolder = '예금주를 입력해주세요';
    setErrors(next);
    if (Object.keys(next).length > 0) return false;
    if (accountId === null) return false;

    try {
      await saveBankAccount.mutateAsync({
        bankAccountVisible: isAccountPublic,
        bankAccount: {
          bankName: bankName.trim(),
          accountNumber: accountNumber.trim(),
          holder: accountHolder.trim(),
          guide: accountGuide.trim() || null,
        },
      });
      return true;
    } catch {
      return false;
    }
  };

  const { goNext } = useDuesStepNavigator(4, commitStep);

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
            <ScheduleTextField
              label="계좌번호"
              value={accountNumber}
              onChange={(value) => {
                setField({ accountNumber: value });
                if (errors.accountNumber)
                  setErrors((prev) => ({ ...prev, accountNumber: undefined }));
              }}
              placeholder="계좌번호를 입력해주세요"
              maxLength={20}
              error={errors.accountNumber}
              className="bg-container-neutral-alternative"
            />
            {/* TODO: 은행 선택 드롭다운 만들기 */}
            <ScheduleTextField
              label="은행"
              value={bankName}
              onChange={(value) => {
                setField({ bankName: value });
                if (errors.bankName) setErrors((prev) => ({ ...prev, bankName: undefined }));
              }}
              placeholder="ex)카카오뱅크"
              error={errors.bankName}
              className="bg-container-neutral-alternative"
            />
          </div>

          {/* 행 2: 예금주 + 안내 문구 */}
          <div className="grid grid-cols-2 gap-400">
            <ScheduleTextField
              label="예금주"
              value={accountHolder}
              onChange={(value) => {
                setField({ accountHolder: value });
                if (errors.accountHolder)
                  setErrors((prev) => ({ ...prev, accountHolder: undefined }));
              }}
              placeholder="ex)가천대 검도부"
              maxLength={HOLDER_MAX}
              error={errors.accountHolder}
              className="bg-container-neutral-alternative"
            />
            <ScheduleTextField
              label="안내 문구 (선택)"
              value={accountGuide}
              onChange={(value) => setField({ accountGuide: value })}
              placeholder="부원에게 계좌나 입금 안내를 해보세요"
              maxLength={GUIDE_MAX}
              className="bg-container-neutral-alternative"
            />
          </div>

          {/* 계좌 공개 토글 */}
          <div className="border-border flex items-center justify-between rounded-lg border p-400">
            <span className="typo-sub1 text-text-strong">멤버에게 계좌를 공개</span>
            <Switch
              checked={isAccountPublic}
              onCheckedChange={(checked) => setField({ isAccountPublic: checked })}
            />
          </div>
        </FormCard>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <PrevButton handlePrev={() => goToStep(3)} />
        <NextButton handleNext={goNext} />
      </div>
    </div>
  );
}

export { DuesSetupStep4 };
