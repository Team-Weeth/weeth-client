'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { ArrowDownIcon, TooltipIcon } from '@/assets/icons';
import { Button, Icon, Input, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { cn } from '@/lib/cn';
import { createClubSchema, type CreateClubFormData } from '@/lib/schemas/createClub';
import { formatPhone } from '@/utils';

import { FieldError, FieldLabel, FormFieldWrapper } from './FormFieldWrapper';

function CreateClubForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<CreateClubFormData>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      school: '',
      name: '',
      description: '',
      generation: '',
      phone: '',
      email: '',
      contactType: 'phone',
    },
    mode: 'onBlur',
  });

  const school = useWatch({ control, name: 'school' });
  const contactType = useWatch({ control, name: 'contactType' });

  const router = useRouter();

  function onSubmit(_data: CreateClubFormData) {
    router.push('/hub/loading');
  }

  return (
    <div className="mx-auto flex w-full max-w-145 flex-col px-400 pt-450 pb-600">
      <div className="mb-600 flex flex-col gap-200">
        <h1 className="typo-sub1 text-text-strong">동아리 정보 입력</h1>
        <p className="typo-body2 text-text-alternative">
          동아리의 기본 정보를 입력하면
          <br />
          우리 동아리만의 사이트를 바로 개설할 수 있어요.
        </p>
      </div>

      <form className="flex flex-col gap-400" onSubmit={handleSubmit(onSubmit)}>
        {/* 소속 학교 */}
        <FormFieldWrapper label="소속 학교" error={errors.school?.message}>
          <div className="relative">
            <select
              {...register('school')}
              autoComplete="organization"
              className={cn(
                'bg-container-neutral typo-body2 w-full cursor-pointer appearance-none',
                'rounded-lg border border-transparent px-300 py-200',
                'focus:border-brand-primary focus:outline-none',
                'transition-colors',
                school ? 'text-text-normal' : 'text-text-alternative',
              )}
            >
              <option value="" disabled>
                학교
              </option>
            </select>
            <div className="text-icon-alternative pointer-events-none absolute top-1/2 right-300 -translate-y-1/2">
              <Icon src={ArrowDownIcon} size={12} alt="" className="text-text-normal" />
            </div>
          </div>
        </FormFieldWrapper>

        {/* 동아리 이름 */}
        <FormFieldWrapper label="동아리 이름" error={errors.name?.message}>
          <Input {...register('name')} clearable className="rounded-lg px-400 py-300" />
        </FormFieldWrapper>

        {/* 동아리 소개 */}
        <FormFieldWrapper label="동아리 소개" error={errors.description?.message}>
          <Input
            {...register('description')}
            maxLength={30}
            clearable
            className="rounded-lg px-400 py-300"
          />
          <span className="typo-caption2 text-text-alternative">30자 제한</span>
        </FormFieldWrapper>

        {/* 동아리 기수 */}
        <div className="flex flex-col gap-200">
          <div className="flex items-center gap-100">
            <FieldLabel>동아리 기수</FieldLabel>
            <Tooltip>
              <TooltipTrigger asChild>
                <button type="button" className="flex items-center">
                  <Icon
                    src={TooltipIcon}
                    size={16}
                    className="text-icon-disabled"
                    alt="기수 안내"
                  />
                </button>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start">
                기수는 동아리 멤버 관리와 출석 기록에 사용됩니다.
                <br />
                현재 또는 지금까지 운영한 기수만 입력해주세요.
              </TooltipContent>
            </Tooltip>
          </div>
          <Input
            {...register('generation')}
            placeholder="예 : 10"
            clearable
            className="rounded-lg px-400 py-300"
          />
          <FieldError message={errors.generation?.message} />
        </div>

        {/* 대표 전화번호 */}
        <FormFieldWrapper label="대표 전화번호" error={errors.phone?.message}>
          <Controller
            name="phone"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="tel"
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
                clearable
                className="rounded-lg px-400 py-300"
              />
            )}
          />
        </FormFieldWrapper>

        {/* 대표 이메일 (선택) */}
        <FormFieldWrapper label="대표 이메일 (선택)" error={errors.email?.message}>
          <Input
            {...register('email')}
            type="email"
            clearable
            spellCheck={false}
            className="rounded-lg px-400 py-300"
          />
        </FormFieldWrapper>

        {/* 주 연락처 */}
        <FormFieldWrapper label="주 연락처">
          <div className="flex gap-200">
            {(['phone', 'email'] as const).map((type) => (
              <label key={type} className="flex cursor-pointer items-center gap-200">
                <input
                  type="radio"
                  value={type}
                  checked={contactType === type}
                  {...register('contactType')}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                    contactType === type ? 'border-brand-primary' : 'border-text-alternative',
                  )}
                >
                  {contactType === type && (
                    <div className="bg-brand-primary h-2.5 w-2.5 rounded-full" />
                  )}
                </div>
                <span className="typo-body2 text-text-normal">
                  {type === 'phone' ? '전화번호' : '이메일'}
                </span>
              </label>
            ))}
          </div>
        </FormFieldWrapper>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          disabled={!isValid}
          className="mt-600 w-full"
        >
          사이트 개설하기
        </Button>
      </form>
    </div>
  );
}

export { CreateClubForm };
