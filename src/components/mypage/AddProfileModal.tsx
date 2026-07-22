'use client';

import { useAddProfileFlow } from '@/hooks/mypage';
import { useCreateMultiProfileMutation } from '@/hooks/mutations/mypage/useMultiProfileMutations';
import { useAssignableClubsQuery } from '@/hooks/queries/mypage/useMyPageQueries';
import { Dialog, DialogContent } from '@/components/ui';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorMessage } from '@/utils/shared';
import { AddProfileModalHeader } from './AddProfileModal/Header';
import { StepOneContent } from './AddProfileModal/StepOneContent';
import { StepTwoContent } from './AddProfileModal/StepTwoContent';

interface AddProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tutorialMode?: boolean;
  initialSelectedClubIds?: string[];
}

function AddProfileModal({
  open,
  onOpenChange,
  tutorialMode = false,
  initialSelectedClubIds,
}: AddProfileModalProps) {
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
  } = useAddProfileFlow(
    clubs.map((club) => club.clubId),
    {
      initialSelectedClubIds,
    },
  );
  const createMultiProfileMutation = useCreateMultiProfileMutation();

  const handleClose = () => {
    resetFlow();
    onOpenChange(false);
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

  const handleStepOneSubmit = async () => {
    const isValid = await handleNext();
    if (!isValid) return;

    if (tutorialMode) {
      await handleConfirm();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background w-[400px] max-w-[calc(100%-2rem)] rounded-xl p-400"
      >
        <AddProfileModalHeader
          step={step}
          title={
            step === 1 || tutorialMode
              ? '프로필 추가하기'
              : '이 프로필을 사용할 동아리를 선택하세요.'
          }
          onClose={handleClose}
          showSteps={!tutorialMode}
        />

        {step === 1 || tutorialMode ? (
          <StepOneContent
            control={control}
            errors={errors}
            onProfileImageChange={setProfileImageFile}
            onProfileImageReset={() => setProfileImageFile(null)}
            onHeaderImageChange={setHeaderImageFile}
            onHeaderImageReset={() => setHeaderImageFile(null)}
            onCancel={handleClose}
            onNext={() => {
              void handleStepOneSubmit();
            }}
            nextLabel={tutorialMode ? '완료' : '다음'}
          />
        ) : (
          <StepTwoContent
            clubs={clubs}
            selectedClubIds={selectedClubIds}
            onToggleClub={handleToggleClub}
            onPrev={() => setStep(1)}
            onConfirm={handleConfirm}
            isSubmitting={createMultiProfileMutation.isPending || assignableClubsQuery.isPending}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export { AddProfileModal };
