'use client';

import { useState } from 'react';
import { Home } from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage, Button, Input } from '@/components/ui';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui';
import { Icon } from '@/components/ui';
import { EditIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

import { FormField } from './FormField';
import { SearchSelect } from './SearchSelect';
import { MOCK_DEPARTMENTS, MOCK_UNIVERSITIES, MOCK_USER } from '@/constants/mock';

// TODO: API 연동 시 실제 데이터로 교체
function formatPhone(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
}

type EditProfileContentProps = React.HTMLAttributes<HTMLDivElement>;

function EditProfileContent({ className, ...props }: EditProfileContentProps) {
  const [name, setName] = useState(MOCK_USER.name);
  const [bio, setBio] = useState(MOCK_USER.bio);
  const [phone, setPhone] = useState(MOCK_USER.phone);
  const [email, setEmail] = useState(MOCK_USER.email);
  const [university, setUniversity] = useState(MOCK_USER.university);
  const [department, setDepartment] = useState(MOCK_USER.department);
  const [studentId, setStudentId] = useState(MOCK_USER.studentId);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSubmit = () => {
    // TODO: API 연동
    console.log({ name, bio, phone, email, university, department, studentId });
  };


  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1088px] flex-col gap-[35px] px-450 pt-450 pb-[80px]',
        className,
      )}
      {...props}
    >
      {/* PageNavigation */}
      <div className="flex w-full flex-col gap-200">
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/home">
                  <Home size={16} />
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/mypage" className="typo-caption1 text-text-alternative">
                  My
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>개인정보 수정</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <h1 className="typo-h2 text-text-strong">개인정보 수정</h1>
      </div>

      {/* Body */}
      <div className="flex flex-col items-center gap-700 pt-450">
        {/* 아바타 + 편집 버튼 */}
        <div className="relative inline-block">
          <Avatar size={128} type="round">
            {MOCK_USER.profileImageUrl && (
              <AvatarImage src={MOCK_USER.profileImageUrl} alt={name} />
            )}
            <AvatarFallback>{name.charAt(0)}</AvatarFallback>
          </Avatar>
          <button
            type="button"
            aria-label="프로필 이미지 수정"
            className="bg-button-neutral absolute right-0 bottom-0 flex size-[40px] cursor-pointer items-center justify-center rounded-sm"
          >
            <Icon src={EditIcon} size={24} className="text-icon-normal" alt="편집 아이콘" />
          </button>
        </div>

        {/* 폼 */}
        <div className="flex w-full max-w-[640px] flex-col gap-700">
          {/* 개인정보 필드 그룹 */}
          <div className="flex flex-col gap-400">
            <FormField label="이름">
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="이름을 입력하세요"
                className="rounded-lg"
              />
            </FormField>

            <FormField label="소개글 (선택)" hint="30자 제한">
              <Input
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, 30))}
                placeholder="소개글을 입력하세요"
                className="rounded-lg"
              />
            </FormField>

            <FormField label="연락처 (선택)">
              <Input
                value={phone}
                onChange={handlePhoneChange}
                placeholder="010-0000-0000"
                inputMode="numeric"
                className="rounded-lg"
              />
            </FormField>

            <FormField label="이메일">
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                placeholder="이메일을 입력하세요"
                className="rounded-lg"
              />
            </FormField>
          </div>

          {/* 학교 정보 필드 그룹 */}
          <div className="flex flex-col gap-400">
            <FormField label="학교">
              <SearchSelect
                value={university}
                onChange={setUniversity}
                options={MOCK_UNIVERSITIES}
                placeholder="학교 선택"
              />
            </FormField>

            <FormField label="학과">
              <SearchSelect
                value={department}
                onChange={setDepartment}
                options={MOCK_DEPARTMENTS}
                placeholder="학과 선택"
              />
            </FormField>

            <FormField label="학번">
              <Input
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                placeholder="학번을 입력하세요"
                inputMode="numeric"
                className="rounded-lg"
              />
            </FormField>
          </div>

          <Button size="lg" onClick={handleSubmit} className="w-full">
            수정 완료
          </Button>
        </div>
      </div>
    </div>
  );
}

export { EditProfileContent, type EditProfileContentProps };
