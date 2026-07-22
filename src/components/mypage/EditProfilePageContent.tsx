'use client';

import { useParams, useRouter } from 'next/navigation';
import { BackIcon } from '@/assets/icons';
import { Button, Icon } from '@/components/ui';
import { useEditProfileActions, useEditProfileForm } from '@/hooks/mypage';
import { useMyProfileDetailQuery } from '@/hooks/queries/mypage/useMyPageQueries';
import { DeleteProfileDialog } from './DeleteProfileDialog';
import { EditProfileFormContent } from './EditProfileFormContent';
import { ProfileManagementSkeleton } from './skeleton/ProfileManagementSkeleton';

function EditProfilePageContent() {
  const router = useRouter();
  const { profileId } = useParams<{ clubId: string; profileId: string }>();
  const parsedProfileId = Number(profileId);
  const profileQuery = useMyProfileDetailQuery(
    Number.isNaN(parsedProfileId) ? null : parsedProfileId,
  );

  const profile = profileQuery.data ?? null;

  const {
    control,
    getValues,
    resetToProfile,
    name,
    formState: { errors },
  } = useEditProfileForm(profile ?? null);

  const {
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    setProfileImageFile,
    setHeaderImageFile,
    isSubmitting,
    isDeleting,
    handleClose,
    handleDelete,
    handleSubmit,
    handleProfileImageReset,
    handleHeaderImageReset,
  } = useEditProfileActions({
    profile: profile ?? null,
    getValues,
    resetToProfile,
    onClose: () => router.back(),
  });

  if (profileQuery.isPending || !profile) {
    return <ProfileManagementSkeleton />;
  }

  return (
    <>
      <div className="tablet:hidden flex min-w-0 flex-1 flex-col gap-4 pb-[196px]">
        <div className="flex items-center gap-1 py-300">
          <button
            type="button"
            onClick={handleClose}
            className="flex items-center justify-center p-1"
          >
            <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
          </button>
          <h1 className="typo-sub1 text-text-normal">프로필 수정</h1>
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
      </div>

      <div className="tablet:hidden fixed inset-x-0 bottom-12 z-20 px-450">
        <Button
          variant="secondary"
          size="lg"
          className="text-state-error mb-4 w-full"
          disabled={isDeleting}
          onClick={() => setIsDeleteDialogOpen(true)}
        >
          {isDeleting ? '삭제 중...' : '프로필 삭제하기'}
        </Button>

        <div className="flex gap-200">
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
      </div>

      <DeleteProfileDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        isDeleting={isDeleting}
      />
    </>
  );
}

export { EditProfilePageContent };
