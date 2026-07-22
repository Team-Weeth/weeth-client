'use client';

import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui';
import { FormField } from '@/components/mypage/FormField';
import { SearchSelect } from '@/components/mypage/SearchSelect';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { FormFieldWrapper } from '@/components/auth/hub';
import { CharacterCountRow } from '@/components/mypage/CharacterCountRow';

const STUDENT_ID_MAX_LENGTH = 20;

interface SchoolInfoFieldsProps {
  control: Control<EditProfileFormData>;
  schools: string[];
  majors: string[];
}

function SchoolInfoFields({ control, schools, majors }: SchoolInfoFieldsProps) {
  return (
    <div className="flex flex-col gap-400">
      <Controller
        name="school"
        control={control}
        render={({ field, fieldState }) => (
          <FormField label="학교" error={fieldState.error?.message}>
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
        render={({ field, fieldState }) => (
          <FormField label="학과" error={fieldState.error?.message}>
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
          <FormFieldWrapper label="학번">
            <div className="flex flex-col gap-100">
              <Input
                {...field}
                value={field.value ?? ''}
                error={!!fieldState.error}
                placeholder="학번 전체를 입력해주세요"
                maxLength={STUDENT_ID_MAX_LENGTH}
                inputMode="numeric"
                onChange={(e) =>
                  field.onChange(e.target.value.replace(/\D/g, '').slice(0, STUDENT_ID_MAX_LENGTH))
                }
                className="typo-body1 rounded-lg px-400 py-300"
              />
              <CharacterCountRow
                error={fieldState.error?.message}
                value={field.value ?? ''}
                maxLength={STUDENT_ID_MAX_LENGTH}
              />
            </div>
          </FormFieldWrapper>
        )}
      />
    </div>
  );
}

export { SchoolInfoFields, type SchoolInfoFieldsProps };
