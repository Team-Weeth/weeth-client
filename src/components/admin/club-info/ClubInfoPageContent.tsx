'use client';

import { useState } from 'react';

import { AdminInfoCard } from '@/components/admin/club-info/AdminInfoCard';
import { ImageUploadField } from '@/components/admin/club-info/ImageUploadField';
import { ClubInfoTopBar } from '@/components/admin/club-info/ClubInfoTopBar';
import { SearchSelect } from '@/components/mypage';
import { Button, Input } from '@/components/ui';
import { cn } from '@/lib/cn';

function FieldBlock({
  label,
  helper,
  children,
}: {
  label: string;
  helper?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-300">
      <span className="typo-caption1 text-text-normal">{label}</span>
      {children}
      {helper && <span className="typo-caption2 text-text-alternative">{helper}</span>}
    </div>
  );
}

interface ClubInfoPageContentProps {
  schoolNames: string[];
}

function ClubInfoPageContent({ schoolNames }: ClubInfoPageContentProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  const [school, setSchool] = useState('가천대학교');
  const [primaryContact, setPrimaryContact] = useState<'phone' | 'email'>('phone');

  return (
    <div className="flex min-w-3xl flex-col">
      {isEditMode && (
        <ClubInfoTopBar className="sticky top-0 z-10 -mt-15" onBack={() => setIsEditMode(false)} />
      )}

      <div className="flex flex-col items-start gap-400 px-400 py-600">
        <AdminInfoCard title="이미지" titleGapClassName="mt-400" contentClassName="gap-0">
          <div className="flex w-full gap-500">
            <ImageUploadField
              className="w-47 shrink-0"
              label="프로필 이미지"
              title="파일 업로드"
              description="정사각형 권장"
              aspectRatio="1/1"
            />
            <ImageUploadField
              className="min-w-0 flex-1"
              label="배경 이미지"
              title="클릭 혹은 파일을 이곳에 드롭하세요"
              description="1440 × 364 px 권장"
            />
          </div>
        </AdminInfoCard>

        <AdminInfoCard title="기본 정보" titleGapClassName="mt-[58px]" contentClassName="gap-0">
          <div className="flex flex-col gap-400">
            <FieldBlock label="소속 학교">
              <SearchSelect
                value={school}
                onChange={setSchool}
                options={schoolNames}
                placeholder="학교명을 검색하세요"
                className="w-full"
                inputClassName="rounded-lg border border-line bg-container-neutral px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="동아리 이름">
              <Input
                value="WEETH"
                readOnly
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="동아리 소개" helper="최대 30자">
              <Input
                value="동아리를 소개하는 짧은 글을 작성해주세요"
                readOnly
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>
          </div>
        </AdminInfoCard>

        <AdminInfoCard title="연락처" titleGapClassName="mt-[58px]" contentClassName="gap-0">
          <div className="flex flex-col gap-400">
            <FieldBlock label="대표 전화번호">
              <Input
                value="010-1234-1234"
                readOnly
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="대표 이메일">
              <Input
                value="대표 이메일을 작성해주세요"
                readOnly
                className="bg-container-neutral-alternative rounded-sm border-transparent px-400 py-300"
              />
            </FieldBlock>

            <FieldBlock label="주 연락처">
              <div className="flex gap-200">
                {(['phone', 'email'] as const).map((type) => (
                  <label key={type} className="flex cursor-pointer items-center gap-200">
                    <input
                      type="radio"
                      value={type}
                      checked={primaryContact === type}
                      onChange={() => setPrimaryContact(type)}
                      className="sr-only"
                    />
                    <div
                      className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors',
                        primaryContact === type
                          ? 'border-brand-primary'
                          : 'border-text-alternative',
                      )}
                    >
                      {primaryContact === type && (
                        <div className="bg-brand-primary h-2.5 w-2.5 rounded-full" />
                      )}
                    </div>
                    <span className="typo-body2 text-text-normal">
                      {type === 'phone' ? '전화번호' : '이메일'}
                    </span>
                  </label>
                ))}
              </div>
            </FieldBlock>
          </div>
        </AdminInfoCard>

        {!isEditMode && (
          <div className="flex w-full max-w-[942px] justify-end">
            <Button variant="primary" size="lg" onClick={() => setIsEditMode(true)}>
              수정하기
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

export { ClubInfoPageContent, type ClubInfoPageContentProps };
