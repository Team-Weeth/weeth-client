import { AdminInfoCard } from '@/components/admin/club-info/AdminInfoCard';
import { ImageUploadField } from '@/components/admin/club-info/ImageUploadField';
import type { UploadResult } from '@/components/admin/club-info/ImageUploadField';

interface ClubInfoImageSectionProps {
  profilePreviewUrl: string | null;
  backgroundPreviewUrl: string | null;
  onProfileUpload: (result: UploadResult) => void;
  onBackgroundUpload: (result: UploadResult) => void;
  onProfileReset: () => void;
  onBackgroundReset: () => void;
}

function ClubInfoImageSection({
  profilePreviewUrl,
  backgroundPreviewUrl,
  onProfileUpload,
  onBackgroundUpload,
  onProfileReset,
  onBackgroundReset,
}: ClubInfoImageSectionProps) {
  return (
    <AdminInfoCard title="이미지" titleGapClassName="mt-400" contentClassName="gap-0">
      <div className="tablet:flex-row tablet:gap-500 flex w-full flex-col gap-400">
        <ImageUploadField
          className="tablet:w-47 tablet:shrink-0 w-full"
          label="프로필 이미지"
          title="클릭하여 업로드"
          description="정사각형 권장"
          aspectRatio="1/1"
          ownerType="CLUB_PROFILE"
          previewUrl={profilePreviewUrl}
          onUploadComplete={onProfileUpload}
          onReset={onProfileReset}
        />
        <ImageUploadField
          className="tablet:flex-1 min-h-50 w-full min-w-0"
          label="배경 이미지"
          title="클릭 혹은 파일을 이곳에 드롭하세요"
          description="1440 × 364 px 권장"
          ownerType="CLUB_BACKGROUND"
          previewUrl={backgroundPreviewUrl}
          onUploadComplete={onBackgroundUpload}
          onReset={onBackgroundReset}
        />
      </div>
    </AdminInfoCard>
  );
}

export { ClubInfoImageSection };
export type { ClubInfoImageSectionProps };
