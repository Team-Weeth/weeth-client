'use client';

import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import { Button } from '@/components/ui/Button';
import { DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/Input';
import { FormFieldWrapper } from '@/components/auth/hub';
import { MYPAGE_PROFILE_TEXT_MAX_LENGTH } from '@/constants/mypage/profile';
import { cn } from '@/lib/cn';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { CharacterCountRow } from '../CharacterCountRow';
import { ProfileBackgroundImageEditor } from '../edit/ProfileBackgroundImageEditor';
import { ProfileImageEditor } from '../edit/ProfileImageEditor';

interface StepOneContentProps {
  control: Control<Pick<EditProfileFormData, 'name' | 'bio'>>;
  errors: FieldErrors<Pick<EditProfileFormData, 'name' | 'bio'>>;
  onProfileImageChange?: (file: File) => void;
  onProfileImageReset?: () => void;
  onHeaderImageChange?: (file: File) => void;
  onHeaderImageReset?: () => void;
  onCancel: () => void;
  onNext: () => void;
  nextLabel?: string;
  cancelAsDialogClose?: boolean;
  mobileFixedFooter?: boolean;
}

function StepOneContent({
  control,
  errors,
  onProfileImageChange,
  onProfileImageReset,
  onHeaderImageChange,
  onHeaderImageReset,
  onCancel,
  onNext,
  nextLabel = '다음',
  cancelAsDialogClose = true,
  mobileFixedFooter = false,
}: StepOneContentProps) {
  const name = useWatch({ control, name: 'name' }) ?? '';

  return (
    <>
      <ProfileBackgroundImageEditor
        onFileChange={onHeaderImageChange}
        onResetImage={onHeaderImageReset}
      />

      <div className="relative flex justify-center">
        <ProfileImageEditor
          name={name || '프로필'}
          onFileChange={onProfileImageChange}
          onResetImage={onProfileImageReset}
          className="-mt-[60px]"
          avatarSize={100}
          avatarClassName="bg-[#EFF1F1]"
          fallbackClassName="bg-[#EFF1F1]"
        />
      </div>
      <div className="tablet:pt-6 flex flex-col gap-2">
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
                  placeholder="소개글을 입력하세요 (선택)"
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
      <div
        className={cn(
          'mt-8 flex gap-200',
          mobileFixedFooter &&
            'tablet:static tablet:px-0 fixed inset-x-0 bottom-12 z-20 mt-0 px-450',
        )}
      >
        {cancelAsDialogClose ? (
          <DialogClose asChild onClick={onCancel}>
            <Button variant="secondary" size="lg" className="flex-1">
              취소
            </Button>
          </DialogClose>
        ) : (
          <Button variant="secondary" size="lg" className="flex-1" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={!name.trim()}
          onClick={onNext}
        >
          {nextLabel}
        </Button>
      </div>
    </>
  );
}

export { StepOneContent, type StepOneContentProps };
