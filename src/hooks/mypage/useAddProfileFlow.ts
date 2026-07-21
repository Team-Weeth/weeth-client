'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';

interface UseAddProfileFlowOptions {
  initialSelectedClubIds?: string[];
}

function useAddProfileFlow(
  availableClubIds: string[] = [],
  options?: UseAddProfileFlowOptions,
) {
  const [step, setStep] = useState(1);
  const initialSelectedClubIds = options?.initialSelectedClubIds ?? [];
  const [selectedClubIdsState, setSelectedClubIds] = useState<string[]>(initialSelectedClubIds);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [headerImageFile, setHeaderImageFile] = useState<File | null>(null);
  const stepOneSchema = editProfileSchema.pick({ name: true, bio: true });

  const {
    control,
    getValues,
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

  const selectedClubIds =
    selectedClubIdsState.length > 0
      ? selectedClubIdsState.filter((id) => availableClubIds.includes(id))
      : availableClubIds;

  const resetFlow = () => {
    setStep(1);
    reset({ name: '', bio: '' });
    setSelectedClubIds(initialSelectedClubIds);
    setProfileImageFile(null);
    setHeaderImageFile(null);
  };

  const handleToggleClub = (clubId: string) => {
    setSelectedClubIds((prev) => {
      const current = prev.length > 0 ? prev.filter((id) => availableClubIds.includes(id)) : availableClubIds;
      return current.includes(clubId)
        ? current.filter((id) => id !== clubId)
        : [...current, clubId];
    });
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
  };
}

export { useAddProfileFlow };
