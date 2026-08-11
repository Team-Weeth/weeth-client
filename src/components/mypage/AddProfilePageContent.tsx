'use client';

import { useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import { useAddProfileFlow } from '@/hooks/mypage';
import { useCreateMultiProfileMutation } from '@/hooks/mutations/mypage/useMultiProfileMutations';
import { useAssignableClubsQuery } from '@/hooks/queries/mypage/useMyPageQueries';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorMessage } from '@/utils/shared';
import { StepOneContent } from './AddProfileModal/StepOneContent';
import { StepTwoContent } from './AddProfileModal/StepTwoContent';

type AddProfilePageContentProps = React.HTMLAttributes<HTMLDivElement>;

function AddProfilePageContent({ className, ...props }: AddProfilePageContentProps) {
  const router = useRouter();
  const assignableClubsQuery = useAssignableClubsQuery();
  const clubs = assignableClubsQuery.data ?? [];
  const {
    step,
    setStep,
    selectedClubIds,
    profileImageFile,
    headerImageFile,
    control,
    errors,
    getValues,
    resetFlow,
    handleToggleClub,
    handleNext,
    setProfileImageFile,
    setHeaderImageFile,
  } = useAddProfileFlow(clubs.map((club) => club.clubId));
  const createMultiProfileMutation = useCreateMultiProfileMutation();

  const handleClose = () => {
    resetFlow();
    router.back();
  };

  const handleConfirm = async () => {
    const { name, bio } = getValues();

    try {
      await createMultiProfileMutation.mutateAsync({
        name: name.trim(),
        bio: bio.trim(),
        clubIds: selectedClubIds,
        profileImageFile,
        headerImageFile,
      });
      toastSuccess('프로필이 추가되었습니다.');
      handleClose();
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '프로필 추가에 실패했습니다.');
    }
  };

  return (
    <div
      className={cn('tablet:hidden flex min-w-0 flex-1 flex-col gap-4 pb-[168px]', className)}
      {...props}
    >
      <div className="flex items-center gap-1 py-300">
        <button
          type="button"
          onClick={handleClose}
          className="flex items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <h1 className="typo-sub1 text-text-normal">프로필 추가하기</h1>
      </div>

      <div className="flex items-center gap-[9px]">
        {Array.from({ length: 2 }).map((_, index) => (
          <div
            key={index}
            className={cn(
              'h-1 flex-1 rounded-full',
              step === index + 1 ? 'bg-button-primary' : 'bg-button-neutral',
            )}
          />
        ))}
      </div>

      {step === 1 ? (
        <StepOneContent
          control={control}
          errors={errors}
          onProfileImageChange={setProfileImageFile}
          onProfileImageReset={() => setProfileImageFile(null)}
          onHeaderImageChange={setHeaderImageFile}
          onHeaderImageReset={() => setHeaderImageFile(null)}
          onCancel={handleClose}
          onNext={handleNext}
          cancelAsDialogClose={false}
          mobileFixedFooter
        />
      ) : (
        <StepTwoContent
          clubs={clubs}
          selectedClubIds={selectedClubIds}
          onToggleClub={handleToggleClub}
          onPrev={() => setStep(1)}
          onConfirm={handleConfirm}
          isSubmitting={createMultiProfileMutation.isPending || assignableClubsQuery.isPending}
          mobileFixedFooter
        />
      )}
    </div>
  );
}

export { AddProfilePageContent, type AddProfilePageContentProps };
