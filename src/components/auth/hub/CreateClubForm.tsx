'use client';

import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm, useWatch } from 'react-hook-form';

import { TooltipIcon } from '@/assets/icons';
import { Button, Icon, Input, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui';
import { SearchSelect } from '@/components/mypage';
import { cn } from '@/lib/cn';
import { createClubSchema, type CreateClubFormData } from '@/lib/schemas/createClub';
import {
  useCreateClubDraftActions,
  useCreateClubDraftValues,
} from '@/stores/useCreateClubDraftStore';
import { formatPhone } from '@/utils/shared';

import { ClubCreatingPage } from './ClubCreatingPage';
import { FieldError, FieldLabel, FormFieldWrapper } from './FormFieldWrapper';

interface CreateClubFormProps {
  schoolNames: string[];
  schoolLoadError?: boolean;
}

function CreateClubForm({ schoolNames, schoolLoadError = false }: CreateClubFormProps) {
  const [isCreating, setIsCreating] = useState(false);

  const {
    school: schoolDraft,
    name: nameDraft,
    description: descriptionDraft,
    generation: generationDraft,
    phone: phoneDraft,
    email: emailDraft,
    contactType: contactTypeDraft,
  } = useCreateClubDraftValues();
  const { setDraft } = useCreateClubDraftActions();

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateClubFormData>({
    resolver: zodResolver(createClubSchema),
    defaultValues: {
      school: schoolDraft,
      name: nameDraft,
      description: descriptionDraft,
      generation: generationDraft,
      phone: phoneDraft,
      email: emailDraft,
      contactType: contactTypeDraft,
    },
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const contactType = useWatch({ control, name: 'contactType' });

  useEffect(() => {
    const subscription = watch((values) => {
      setDraft({
        school: values.school ?? '',
        name: values.name ?? '',
        description: values.description ?? '',
        generation: values.generation ?? '',
        phone: values.phone ?? '',
        email: values.email ?? '',
        contactType: values.contactType ?? 'phone',
      });
    });

    return () => subscription.unsubscribe();
  }, [setDraft, watch]);

  function onSubmit(data: CreateClubFormData) {
    setIsCreating(true);
  }

  if (isCreating) {
    return <ClubCreatingPage intent="create" onCancel={() => setIsCreating(false)} />;
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
          {schoolLoadError && (
            <div className="mb-200 flex items-center justify-between gap-200 rounded-lg bg-background-2 px-300 py-200">
              <p className="typo-caption2 text-text-alternative">
                학교 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.
              </p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => window.location.reload()}
              >
                다시 시도
              </Button>
            </div>
          )}
          <Controller
            name="school"
            control={control}
            render={({ field }) => (
              <SearchSelect
                value={field.value}
                onChange={field.onChange}
                options={schoolNames}
                placeholder={
                  schoolLoadError ? '학교 목록을 불러오지 못했습니다' : '학교명을 검색하세요'
                }
              />
            )}
          />
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
          <Controller
            name="generation"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="예 : 10"
                clearable
                onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
                className="rounded-lg px-400 py-300"
              />
            )}
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
            name="email"
            autoComplete="email"
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
