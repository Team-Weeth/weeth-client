'use client';

import { useState } from 'react';

import Image from 'next/image';
import { useRouter, useParams } from 'next/navigation';

import { ArrowRightIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import { useDuesSetupActions, useDuesSetupValues } from '@/stores/useDuesSetupStore';

import { DuesSetupStepIndicator } from './DuesSetupStepIndicator';
import { BackButton } from '../BackButton';

const NAME_MAX = 30;
const DESCRIPTION_MAX = 30;

function DuesSetupStep1() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { amount, name, description, generationNumber } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const [errors, setErrors] = useState<{ amount?: string; name?: string }>({});

  const handleNext = () => {
    const next: { amount?: string; name?: string } = {};
    if (!amount || Number(amount) === 0) next.amount = '회비 금액을 입력해주세요';
    if (!name.trim()) next.name = '회비 이름을 입력해주세요';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    router.push(`/${clubId}/admin/dues/setup/2`);
  };

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{generationNumber}기 총 회비 설정</h1>
      </div>

      <div className="flex flex-col gap-600">
        {/* 스텝 인디케이터 */}
        <DuesSetupStepIndicator currentStep={1} />

        {/* 폼 카드 */}
        <div className="bg-container-neutral flex flex-col gap-600 rounded-lg px-400 py-450">
          {/* 섹션 헤더 */}
          <div className="flex flex-col gap-200">
            <span className="typo-caption1 text-text-alternative">기본 정보 (1/5)</span>
            <h2 className="typo-h3 text-text-normal">총 회비의 기본 정보를 입력해주세요</h2>
          </div>

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
                    className="typo-sub3 placeholder:text-text-alternative text-text-alternative min-w-0 flex-1 bg-transparent focus:outline-none"
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
            <div className="flex min-w-0 flex-1 flex-col">
              <label
                htmlFor="dues-name"
                className="typo-sub3 text-text-normal flex h-12 items-center px-400"
              >
                회비 이름
              </label>
              <div className="flex flex-col gap-200">
                <input
                  id="dues-name"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setField({ name: e.target.value.slice(0, NAME_MAX) });
                    if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                  }}
                  placeholder={`${generationNumber}기 정기회비`}
                  className={cn(
                    'bg-container-neutral-alternative typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none',
                    errors.name && 'ring-state-error ring-1',
                  )}
                />
                <div className="flex items-center justify-between px-400">
                  {errors.name ? (
                    <span className="typo-caption2 text-state-error">{errors.name}</span>
                  ) : (
                    <span />
                  )}
                  <span className="typo-caption2 text-text-alternative ml-auto">
                    {name.length}/{NAME_MAX}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 회비 설명 (선택) */}
          <div className="flex flex-col">
            <label
              htmlFor="dues-description"
              className="typo-sub3 text-text-normal flex h-12 items-center px-400"
            >
              회비 설명 (선택)
            </label>
            <div className="flex flex-col gap-200">
              <input
                id="dues-description"
                type="text"
                value={description}
                onChange={(e) =>
                  setField({ description: e.target.value.slice(0, DESCRIPTION_MAX) })
                }
                placeholder="설명을 작성해주세요"
                className="bg-container-neutral-alternative typo-body1 placeholder:text-text-alternative text-text-normal h-12 w-full rounded-sm px-400 py-300 focus:outline-none"
              />
              <div className="flex items-center justify-end px-400">
                <span className="typo-caption2 text-text-alternative">
                  {description.length}/{DESCRIPTION_MAX}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 다음으로 버튼 */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={handleNext}
          className="bg-button-primary hover:bg-button-primary-interaction typo-button1 text-text-inverse flex cursor-pointer items-center gap-100 rounded-md px-400 py-300 transition-colors"
        >
          다음으로
          <Image src={ArrowRightIcon} alt="" width={20} height={20} />
        </button>
      </div>
    </div>
  );
}

export { DuesSetupStep1 };
