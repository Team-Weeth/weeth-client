'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Dialog, DialogContent } from '@/components/ui';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';
import { AddProfileModalHeader } from './AddProfileModal/Header';
import { StepOneContent } from './AddProfileModal/StepOneContent';
import { StepTwoContent } from './AddProfileModal/StepTwoContent';

interface AddProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function AddProfileModal({ open, onOpenChange }: AddProfileModalProps) {
  const [step, setStep] = useState(1);
  const [selectedClubIds, setSelectedClubIds] = useState<string[]>(['1', '2']);
  const stepOneSchema = editProfileSchema.pick({ name: true, bio: true });

  const {
    control,
    reset,
    trigger,
    formState: { errors },
  } = useForm<Pick<EditProfileFormData, 'name' | 'bio'>>({
    resolver: zodResolver(stepOneSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      bio: '',
    },
  });

  const handleClose = () => {
    setStep(1);
    reset({ name: '', bio: '' });
    setSelectedClubIds(['1', '2']);
    onOpenChange(false);
  };

  const handleToggleClub = (clubId: string) => {
    setSelectedClubIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
    );
  };

  const handleConfirm = () => {
    handleClose();
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (!isValid) return;
    setStep(2);
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
