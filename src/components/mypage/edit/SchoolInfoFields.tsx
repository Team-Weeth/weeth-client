'use client';

import type { Control, UseFormSetValue } from 'react-hook-form';
import { Controller, useFormState, useWatch } from 'react-hook-form';
import { Input } from '@/components/ui';
import { FormField } from '@/components/mypage/FormField';
import { SearchSelect } from '@/components/mypage/SearchSelect';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { FormFieldWrapper } from '@/components/auth/hub';

interface SchoolInfoFieldsProps {
  control: Control<EditProfileFormData>;
  setValue: UseFormSetValue<EditProfileFormData>;
  schools: string[];
  majors: string[];
}

function SchoolInfoFields({ control, setValue, schools, majors }: SchoolInfoFieldsProps) {
  const { errors } = useFormState({ control });
  const school = useWatch({ control, name: 'school' });
  const department = useWatch({ control, name: 'department' });

  return (
    <div className="flex flex-col gap-400">
      <FormField label="학교" error={errors.school?.message}>
        <SearchSelect
          value={school}
          onChange={(v) => setValue('school', v, { shouldValidate: true, shouldDirty: true })}
          options={schools}
          placeholder="학교 선택"
        />
      </FormField>

      <FormField label="학과" error={errors.department?.message}>
        <SearchSelect
          value={department}
          onChange={(v) => setValue('department', v, { shouldValidate: true, shouldDirty: true })}
          options={majors}
          placeholder="학과 선택"
        />
      </FormField>

      <FormFieldWrapper label="학번" error={errors.studentId?.message}>
        <Controller
          name="studentId"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              error={!!errors.studentId}
              placeholder="학번 전체를 입력해주세요"
              inputMode="numeric"
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
              className="typo-body1 rounded-lg px-400 py-300"
            />
          )}
        />
      </FormFieldWrapper>
    </div>
  );
}

export { SchoolInfoFields, type SchoolInfoFieldsProps };
