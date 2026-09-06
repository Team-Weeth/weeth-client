'use client';

import type { Control } from 'react-hook-form';
import { Controller, useFormState } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { FormField } from '@/components/mypage/FormField';
import { formatPhone } from '@/utils/shared';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { FormFieldWrapper } from '@/components/auth/hub/FormFieldWrapper';

interface PersonalInfoFieldsProps {
  control: Control<EditProfileFormData>;
}

function PersonalInfoFields({ control }: PersonalInfoFieldsProps) {
  const { errors } = useFormState({ control });
  return (
    <div className="flex flex-col gap-400">
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
