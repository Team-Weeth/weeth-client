'use client';

import { useAddProfileFlow } from '@/hooks/mypage';
import { Dialog, DialogContent } from '@/components/ui';
import { AddProfileModalHeader } from './AddProfileModal/Header';
import { StepOneContent } from './AddProfileModal/StepOneContent';
import { StepTwoContent } from './AddProfileModal/StepTwoContent';

interface AddProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddProfileModal({ open, onOpenChange }: AddProfileModalProps) {
  const {
    step,
    setStep,
    selectedClubIds,
    control,
    errors,
    resetFlow,
    handleToggleClub,
    handleNext,
  } = useAddProfileFlow();

  const handleClose = () => {
    resetFlow();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="bg-background w-[400px] max-w-[calc(100%-2rem)] rounded-xl p-400"
      >
        <AddProfileModalHeader
          step={step}
          title={step === 1 ? '프로필 추가하기' : '이 프로필을 사용할 동아리를 선택하세요.'}
          onClose={handleClose}
        />

        {step === 1 ? (
          <StepOneContent
            control={control}
            errors={errors}
            onCancel={handleClose}
            onNext={handleNext}
          />
        ) : (
          <StepTwoContent
            selectedClubIds={selectedClubIds}
            onToggleClub={handleToggleClub}
            onPrev={() => setStep(1)}
            onConfirm={handleConfirm}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export { AddProfileModal };
