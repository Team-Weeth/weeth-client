'use client';

import { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';

interface EditProfileFormValuesSource {
  name: string;
  description: string;
}

function useEditProfileForm(profile: EditProfileFormValuesSource | null, enabled = true) {
  const editProfileFormSchema = editProfileSchema.pick({ name: true, bio: true });

  const form = useForm<Pick<EditProfileFormData, 'name' | 'bio'>>({
    resolver: zodResolver(editProfileFormSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: profile?.name ?? '',
      bio: profile?.description ?? '',
    },
  });

  const { control, reset } = form;
  const name = useWatch({ control, name: 'name' }) ?? '';

  useEffect(() => {
    if (!enabled || !profile) return;

    reset({
      name: profile.name,
      bio: profile.description,
    });
  }, [enabled, profile, reset]);

  const resetToProfile = () => {
    if (!profile) return;

    reset({
      name: profile.name,
      bio: profile.description,
    });
  };

  return {
    ...form,
    name,
    resetToProfile,
  };
}

export { useEditProfileForm, type EditProfileFormValuesSource };
