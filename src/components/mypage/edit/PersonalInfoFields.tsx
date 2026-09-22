'use client';

import type { Control } from 'react-hook-form';
import { Controller, useFormState } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
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
        <div className="flex flex-col gap-200">
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
          <Controller
            name="telPublic"
            control={control}
            render={({ field }) => (
              <label className="flex w-fit cursor-pointer items-center gap-[6px]">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <span className="typo-caption1 text-text-alternative">부원에게 공개</span>
              </label>
            )}
          />
        </div>
      </FormFieldWrapper>

      <FormField label="이메일" error={errors.email?.message}>
        <div className="flex flex-col gap-200">
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
          <Controller
            name="emailPublic"
            control={control}
            render={({ field }) => (
              <label className="flex w-fit cursor-pointer items-center gap-[6px]">
                <Checkbox
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                />
                <span className="typo-caption1 text-text-alternative">부원에게 공개</span>
              </label>
            )}
          />
        </div>
      </FormField>
    </div>
  );
}

export { PersonalInfoFields, type PersonalInfoFieldsProps };
