import type { Control, FieldErrors, UseFormRegister, UseFormSetValue } from 'react-hook-form';

import { Input } from '@/components/ui';
import { FormField } from '@/components/mypage/FormField';
import { formatPhone } from '@/utils/shared';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';

interface PersonalInfoFieldsProps {
  register: UseFormRegister<EditProfileFormData>;
  errors: FieldErrors<EditProfileFormData>;
  setValue: UseFormSetValue<EditProfileFormData>;
}

function PersonalInfoFields({ register, errors, setValue }: PersonalInfoFieldsProps) {
  const { onChange: telOnChange, ...telRest } = register('tel');

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue('tel', formatPhone(e.target.value), { shouldValidate: true });
    telOnChange(e);
  };

  return (
    <div className="flex flex-col gap-400">
      <FormField label="이름" error={errors.name?.message}>
        <Input {...register('name')} placeholder="이름을 입력하세요" className="rounded-lg" />
      </FormField>

      <FormField label="소개글 (선택)" hint="30자 제한" error={errors.bio?.message}>
        <Input
          {...register('bio')}
          maxLength={30}
          placeholder="소개글을 입력하세요"
          className="rounded-lg"
        />
      </FormField>

      <FormField label="연락처" error={errors.tel?.message}>
        <Input
          {...telRest}
          onChange={handlePhoneChange}
          placeholder="010-0000-0000"
          inputMode="numeric"
          className="rounded-lg"
        />
      </FormField>

      <FormField label="이메일" error={errors.email?.message}>
        <Input
          {...register('email')}
          type="email"
          autoComplete="email"
          placeholder="이메일을 입력하세요"
          className="rounded-lg"
        />
      </FormField>
    </div>
  );
}

export { PersonalInfoFields, type PersonalInfoFieldsProps };
