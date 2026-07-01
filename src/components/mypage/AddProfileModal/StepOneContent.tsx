'use client';

import type { Control, FieldErrors } from 'react-hook-form';
import { Controller, useWatch } from 'react-hook-form';
import { Button, DialogClose, Input } from '@/components/ui';
import { FormFieldWrapper } from '@/components/auth/hub';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { CharacterCountRow } from '../CharacterCountRow';
import { ProfileBackgroundImageEditor } from '../edit/ProfileBackgroundImageEditor';
import { ProfileImageEditor } from '../edit/ProfileImageEditor';

const MAX_LENGTH = 30;

interface StepOneContentProps {
  control: Control<Pick<EditProfileFormData, 'name' | 'bio'>>;
  errors: FieldErrors<Pick<EditProfileFormData, 'name' | 'bio'>>;
  onCancel: () => void;
  onNext: () => void;
}

function StepOneContent({ control, errors, onCancel, onNext }: StepOneContentProps) {
  const name = useWatch({ control, name: 'name' }) ?? '';

  return (
    <>
      <>
        <ProfileBackgroundImageEditor />

        <div className="relative flex justify-center">
          <ProfileImageEditor
            name={name || '프로필'}
            className="-mt-[60px]"
            avatarSize={100}
            avatarClassName="bg-[#EFF1F1]"
            fallbackClassName="bg-[#EFF1F1]"
          />
        </div>
      </>
      <div className="flex flex-col gap-2 pt-6">
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <FormFieldWrapper label="이름">
              <div className="flex flex-col gap-100">
                <Input
                  {...field}
                  type="text"
                  clearable
                  value={field.value ?? ''}
                  error={!!errors.name}
                  maxLength={MAX_LENGTH}
                  placeholder="이름을 입력하세요"
                  className="bg-background border-line typo-body1 text-text-strong placeholder:text-text-alternative rounded-lg p-300"
                  aria-label="이름"
                />
                <CharacterCountRow
                  error={errors.name?.message}
                  value={field.value ?? ''}
                  maxLength={MAX_LENGTH}
                />
              </div>
            </FormFieldWrapper>
          )}
        />

        <Controller
          name="bio"
          control={control}
          render={({ field }) => (
            <FormFieldWrapper label="소개글 (선택)">
              <div className="flex flex-col gap-100">
                <Input
                  {...field}
                  type="text"
                  clearable
                  value={field.value ?? ''}
                  error={!!errors.bio}
                  maxLength={MAX_LENGTH}
                  placeholder="소개글을 입력하세요"
                  className="bg-background border-line typo-body1 text-text-strong placeholder:text-text-alternative rounded-lg p-300"
                  aria-label="소개글"
                />
                <CharacterCountRow
                  error={errors.bio?.message}
                  value={field.value ?? ''}
                  maxLength={MAX_LENGTH}
                />
              </div>
            </FormFieldWrapper>
          )}
        />
      </div>
      <div className="mt-8 flex gap-200">
        <DialogClose asChild onClick={onCancel}>
          <Button variant="secondary" size="lg" className="flex-1">
            취소
          </Button>
        </DialogClose>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={!name.trim()}
          onClick={onNext}
        >
          다음
        </Button>
      </div>
    </>
  );
}

export { StepOneContent, type StepOneContentProps };
