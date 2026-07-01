'use client';

import { useEffect, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DeleteIcon } from '@/assets/icons';
import { FormFieldWrapper } from '@/components/auth/hub';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Icon,
  Input,
} from '@/components/ui';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';
import type { ClubDto } from '@/types/mypage';
import { CharacterCountRow } from './CharacterCountRow';
import { ProfileBackgroundImageEditor } from './edit/ProfileBackgroundImageEditor';
import { ProfileImageEditor } from './edit/ProfileImageEditor';

const MAX_LENGTH = 30;

interface EditProfileModalProps {
  open: boolean;
  profile: ClubDto;
  onOpenChange: (open: boolean) => void;
}

function EditProfileModal({ open, profile, onOpenChange }: EditProfileModalProps) {
  const editProfileModalSchema = editProfileSchema.pick({ name: true, bio: true });
  const {
    control,
    reset,
    formState: { errors },
  } = useForm<Pick<EditProfileFormData, 'name' | 'bio'>>({
    resolver: zodResolver(editProfileModalSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: profile.name,
      bio: profile.description,
    },
  });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const name = useWatch({ control, name: 'name' }) ?? '';

  useEffect(() => {
    if (!open) return;
    reset({
      name: profile.name,
      bio: profile.description,
    });
  }, [open, profile.description, profile.name, reset]);

  const handleClose = () => {
    reset({
      name: profile.name,
      bio: profile.description,
    });
    setIsDeleteDialogOpen(false);
    onOpenChange(false);
  };

  const handleOpenDeleteDialog = () => {
    onOpenChange(false);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = () => {
    setIsDeleteDialogOpen(false);
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background w-[400px] max-w-[calc(100%-2rem)] rounded-xl p-400"
      >
        <div className="flex items-start justify-between pb-400">
          <DialogTitle className="typo-sub1 text-text-strong">프로필 수정</DialogTitle>
          <button
            type="button"
            onClick={handleClose}
            className="text-icon-normal cursor-pointer p-1"
            aria-label="프로필 수정 닫기"
          >
            <Icon src={DeleteIcon} size={24} />
          </button>
        </div>

        <div>
          <ProfileBackgroundImageEditor />

          <div className="relative flex justify-center">
            <ProfileImageEditor
              name={name || profile.name}
              profileImageUrl={profile.profileImageUrl ?? undefined}
              className="-mt-[60px]"
              avatarSize={100}
            />
          </div>
        </div>

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

        <Button
          variant="secondary"
          size="lg"
          className="text-state-error mt-8"
          onClick={handleOpenDeleteDialog}
        >
          프로필 삭제하기
        </Button>

        <div className="mt-4 flex gap-200">
          <Button variant="secondary" size="lg" className="flex-1" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!name.trim()}
            onClick={handleClose}
          >
            완료
          </Button>
        </div>
      </DialogContent>

      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        status="danger"
        title="이 프로필을 삭제하시겠어요?"
        description={'삭제된 프로필은 복구할 수 없습니다.\n신중히 확인 후 진행해 주세요.'}
      >
        <AlertDialogAction onClick={handleDelete}>삭제</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </Dialog>
  );
}

export { EditProfileModal, type EditProfileModalProps };
