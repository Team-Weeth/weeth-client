'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { ClubInfoBasicSection } from '@/components/admin/club-info/ClubInfoBasicSection';
import { ClubInfoContactSection } from '@/components/admin/club-info/ClubInfoContactSection';
import { ClubInfoImageSection } from '@/components/admin/club-info/ClubInfoImageSection';
import { ClubInfoTopBar } from '@/components/admin/club-info/ClubInfoTopBar';
import {
  buildUpdateClubBody,
  getClubFormValues,
  getImagePreviewUrl,
} from '@/components/admin/club-info/clubInfoForm.utils';
import {
  useUpdateClub,
  useDeleteClubProfileImage,
  useDeleteClubBackgroundImage,
} from '@/hooks/mutations/admin';
import { useAdminClubQuery } from '@/hooks/queries/admin/useAdminClubQuery';
import { clubInfoSchema, type ClubInfoFormData } from '@/lib/schemas/clubInfo';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import type { ImageState } from '@/types/admin/clubInfo';

interface ClubInfoPageContentProps {
  schoolNames: string[];
}

function ClubInfoPageContent({ schoolNames }: ClubInfoPageContentProps) {
  const { data: club } = useAdminClubQuery();

  const {
    setValue,
    reset,
    control,
    handleSubmit,
    formState: { isDirty, errors },
  } = useForm<ClubInfoFormData>({
    resolver: zodResolver(clubInfoSchema),
    defaultValues: getClubFormValues(),
    mode: 'onBlur',
  });

  useEffect(() => {
    if (!club) return;
    reset(getClubFormValues(club));
  }, [club, reset]);

  const school = useWatch({ control, name: 'school' });
  const clubName = useWatch({ control, name: 'name' });
  const description = useWatch({ control, name: 'description' });
  const phone = useWatch({ control, name: 'phone' });
  const email = useWatch({ control, name: 'email' });
  const primaryContact = useWatch({ control, name: 'primaryContact' });

  const [profileImage, setProfileImage] = useState<ImageState>({ status: 'unchanged' });
  const [backgroundImage, setBackgroundImage] = useState<ImageState>({ status: 'unchanged' });

  const isEditMode =
    isDirty || profileImage.status !== 'unchanged' || backgroundImage.status !== 'unchanged';

  const profilePreviewUrl = getImagePreviewUrl(profileImage, club?.profileImageUrl);
  const backgroundPreviewUrl = getImagePreviewUrl(backgroundImage, club?.backgroundImageUrl);

  const updateClub = useUpdateClub();
  const deleteProfileImage = useDeleteClubProfileImage();
  const deleteBackgroundImage = useDeleteClubBackgroundImage();

  const isSaving =
    updateClub.isPending || deleteProfileImage.isPending || deleteBackgroundImage.isPending;

  const handleResetChanges = () => {
    reset(getClubFormValues(club));
    setProfileImage({ status: 'unchanged' });
    setBackgroundImage({ status: 'unchanged' });
  };

  const handleSave = handleSubmit(async (formData) => {
    try {
      const deletePromises: Promise<unknown>[] = [];
      if (profileImage.status === 'deleted') {
        deletePromises.push(deleteProfileImage.mutateAsync());
      }
      if (backgroundImage.status === 'deleted') {
        deletePromises.push(deleteBackgroundImage.mutateAsync());
      }
      if (deletePromises.length > 0) {
        await Promise.all(deletePromises);
      }

      const hasFormChanges = isDirty;
      const hasUploadedImages =
        profileImage.status === 'uploaded' || backgroundImage.status === 'uploaded';

      if (hasFormChanges || hasUploadedImages) {
        await updateClub.mutateAsync(buildUpdateClubBody(formData, profileImage, backgroundImage));
      }

      toastSuccess('동아리 정보가 저장되었습니다.');
      setProfileImage({ status: 'unchanged' });
      setBackgroundImage({ status: 'unchanged' });
    } catch {
      toastError('저장에 실패했습니다.');
    }
  }, () => {
    toastError('입력값을 확인해주세요.');
  });

  return (
    <div className="flex min-w-3xl flex-col">
      {isEditMode && (
        <ClubInfoTopBar
          className="sticky top-0 z-10 -mt-15"
          onBack={handleResetChanges}
          onSave={handleSave}
          isSaving={isSaving}
        />
      )}

      <div className="flex flex-col items-start gap-400 px-8 py-12">
        <ClubInfoImageSection
          profilePreviewUrl={profilePreviewUrl}
          backgroundPreviewUrl={backgroundPreviewUrl}
          onProfileUpload={(result) => setProfileImage({ status: 'uploaded', upload: result })}
          onBackgroundUpload={(result) =>
            setBackgroundImage({ status: 'uploaded', upload: result })
          }
          onProfileReset={() => setProfileImage({ status: 'deleted' })}
          onBackgroundReset={() => setBackgroundImage({ status: 'deleted' })}
        />

        <ClubInfoBasicSection
          schoolNames={schoolNames}
          school={school ?? ''}
          clubName={clubName ?? ''}
          description={description ?? ''}
          descriptionError={errors.description?.message}
          onSchoolChange={(value) => setValue('school', value, { shouldDirty: true })}
          onNameChange={(value) => setValue('name', value, { shouldDirty: true })}
          onDescriptionChange={(value) => setValue('description', value, { shouldDirty: true })}
        />

        <ClubInfoContactSection
          phone={phone ?? ''}
          email={email ?? ''}
          primaryContact={primaryContact ?? 'phone'}
          phoneError={errors.phone?.message}
          onPhoneChange={(value) => setValue('phone', value, { shouldDirty: true })}
          onEmailChange={(value) => setValue('email', value, { shouldDirty: true })}
          onPrimaryContactChange={(value) =>
            setValue('primaryContact', value, { shouldDirty: true })
          }
        />
      </div>
    </div>
  );
}

export { ClubInfoPageContent, type ClubInfoPageContentProps };
