'use client';

import type { Control, UseFormRegister } from 'react-hook-form';
import { Controller, useFormState } from 'react-hook-form';
import { Input } from '@/components/ui';
import { FormField } from '@/components/mypage/FormField';
import { formatPhone } from '@/utils/shared';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { FormFieldWrapper } from '@/components/auth/hub';

interface PersonalInfoFieldsProps {
  register: UseFormRegister<EditProfileFormData>;
  control: Control<EditProfileFormData>;
}

function PersonalInfoFields({ register, control }: PersonalInfoFieldsProps) {
  const { errors } = useFormState({ control });
  return (
    <div className="flex flex-col gap-400">
      <FormFieldWrapper label="이름" error={errors.name?.message}>
        <Input
          {...register('name')}
          error={!!errors.name}
          placeholder="이름을 입력하세요"
          className="typo-body1 rounded-lg px-400 py-300"
        />
      </FormFieldWrapper>

      <FormField label="소개글 (선택)" hint="30자 제한" error={errors.bio?.message}>
        <Input
          {...register('bio')}
          error={!!errors.bio}
          maxLength={30}
          placeholder="소개글을 입력하세요"
          className="typo-body1 rounded-lg px-400 py-300"
        />
      </FormField>

      <FormFieldWrapper label="연락처" error={errors.phone?.message}>
        <Controller
          name="phone"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="tel"
              onChange={(e) => field.onChange(formatPhone(e.target.value))}
              className="typo-body1 rounded-lg px-400 py-300"
              placeholder="010-0000-0000"
            />
          )}
        />
      </FormFieldWrapper>

      <FormField label="이메일" error={errors.email?.message}>
        <Input
          {...register('email')}
          error={!!errors.email}
          type="email"
          autoComplete="email"
          placeholder="이메일을 입력하세요"
          className="typo-body1 rounded-lg px-400 py-300"
        />
      </FormField>
    </div>
  );
}

export { PersonalInfoFields, type PersonalInfoFieldsProps };
