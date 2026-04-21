'use client';

import { useState } from 'react';
import { isAxiosError } from 'axios';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Button,
} from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { cn } from '@/lib/cn';
import { editProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';
import { useMyMemberQuery } from '@/hooks/queries/mypage/useMyMemberQuery';
import { useUpdateProfileMutation } from '@/hooks/mutations/useUpdateProfileMutation';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import { formatPhone } from '@/utils/shared';
import { ProfileImageEditor } from './ProfileImageEditor';
import { PersonalInfoFields } from './PersonalInfoFields';
import { SchoolInfoFields } from './SchoolInfoFields';

interface EditProfileContentProps extends React.HTMLAttributes<HTMLDivElement> {
  schools: string[];
  majors: string[];
}

function EditProfileContent({ className, schools, majors, ...props }: EditProfileContentProps) {
  const router = useRouter();
  const { data: me } = useMyMemberQuery();
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { isDirty },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: me.name,
      bio: me.bio ?? '',
      phone: me.tel ? formatPhone(me.tel) : '',
      email: me.email,
      school: me.school,
      department: me.department,
      studentId: me.studentId,
    },
  });

  const name = useWatch({ control, name: 'name' });
  const [watchedPhone, watchedSchool, watchedDepartment, watchedStudentId] = useWatch({
    control,
    name: ['phone', 'school', 'department', 'studentId'],
  });

  const hasRequiredFields = !!(
    watchedPhone &&
    watchedSchool &&
    watchedDepartment &&
    watchedStudentId
  );
  const hasChanges = isDirty || !!selectedFile;

  const { open, onConfirm, onCancel, allowNavigation } = useNavigationGuard({
    enabled: isDirty || !!selectedFile,
  });

  const onSubmit = (data: EditProfileFormData) => {
    updateProfile(
      {
        user: {
          name: data.name,
          email: data.email,
          studentId: data.studentId,
          tel: data.phone?.replace(/-/g, '') ?? '',
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
          allowNavigation();
          router.push('/mypage');
        },
        onError: (error) => {
          const message =
            isAxiosError(error) && error.response?.data?.message
              ? error.response.data.message
              : '프로필 수정에 실패했습니다.';
          toastError(message);
        },
      },
    );
  };

  return (
    <>
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

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col items-center gap-600 pt-450"
        >
          <ProfileImageEditor
            name={name}
            profileImageUrl={me.profileImageUrl ?? undefined}
            onFileChange={setSelectedFile}
          />

          <div className="flex w-full max-w-[640px] flex-col gap-600">
            <div className="flex flex-col gap-500">
              <PersonalInfoFields register={register} control={control} />
              <SchoolInfoFields
                control={control}
                setValue={setValue}
                schools={schools}
                majors={majors}
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || !hasRequiredFields || !hasChanges}
              className="w-full"
            >
              {isPending ? '수정 중...' : '수정 완료'}
            </Button>
          </div>
        </form>
      </div>
      <AlertDialog
        status="danger"
        open={open}
        onOpenChange={(isOpen) => !isOpen && onCancel()}
        title="변경 사항이 저장되지 않았어요"
        description={'지금 취소하면 수정 중인 내용이 사라집니다.\n계속하시겠어요?'}
      >
        <AlertDialogAction onClick={onConfirm}>취소하기</AlertDialogAction>
        <AlertDialogCancel>계속 수정</AlertDialogCancel>
      </AlertDialog>
    </>
  );
}

export { EditProfileContent, type EditProfileContentProps };
