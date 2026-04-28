'use client';

import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui';
import { FormField } from '@/components/mypage/FormField';
import { SearchSelect } from '@/components/mypage/SearchSelect';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { FormFieldWrapper } from '@/components/auth/hub';

interface SchoolInfoFieldsProps {
  control: Control<EditProfileFormData>;
  schools: string[];
  majors: string[];
  schoolError?: string;
  departmentError?: string;
}

function SchoolInfoFields({
  control,
  schools,
  majors,
  schoolError,
  departmentError,
}: SchoolInfoFieldsProps) {
  return (
    <div className="flex flex-col gap-400">
      <Controller
        name="school"
        control={control}
        rules={{
          validate: (value) => schools.includes(value) || '학교를 선택해주세요',
        }}
        render={({ field, fieldState }) => (
          <FormField label="학교" error={schoolError ?? fieldState.error?.message}>
            <SearchSelect
              value={field.value ?? ''}
              onChange={field.onChange}
              options={schools}
              placeholder="학교 선택"
            />
          </FormField>
        )}
      />

      <Controller
        name="department"
        control={control}
        rules={{
          validate: (value) => majors.includes(value) || '학과를 선택해주세요',
        }}
        render={({ field, fieldState }) => (
          <FormField label="학과" error={departmentError ?? fieldState.error?.message}>
            <SearchSelect
              value={field.value ?? ''}
              onChange={field.onChange}
              options={majors}
              placeholder="학과 선택"
            />
          </FormField>
        )}
      />

      <Controller
        name="studentId"
        control={control}
        render={({ field, fieldState }) => (
          <FormFieldWrapper label="학번" error={fieldState.error?.message}>
            <Input
              {...field}
              value={field.value ?? ''}
              error={!!fieldState.error}
              placeholder="학번 전체를 입력해주세요"
              inputMode="numeric"
              onChange={(e) => field.onChange(e.target.value.replace(/\D/g, ''))}
              className="typo-body1 rounded-lg px-400 py-300"
            />
          </FormFieldWrapper>
        )}
      />
    </div>
  );
}

export { SchoolInfoFields, type SchoolInfoFieldsProps };
