'use client';

import type { Control } from 'react-hook-form';
import { Controller } from 'react-hook-form';
import { Input } from '@/components/ui/Input';
import { Checkbox } from '@/components/ui/Checkbox';
import { FormField } from '@/components/mypage/FormField';
import { SearchSelect } from '@/components/mypage/SearchSelect';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { FormFieldWrapper } from '@/components/auth/hub/FormFieldWrapper';
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
            <div className="flex flex-col gap-200">
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
              <div className="flex items-center gap-200">
                <Controller
                  name="studentInfoPublic"
                  control={control}
                  render={({ field: publicField }) => (
                    <label className="flex w-fit shrink-0 cursor-pointer items-center gap-[6px]">
                      <Checkbox
                        checked={publicField.value}
                        onCheckedChange={(checked) => publicField.onChange(checked === true)}
                      />
                      <span className="typo-caption1 text-text-alternative">
                        부원에게 공개 (학과·학번)
                      </span>
                    </label>
                  )}
                />
                <CharacterCountRow
                  error={fieldState.error?.message}
                  value={field.value ?? ''}
                  maxLength={STUDENT_ID_MAX_LENGTH}
                  className="min-w-0 flex-1"
                />
              </div>
            </div>
          </FormFieldWrapper>
        )}
      />
    </div>
  );
}

export { SchoolInfoFields, type SchoolInfoFieldsProps };
