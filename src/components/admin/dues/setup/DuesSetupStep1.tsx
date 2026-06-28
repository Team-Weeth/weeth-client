'use client';

import { useState } from 'react';

import { cn } from '@/lib/cn';
import { useDuesSetupActions, useDuesSetupValues } from '@/stores/useDuesSetupStore';

import { BackButton } from '@/components/admin/dues';
import {
  DuesSetupStepIndicator,
  FormCard,
  NextButton,
} from '@/components/admin/dues/setup/components';
import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';
import { ScheduleTextField } from '@/components/admin/schedule/general/ScheduleTextField';

const NAME_MAX = 30;
const DESCRIPTION_MAX = 30;

function DuesSetupStep1() {
  const { goToStep } = useDuesSetupNavigation();
  const { amount, name, description, cardinalNumber } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const [errors, setErrors] = useState<{ amount?: string; name?: string }>({});

  const handleNext = () => {
    const next: { amount?: string; name?: string } = {};
    if (!amount || Number(amount) === 0) next.amount = '회비 금액을 입력해주세요';
    if (!name.trim()) next.name = '회비 이름을 입력해주세요';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    goToStep(2);
  };

  return (
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
                    value={amount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, '');
                      setField({ amount: raw });
                      if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                    }}
                    placeholder="0"
                    className={cn(
                      'typo-sub3 placeholder:text-text-alternative min-w-0 flex-1 bg-transparent focus:outline-none',
                      amount ? 'text-text-normal' : 'text-text-alternative',
                    )}
                  />
                  <span className="typo-body1 text-text-normal shrink-0">원</span>
                </div>
                <div className="flex items-start px-400">
                  {errors.amount ? (
                    <span className="typo-caption2 text-state-error">{errors.amount}</span>
                  ) : (
                    <span className="typo-caption2 text-text-alternative">
                      회비 금액은 등록 후에도 수정할 수 있습니다.
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* 회비 이름 */}
            <div className="min-w-0 flex-1">
              <ScheduleTextField
                label="회비 이름"
                value={name}
                onChange={(value) => {
                  setField({ name: value });
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder={`${cardinalNumber}기 정기회비`}
                maxLength={NAME_MAX}
                error={errors.name}
                className="bg-container-neutral-alternative"
              />
            </div>
          </div>

          {/* 회비 설명 (선택) */}
          <ScheduleTextField
            label="회비 설명 (선택)"
            value={description}
            onChange={(value) => setField({ description: value })}
            placeholder="설명을 작성해주세요"
            maxLength={DESCRIPTION_MAX}
            className="bg-container-neutral-alternative"
          />
        </FormCard>
      </div>

      {/* 다음으로 버튼 */}
      <NextButton handleNext={handleNext} />
    </div>
  );
}

export { DuesSetupStep1 };
