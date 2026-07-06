'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';

function useAddProfileFlow() {
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

  const resetFlow = () => {
    setStep(1);
    reset({ name: '', bio: '' });
    setSelectedClubIds(['1', '2']);
  };

  const handleToggleClub = (clubId: string) => {
    setSelectedClubIds((prev) =>
      prev.includes(clubId) ? prev.filter((id) => id !== clubId) : [...prev, clubId],
    );
  };

  const handleNext = async () => {
    const isValid = await trigger();
    if (!isValid) return false;
    setStep(2);
    return true;
  };

  return {
    step,
    setStep,
    selectedClubIds,
    control,
    errors,
    resetFlow,
    handleToggleClub,
    handleNext,
  };
}

export { useAddProfileFlow };
