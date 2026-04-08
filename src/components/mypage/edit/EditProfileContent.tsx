'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@/components/ui';

import { cn } from '@/lib/cn';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';
import { useMyMemberQuery } from '@/hooks/queries/mypage/useMyMemberQuery';
import { useUpdateProfileMutation } from '@/hooks/mutations/useUpdateProfileMutation';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import { formatPhone } from '@/utils/shared';

import { ProfileImageEditor } from './ProfileImageEditor';
import { PersonalInfoFields } from './PersonalInfoFields';
import { SchoolInfoFields } from './SchoolInfoFields';

type EditProfileContentProps = React.HTMLAttributes<HTMLDivElement>;

function EditProfileContent({ className, ...props }: EditProfileContentProps) {
  const router = useRouter();
  const { data: me } = useMyMemberQuery();
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onBlur',
    values: {
      name: me.name,
      bio: me.bio ?? '',
      tel: me.tel ? formatPhone(me.tel) : '',
      email: me.email,
      school: me.school,
      department: me.department,
      studentId: me.studentId,
    },
  });

  const name = useWatch({ control, name: 'name' });

  const onSubmit = (data: EditProfileFormData) => {
    updateProfile(
      {
        user: {
          name: data.name,
          email: data.email,
          studentId: data.studentId,
          tel: data.tel?.replace(/-/g, '') ?? '',
          school: data.school,
          department: data.department,
        },
        clubProfile: {
          bio: data.bio ?? '',
        },
        profileImageFile: selectedFile,
      },
      {
        onSuccess: () => {
          toastSuccess('프로필이 수정되었습니다.');
          router.push('/mypage');
        },
        onError: () => {
          toastError('프로필 수정에 실패했습니다.');
        },
      },
    );
  };

  return (
    <div
      className={cn(
        'mx-auto flex w-full max-w-[1088px] flex-col gap-[35px] px-450 pt-450 pb-[80px]',
        className,
      )}
      {...props}
    >
      <div className="flex w-full flex-col gap-200">
        <Breadcrumb>
          <BreadcrumbList>
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

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col items-center gap-700 pt-450">
        <ProfileImageEditor
          name={name}
          profileImageUrl={me.profileImageUrl ?? undefined}
          onFileChange={setSelectedFile}
        />

        <div className="flex w-full max-w-[640px] flex-col gap-700">
          <PersonalInfoFields register={register} errors={errors} setValue={setValue} />
          <SchoolInfoFields
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
          />

          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            {isPending ? '수정 중...' : '수정 완료'}
          </Button>
        </div>
      </form>
    </div>
  );
}

export { EditProfileContent, type EditProfileContentProps };
