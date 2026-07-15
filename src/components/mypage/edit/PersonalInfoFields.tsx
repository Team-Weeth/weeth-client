'use client';

import type { Control } from 'react-hook-form';
import { Controller, useFormState } from 'react-hook-form';
import { Input } from '@/components/ui';
import { FormField } from '@/components/mypage/FormField';
import { formatPhone } from '@/utils/shared';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { FormFieldWrapper } from '@/components/auth/hub';

interface PersonalInfoFieldsProps {
  control: Control<EditProfileFormData>;
}

function CharacterCountRow({ error, value }: { error?: string; value: string }) {
  return (
    <div className="grid min-h-4 grid-cols-[minmax(0,1fr)_auto] items-start gap-200">
      <div className="min-w-0">
        {error ? (
          <span className="typo-caption2 text-state-error block truncate">{error}</span>
        ) : null}
      </div>
      <span className="typo-caption2 text-text-alternative shrink-0 text-right">
        {value.length}/30
      </span>
    </div>
  );
}

function PersonalInfoFields({ control }: PersonalInfoFieldsProps) {
  const { errors } = useFormState({ control });
  return (
    <div className="flex flex-col gap-400">
      <FormFieldWrapper label="이름">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <>
              <Input
                {...field}
                value={field.value ?? ''}
                error={!!errors.name}
                placeholder="이름을 입력하세요"
                maxLength={30}
                className="typo-body1 rounded-lg px-400 py-300"
              />
              <CharacterCountRow error={errors.name?.message} value={field.value ?? ''} />
            </>
          )}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="소개글 (선택)">
        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <>
              <Input
                {...field}
                value={field.value ?? ''}
                error={!!errors.bio}
                maxLength={30}
                placeholder="소개글을 입력하세요"
                className="typo-body1 rounded-lg px-400 py-300"
              />
              <CharacterCountRow error={errors.bio?.message} value={field.value ?? ''} />
            </>
          )}
        />
      </FormFieldWrapper>

      <FormFieldWrapper label="연락처" error={errors.phone?.message}>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ''}
              error={!!errors.phone}
              type="tel"
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
              className="typo-body1 rounded-lg px-400 py-300"
              placeholder="010-0000-0000"
            />
          )}
        />
      </FormFieldWrapper>

      <FormField label="이메일" error={errors.email?.message}>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              value={field.value ?? ''}
              error={!!errors.email}
              type="email"
              autoComplete="email"
              placeholder="이메일을 입력하세요"
              className="typo-body1 rounded-lg px-400 py-300"
            />
          )}
        />
      </FormField>
    </div>
  );
}

export { PersonalInfoFields, type PersonalInfoFieldsProps };
