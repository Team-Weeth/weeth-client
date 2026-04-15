'use client';

import { useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { AdminInfoCard } from '@/components/admin/club-info/AdminInfoCard';
import { FieldBlock } from '@/components/admin/club-info/FieldBlock';
import { ImageUploadField } from '@/components/admin/club-info/ImageUploadField';
import type { UploadResult } from '@/components/admin/club-info/ImageUploadField';
import { ClubInfoTopBar } from '@/components/admin/club-info/ClubInfoTopBar';
import { SearchSelect } from '@/components/mypage';
import { Input } from '@/components/ui';
import { cn } from '@/lib/cn';
import { clubInfoSchema, type ClubInfoFormData } from '@/lib/schemas/clubInfo';

interface ClubInfoPageContentProps {
  schoolNames: string[];
}

const PRIMARY_CONTACT_OPTIONS = [
  { value: 'phone', label: '전화번호' },
  { value: 'email', label: '이메일' },
] as const;

const INITIAL_FORM_VALUES: ClubInfoFormData = {
  school: '가천대학교',
  name: 'WEETH',
  description: '',
  phone: '010-1234-1234',
  email: '',
  primaryContact: 'phone',
};

function ClubInfoPageContent({ schoolNames }: ClubInfoPageContentProps) {
  const {
    setValue,
    reset,
    control,
    formState: { isDirty, errors },
  } = useForm<ClubInfoFormData>({
    resolver: zodResolver(clubInfoSchema),
    defaultValues: INITIAL_FORM_VALUES,
    mode: 'onBlur',
  });

  const school = useWatch({ control, name: 'school' });
  const clubName = useWatch({ control, name: 'name' });
  const description = useWatch({ control, name: 'description' });
  const phone = useWatch({ control, name: 'phone' });
  const email = useWatch({ control, name: 'email' });
  const primaryContact = useWatch({ control, name: 'primaryContact' });

  const [profileUpload, setProfileUpload] = useState<UploadResult | null>(null);
  const [backgroundUpload, setBackgroundUpload] = useState<UploadResult | null>(null);

  const isEditMode = isDirty || profileUpload !== null || backgroundUpload !== null;

  const handleResetChanges = () => {
    reset();
    setProfileUpload(null);
    setBackgroundUpload(null);
  };

  return (
    <div className="flex min-w-3xl flex-col">
      {isEditMode && (
        <ClubInfoTopBar className="sticky top-0 z-10 -mt-15" onBack={handleResetChanges} />
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
              previewUrl={profileUpload?.fileUrl}
              onUploadComplete={setProfileUpload}
              onReset={() => setProfileUpload(null)}
            />
            <ImageUploadField
              className="min-w-0 flex-1"
              label="배경 이미지"
              title="클릭 혹은 파일을 이곳에 드롭하세요"
              description="1440 × 364 px 권장"
              ownerType="CLUB_BACKGROUND"
              previewUrl={backgroundUpload?.fileUrl}
              onUploadComplete={setBackgroundUpload}
              onReset={() => setBackgroundUpload(null)}
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
                onChange={(e) => {
                  const value = e.target.value.slice(0, 30);
                  setValue('description', value, { shouldDirty: true });
                }}
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
