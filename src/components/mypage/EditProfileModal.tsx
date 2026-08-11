'use client';

import DeleteIcon from '@/assets/icons/delete.svg';
import { Button, Dialog, DialogContent, DialogTitle, Icon } from '@/components/ui';
import { useEditProfileActions, useEditProfileForm } from '@/hooks/mypage';
import type { MyPageUsingProfile } from '@/types/mypage';
import { DeleteProfileDialog } from './DeleteProfileDialog';
import { EditProfileFormContent } from './EditProfileFormContent';

interface EditProfileModalProps {
  open: boolean;
  profile: MyPageUsingProfile;
  onOpenChange: (open: boolean) => void;
}

function EditProfileModal({ open, profile, onOpenChange }: EditProfileModalProps) {
  const {
    control,
    getValues,
    resetToProfile,
    name,
    formState: { errors },
  } = useEditProfileForm(profile, open);
  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    setProfileImageFile,
    setHeaderImageFile,
    isSubmitting,
    isDeleting,
    handleClose,
    handleOpenDeleteDialog,
    handleDelete,
    handleSubmit,
    handleProfileImageReset,
    handleHeaderImageReset,
  } = useEditProfileActions({
    profile,
    getValues,
    resetToProfile,
    onClose: () => onOpenChange(false),
    onBeforeOpenDeleteDialog: () => onOpenChange(false),
  });

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

        <EditProfileFormContent
          control={control}
          errors={errors}
          fallbackName={profile.name}
          profileImageUrl={profile.profileImageUrl ?? undefined}
          headerImageUrl={profile.headerImageUrl ?? undefined}
          onProfileImageChange={setProfileImageFile}
          onProfileImageReset={() => {
            void handleProfileImageReset();
          }}
          onHeaderImageChange={setHeaderImageFile}
          onHeaderImageReset={() => {
            void handleHeaderImageReset();
          }}
        />

        <Button
          variant="secondary"
          size="lg"
          className="text-state-error mt-8"
          disabled={isDeleting}
          onClick={handleOpenDeleteDialog}
        >
          {isDeleting ? '삭제 중...' : '프로필 삭제하기'}
        </Button>

        <div className="mt-4 flex gap-200">
          <Button variant="secondary" size="lg" className="flex-1" onClick={handleClose}>
            취소
          </Button>
          <Button
            variant="primary"
            size="lg"
            className="flex-1"
            disabled={!name.trim() || isSubmitting}
            onClick={() => {
              void handleSubmit();
            }}
          >
            {isSubmitting ? '수정 중...' : '완료'}
          </Button>
        </div>
      </DialogContent>

      <DeleteProfileDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </Dialog>
  );
}

export { EditProfileModal, type EditProfileModalProps };
