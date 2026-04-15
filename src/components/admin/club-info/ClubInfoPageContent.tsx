'use client';

import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AdminInfoCard } from '@/components/admin/club-info/AdminInfoCard';
import { FieldBlock } from '@/components/admin/club-info/FieldBlock';
import { ImageUploadField } from '@/components/admin/club-info/ImageUploadField';
import type { UploadResult } from '@/components/admin/club-info/ImageUploadField';
import { ClubInfoTopBar } from '@/components/admin/club-info/ClubInfoTopBar';
import { SearchSelect } from '@/components/mypage';
import { Input } from '@/components/ui';
import { PRIMARY_CONTACT_OPTIONS } from '@/constants/admin/clubInfo.constants';
import {
  useUpdateClub,
  useDeleteClubProfileImage,
  useDeleteClubBackgroundImage,
} from '@/hooks/mutations/admin';
import { useAdminClubQuery } from '@/hooks/queries/admin/useAdminClubQuery';
import type { ClubImagePayload, UpdateClubBody } from '@/lib/apis/adminClub';
import { cn } from '@/lib/cn';
import { clubInfoSchema, type ClubInfoFormData } from '@/lib/schemas/clubInfo';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import type { ImageState } from '@/types/admin/clubInfo';
import { formatPhone } from '@/utils/shared';

interface ClubInfoPageContentProps {
  schoolNames: string[];
}

