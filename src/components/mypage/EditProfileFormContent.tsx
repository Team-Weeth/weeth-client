'use client';

import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import { FormFieldWrapper } from '@/components/auth/hub';
import { MYPAGE_PROFILE_TEXT_MAX_LENGTH } from '@/constants/mypage/profile';
import { Input } from '@/components/ui';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { CharacterCountRow } from './CharacterCountRow';
import { ProfileBackgroundImageEditor } from './edit/ProfileBackgroundImageEditor';
import { ProfileImageEditor } from './edit/ProfileImageEditor';

interface EditProfileFormContentProps {
  control: Control<Pick<EditProfileFormData, 'name' | 'bio'>>;
  errors: FieldErrors<Pick<EditProfileFormData, 'name' | 'bio'>>;
  fallbackName: string;
  profileImageUrl?: string;
  className?: string;
}

function EditProfileFormContent({
  control,
  errors,
  fallbackName,
  profileImageUrl,
  className,
}: EditProfileFormContentProps) {
  const name = useWatch({ control, name: 'name' }) ?? '';

  return (
    <div className={className}>
      <ProfileBackgroundImageEditor />

      <div className="relative flex justify-center">
        <ProfileImageEditor
          name={name || fallbackName}
          profileImageUrl={profileImageUrl}
          className="-mt-[60px]"
          avatarSize={100}
        />
      </div>

      <div className="flex flex-col gap-2 pt-6">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormFieldWrapper>
              <div className="flex flex-col gap-100">
                <Input
                  {...field}
                  type="text"
                  clearable
                  value={field.value ?? ''}
                  error={!!errors.name}
                  maxLength={MYPAGE_PROFILE_TEXT_MAX_LENGTH}
                  placeholder="이름을 입력하세요"
                  className="bg-background border-line typo-body1 text-text-strong placeholder:text-text-alternative rounded-lg p-300"
                  aria-label="이름"
                />
                <CharacterCountRow
                  error={errors.name?.message}
                  value={field.value ?? ''}
                  maxLength={MYPAGE_PROFILE_TEXT_MAX_LENGTH}
                />
              </div>
            </FormFieldWrapper>
          )}
        />

        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <FormFieldWrapper>
              <div className="flex flex-col gap-100">
                <Input
                  {...field}
                  type="text"
                  clearable
                  value={field.value ?? ''}
                  error={!!errors.bio}
                  maxLength={MYPAGE_PROFILE_TEXT_MAX_LENGTH}
                  placeholder="소개글을 입력하세요"
                  className="bg-background border-line typo-body1 text-text-strong placeholder:text-text-alternative rounded-lg p-300"
                  aria-label="소개글"
                />
                <CharacterCountRow
                  error={errors.bio?.message}
                  value={field.value ?? ''}
                  maxLength={MYPAGE_PROFILE_TEXT_MAX_LENGTH}
                />
              </div>
            </FormFieldWrapper>
          )}
        />
      </div>
    </div>
  );
}

export { EditProfileFormContent, type EditProfileFormContentProps };
