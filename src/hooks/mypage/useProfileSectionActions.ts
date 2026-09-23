'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import {
  useDeleteMultiProfileHeaderImageMutation,
  useDeleteMultiProfileProfileImageMutation,
  useUpdateMultiProfileMutation,
} from '@/hooks/mutations/mypage/useMultiProfileMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';

interface UseProfileSectionActionsParams {
  profileId?: number;
  name: string;
  bio?: string | null;
}

function useProfileSectionActions({ profileId, name, bio }: UseProfileSectionActionsParams) {
  const updateMultiProfileMutation = useUpdateMultiProfileMutation();
  const deleteProfileImageMutation = useDeleteMultiProfileProfileImageMutation();
  const deleteHeaderImageMutation = useDeleteMultiProfileHeaderImageMutation();
  const [updatingType, setUpdatingType] = useState<'profile' | 'header' | null>(null);

  const showUpdateError = (error: unknown) => {
    const message =
      isAxiosError(error) && error.response?.data?.message
        ? error.response.data.message
        : '이미지 수정에 실패했습니다.';
    toastError(message);
  };

  const handleProfileImageChange = async (file: File) => {
    if (!profileId) return;

    setUpdatingType('profile');
    try {
      await updateMultiProfileMutation.mutateAsync({
        profileId,
        name,
        bio: bio ?? '',
        profileImageFile: file,
      });
      toastSuccess('프로필 사진이 수정되었습니다.');
    } catch (error) {
      showUpdateError(error);
    } finally {
      setUpdatingType(null);
    }
  };

  const handleHeaderImageChange = async (file: File) => {
    if (!profileId) return;

    setUpdatingType('header');
    try {
      await updateMultiProfileMutation.mutateAsync({
        profileId,
        name,
        bio: bio ?? '',
        headerImageFile: file,
      });
      toastSuccess('배경 사진이 수정되었습니다.');
    } catch (error) {
      showUpdateError(error);
    } finally {
      setUpdatingType(null);
    }
  };

  const handleProfileImageReset = async () => {
    if (!profileId) return;

    try {
      await deleteProfileImageMutation.mutateAsync({ profileId });
      toastSuccess('프로필 사진이 삭제되었습니다.');
    } catch (error) {
      showUpdateError(error);
    }
  };

  const handleHeaderImageReset = async () => {
    if (!profileId) return;

    try {
      await deleteHeaderImageMutation.mutateAsync({ profileId });
      toastSuccess('배경 사진이 삭제되었습니다.');
    } catch (error) {
      showUpdateError(error);
    }
  };

  return {
    handleProfileImageChange,
    handleHeaderImageChange,
    handleProfileImageReset,
    handleHeaderImageReset,
    isProfileImageUpdating:
      (updatingType === 'profile' && updateMultiProfileMutation.isPending) ||
      deleteProfileImageMutation.isPending,
    isHeaderImageUpdating:
      (updatingType === 'header' && updateMultiProfileMutation.isPending) ||
      deleteHeaderImageMutation.isPending,
  };
}

export { useProfileSectionActions, type UseProfileSectionActionsParams };
