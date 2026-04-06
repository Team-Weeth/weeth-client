'use client';

import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

import { Input } from '@/components/ui';
import { FormField } from '@/components/mypage/FormField';
import { SearchSelect } from '@/components/mypage/SearchSelect';
import { useSchoolsQuery } from '@/hooks/queries/mypage/useSchoolsQuery';
import { useMajorsQuery } from '@/hooks/queries/mypage/useMajorsQuery';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';

interface SchoolInfoFieldsProps {
  register: UseFormRegister<EditProfileFormData>;
  control: Control<EditProfileFormData>;
  errors: FieldErrors<EditProfileFormData>;
  setValue: UseFormSetValue<EditProfileFormData>;
}

function SchoolInfoFields({ register, control, errors, setValue }: SchoolInfoFieldsProps) {
  const school = useWatch({ control, name: 'school' });
  const department = useWatch({ control, name: 'department' });
  const { data: schools = [] } = useSchoolsQuery();
  const { data: majors = [] } = useMajorsQuery();
  const schoolNames = schools.map((s) => s.schoolName);
  const majorNames = majors.map((m) => m.majorName);

  return (
    <div className="flex flex-col gap-400">
      <FormField label="학교" error={errors.school?.message}>
        <SearchSelect
          value={school}
          onChange={(v) => setValue('school', v, { shouldValidate: true })}
          options={schoolNames}
          placeholder="학교 선택"
        />
      </FormField>

      <FormField label="학과" error={errors.department?.message}>
        <SearchSelect
          value={department}
          onChange={(v) => setValue('department', v, { shouldValidate: true })}
          options={majorNames}
          placeholder="학과 선택"
        />
      </FormField>

      <FormField label="학번" error={errors.studentId?.message}>
        <Input
          {...register('studentId')}
          placeholder="학번을 입력하세요"
          inputMode="numeric"
          onInput={(e) => {
            const target = e.currentTarget;
            target.value = target.value.replace(/\D/g, '');
          }}
          className="rounded-lg"
        />
      </FormField>
    </div>
  );
}

export { SchoolInfoFields, type SchoolInfoFieldsProps };
