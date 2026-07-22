'use client';

import { useState } from 'react';
import {
  useDeleteMultiProfileHeaderImageMutation,
  useDeleteMultiProfileMutation,
  useDeleteMultiProfileProfileImageMutation,
  useUpdateMultiProfileMutation,
} from '@/hooks/mutations/mypage/useMultiProfileMutations';
import type { EditProfileFormData } from '@/lib/schemas/editProfile';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { MyPageUsingProfile } from '@/types/mypage';
import { getApiErrorMessage } from '@/utils/shared';

interface UseEditProfileActionsParams {
  profile: MyPageUsingProfile | null;
  getValues: () => Pick<EditProfileFormData, 'name' | 'bio'>;
  resetToProfile: () => void;
  onClose: () => void;
  onBeforeOpenDeleteDialog?: () => void;
}

function useEditProfileActions({
  profile,
  getValues,
  resetToProfile,
  onClose,
  onBeforeOpenDeleteDialog,
}: UseEditProfileActionsParams) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const deleteMultiProfileMutation = useDeleteMultiProfileMutation();
  const updateMultiProfileMutation = useUpdateMultiProfileMutation();
  const deleteProfileImageMutation = useDeleteMultiProfileProfileImageMutation();
  const deleteHeaderImageMutation = useDeleteMultiProfileHeaderImageMutation();

  const handleClose = () => {
    resetToProfile();
    setProfileImageFile(null);
    setHeaderImageFile(null);
    setIsDeleteDialogOpen(false);
    onClose();
  };

  const handleOpenDeleteDialog = () => {
    onBeforeOpenDeleteDialog?.();
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!profile) return;

    try {
      await deleteMultiProfileMutation.mutateAsync(profile.profileId);
      toastSuccess('프로필이 삭제되었습니다.');
      setIsDeleteDialogOpen(false);
      handleClose();
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '프로필 삭제에 실패했습니다.');
    }
  };

  const handleSubmit = async () => {
    if (!profile) return;

    try {
      const { name, bio } = getValues();

      await updateMultiProfileMutation.mutateAsync({
        profileId: profile.profileId,
        name: name.trim(),
        bio: bio.trim(),
        profileImageFile,
        headerImageFile,
      });
      toastSuccess('프로필이 수정되었습니다.');
      handleClose();
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '프로필 수정에 실패했습니다.');
    }
  };

  const handleProfileImageReset = async () => {
    if (!profile) return;

    try {
      setProfileImageFile(null);
      await deleteProfileImageMutation.mutateAsync({ profileId: profile.profileId });
      toastSuccess('프로필 사진이 삭제되었습니다.');
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '프로필 사진 삭제에 실패했습니다.');
    }
  };

  const handleHeaderImageReset = async () => {
    if (!profile) return;

    try {
      setHeaderImageFile(null);
      await deleteHeaderImageMutation.mutateAsync({ profileId: profile.profileId });
      toastSuccess('배경 사진이 삭제되었습니다.');
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '배경 사진 삭제에 실패했습니다.');
    }
  };

  return {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    profileImageFile,
    setProfileImageFile,
    headerImageFile,
    setHeaderImageFile,
    isSubmitting: updateMultiProfileMutation.isPending,
    isDeleting: deleteMultiProfileMutation.isPending,
    handleClose,
    handleOpenDeleteDialog,
    handleDelete,
    handleSubmit,
    handleProfileImageReset,
    handleHeaderImageReset,
  };
}

export { useEditProfileActions, type UseEditProfileActionsParams };