function toImagePayload(upload: UploadResult): ClubImagePayload {
  return {
    storageKey: upload.storageKey,
    fileName: upload.fileName,
    fileSize: upload.fileSize,
    contentType: upload.contentType,
  };
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
    defaultValues: {
      school: '',
      name: '',
      description: '',
      phone: '',
      email: '',
      primaryContact: 'phone',
    },
    mode: 'onBlur',
  });

  // 서버 데이터로 폼 초기화
  useEffect(() => {
    if (!club) return;
    reset({
      school: club.schoolName,
      name: club.name,
      description: club.description ?? '',
      phone: formatPhone(club.contactPhoneNumber ?? ''),
      email: club.contactEmail ?? '',
      primaryContact: club.primaryContact === 'EMAIL' ? 'email' : 'phone',
    });
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

  const profilePreviewUrl =
    profileImage.status === 'uploaded'
      ? profileImage.upload.fileUrl
      : profileImage.status === 'deleted'
        ? null
        : club?.profileImageUrl ?? null;

  const backgroundPreviewUrl =
    backgroundImage.status === 'uploaded'
      ? backgroundImage.upload.fileUrl
      : backgroundImage.status === 'deleted'
        ? null
        : club?.backgroundImageUrl ?? null;

  const updateClub = useUpdateClub();
  const deleteProfileImage = useDeleteClubProfileImage();
  const deleteBackgroundImage = useDeleteClubBackgroundImage();

  const isSaving =
    updateClub.isPending || deleteProfileImage.isPending || deleteBackgroundImage.isPending;

  const handleResetChanges = () => {
    if (club) {
      reset({
        school: club.schoolName,
        name: club.name,
        description: club.description ?? '',
        phone: formatPhone(club.contactPhoneNumber ?? ''),
        email: club.contactEmail ?? '',
        primaryContact: club.primaryContact === 'EMAIL' ? 'email' : 'phone',
      });
    } else {
      reset();
    }
    setProfileImage({ status: 'unchanged' });
    setBackgroundImage({ status: 'unchanged' });
  };

  const handleSave = handleSubmit(async (formData) => {
    try {
      // 1. 삭제 API 병렬 호출
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

      // 2. 폼 변경 또는 이미지 업로드가 있으면 PATCH 호출
      const hasFormChanges = isDirty;
      const hasUploadedImages =
        profileImage.status === 'uploaded' || backgroundImage.status === 'uploaded';

      if (hasFormChanges || hasUploadedImages) {
        const body: UpdateClubBody = {
          name: formData.name,
          schoolName: formData.school,
          description: formData.description,
          contactPhoneNumber: formData.phone.replace(/-/g, ''),
          contactEmail: formData.email,
          primaryContact: formData.primaryContact === 'email' ? 'EMAIL' : 'PHONE',
        };

        if (profileImage.status === 'uploaded') {
          body.profileImage = toImagePayload(profileImage.upload);
        }
        if (backgroundImage.status === 'uploaded') {
          body.backgroundImage = toImagePayload(backgroundImage.upload);
        }

        await updateClub.mutateAsync(body);
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
        <AdminInfoCard title="이미지" titleGapClassName="mt-400" contentClassName="gap-0">
          <div className="flex w-full gap-500">
            <ImageUploadField
              className="w-47 shrink-0"
              label="프로필 이미지"
              title="클릭하여 업로드"
              description="정사각형 권장"
              aspectRatio="1/1"
              ownerType="CLUB_PROFILE"
              previewUrl={profilePreviewUrl}
              onUploadComplete={(result) =>
                setProfileImage({ status: 'uploaded', upload: result })
              }
              onReset={() => setProfileImage({ status: 'deleted' })}
            />
            <ImageUploadField
              className="min-w-0 flex-1"
              label="배경 이미지"
              title="클릭 혹은 파일을 이곳에 드롭하세요"
              description="1440 × 364 px 권장"
              ownerType="CLUB_BACKGROUND"
              previewUrl={backgroundPreviewUrl}
              onUploadComplete={(result) =>
                setBackgroundImage({ status: 'uploaded', upload: result })
              }
              onReset={() => setBackgroundImage({ status: 'deleted' })}
            />
          </div>
        </AdminInfoCard>

        <AdminInfoCard title="기본 정보" titleGapClassName="mt-[58px]" contentClassName="gap-0">
          <div className="flex flex-col gap-400">
            <FieldBlock label="소속 학교">
              <SearchSelect
                value={school ?? ''}
                onChange={(v) => setValue('school', v, { shouldDirty: true })}
                options={schoolNames}
                placeholder="학교명을 검색하세요"
                className="w-full"
                showArrow
                inputClassName="rounded-lg border border-line bg-container-neutral px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="동아리 이름">
              <Input
                value={clubName ?? ''}
                onChange={(e) => setValue('name', e.target.value, { shouldDirty: true })}
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="동아리 소개" helper="최대 30자" error={errors.description?.message}>
              <Input
                value={description ?? ''}
                onChange={(e) => setValue('description', e.target.value, { shouldDirty: true })}
                maxLength={30}
                placeholder="동아리를 소개하는 짧은 글을 작성해주세요"
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>
          </div>
        </AdminInfoCard>

        <AdminInfoCard
          title="연락처"
          titleGapClassName="mt-[58px]"
          contentClassName="gap-0"
          className="pb-[70px]"
        >
          <div className="flex flex-col gap-400">
            <FieldBlock label="대표 전화번호" error={errors.phone?.message}>
              <Input
                value={phone ?? ''}
                onChange={(e) => setValue('phone', e.target.value, { shouldDirty: true })}
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="대표 이메일">
              <Input
                value={email ?? ''}
                onChange={(e) => setValue('email', e.target.value, { shouldDirty: true })}
                placeholder="대표 이메일을 작성해주세요"
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="주 연락처">
              <div className="flex gap-200">
                {PRIMARY_CONTACT_OPTIONS.map((option) => (
                  <label key={option.value} className="flex cursor-pointer items-center gap-200">
                    <input
                      type="radio"
                      value={option.value}
                      checked={primaryContact === option.value}
                      onChange={() =>
                        setValue('primaryContact', option.value, { shouldDirty: true })
                      }
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                        primaryContact === option.value
                          ? 'border-brand-primary'
                          : 'border-text-alternative',
                      )}
                    >
                      {primaryContact === option.value && (
                        <div className="bg-brand-primary h-2.5 w-2.5 rounded-full" />
                      )}
                    </div>
                    <span className="typo-body2 text-text-normal">{option.label}</span>
                  </label>
                ))}
              </div>
            </FieldBlock>
          </div>
        </AdminInfoCard>
      </div>
    </div>
  );
}

export { ClubInfoPageContent, type ClubInfoPageContentProps };
