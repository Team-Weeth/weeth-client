import { AdminInfoCard } from '@/components/admin/club-info/AdminInfoCard';
import { FieldBlock } from '@/components/admin/club-info/FieldBlock';
import { SearchSelect } from '@/components/mypage';
import { Input } from '@/components/ui';

interface ClubInfoBasicSectionProps {
  schoolNames: string[];
  school: string;
  clubName: string;
  description: string;
  descriptionError?: string;
  onSchoolChange: (value: string) => void;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
}

function ClubInfoBasicSection({
  schoolNames,
  school,
  clubName,
  description,
  descriptionError,
  onSchoolChange,
  onNameChange,
  onDescriptionChange,
}: ClubInfoBasicSectionProps) {
  return (
    <AdminInfoCard title="기본 정보" titleGapClassName="mt-[58px]" contentClassName="gap-0">
      <div className="flex flex-col gap-400">
        <FieldBlock label="소속 학교">
          <SearchSelect
            value={school}
            onChange={onSchoolChange}
            options={schoolNames}
            placeholder="학교명을 검색하세요"
            className="w-full"
            showArrow
            inputClassName="rounded-lg border border-line bg-container-neutral px-400 py-300"
          />
        </FieldBlock>

        <FieldBlock label="동아리 이름">
          <div className="flex flex-col gap-200">
            <Input
              value={clubName}
              onChange={(e) => onNameChange(e.target.value)}
              maxLength={30}
              className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
            />
            <div className="flex min-h-4 items-start justify-end gap-200">
              <span className="typo-caption2 text-text-alternative shrink-0 text-right">
                {clubName.length}/30
              </span>
            </div>
          </div>
        </FieldBlock>

        <FieldBlock label="동아리 소개">
          <div className="flex flex-col gap-200">
            <Input
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              maxLength={30}
              placeholder="동아리를 소개하는 짧은 글을 작성해주세요"
              className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
            />
            <div className="flex min-h-4 items-start justify-between gap-200">
              {descriptionError ? (
                <span className="typo-caption2 text-state-error">{descriptionError}</span>
              ) : (
                <span />
              )}
              <span className="typo-caption2 text-text-alternative shrink-0 text-right">
                {description.length}/30
              </span>
            </div>
          </div>
        </FieldBlock>
      </div>
    </AdminInfoCard>
  );
}

export { ClubInfoBasicSection };
export type { ClubInfoBasicSectionProps };
