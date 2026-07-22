'use client';

import { useEffect } from 'react';
import { isAxiosError } from 'axios';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, Button, Icon } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { cn } from '@/lib/cn';
import { createEditProfileSchema, type EditProfileFormData } from '@/lib/schemas/editProfile';
import { useUpdateProfileMutation } from '@/hooks/mutations/useUpdateProfileMutation';
import { toastSuccess, toastError } from '@/stores/useToastStore';
import { formatPhone } from '@/utils/shared';
import { EditProfileSkeleton } from '@/components/mypage/skeleton';
import { PersonalInfoFields } from './PersonalInfoFields';
import { SchoolInfoFields } from './SchoolInfoFields';
import { BackIcon } from '@/assets/icons';

const toFormString = (value: string | null | undefined) => value ?? '';

interface EditProfileContentProps extends React.HTMLAttributes<HTMLDivElement> {
  schools: string[];
  majors: string[];
}

function EditProfileContent({ className, schools, majors, ...props }: EditProfileContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { summaryQuery, me, currentProfile } = useMyPageQueries(clubId);
  const { mutate: updateProfile, isPending } = useUpdateProfileMutation();
  const selectedFile: File | null = null;
  const resetToDefault = false;
  const editProfileSchema = createEditProfileSchema();

  const {
    handleSubmit,
    control,
    reset,
    trigger,
    formState: { isDirty, isValid },
  } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileSchema),
    mode: 'onChange',
    reValidateMode: 'onChange',
    defaultValues: {
      name: '',
      bio: '',
      phone: '',
      email: '',
      school: '',
      department: '',
      studentId: '',
    },
  });

  useEffect(() => {
    if (!me) return;

    const nextValues = {
      name: toFormString(me.name),
      bio: toFormString(currentProfile?.bio),
      phone: me.tel ? formatPhone(me.tel) : '',
      email: toFormString(me.email),
      school: toFormString(me.school),
      department: toFormString(me.department),
      studentId: toFormString(me.studentId),
    };

    reset(nextValues);
    void trigger(['phone', 'school', 'department', 'studentId']);
  }, [currentProfile?.bio, me, reset, trigger]);

  const hasChanges = isDirty || !!selectedFile || resetToDefault;

  const { open, onConfirm, onCancel, allowNavigation } = useNavigationGuard({
    enabled: hasChanges,
  });

  const onSubmit = (data: EditProfileFormData) => {
    updateProfile(
      {
        clubId,
        user: {
          name: data.name,
          email: data.email,
          studentId: data.studentId,
          tel: data.phone?.replace(/-/g, '') ?? '',
          school: data.school,
          department: data.department,
        },
      },
      {
        onSuccess: () => {
          toastSuccess('프로필이 수정되었습니다.');
          allowNavigation();
          router.push(`/${clubId}/mypage`);
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
  const submitForm = handleSubmit(onSubmit);

  if (summaryQuery.isPending || !me) {
    return <EditProfileSkeleton className={className} {...props} />;
  }

  return (
    <>
      <div
        className={cn(
          'tablet:px-450 tablet:pt-450 tablet:gap-4 tablet:pb-[80px] mx-auto flex w-full max-w-[1088px] flex-col gap-300 pb-[140px]',
          className,
        )}
        {...props}
      >
        <div className="tablet:pt-0 flex items-center gap-1 pt-300">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex items-center justify-center p-1"
          >
            <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
          </button>
          <div className="flex flex-col gap-1">
            <h1 className="tablet:typo-h3 typo-sub1 text-text-normal">개인정보 수정</h1>
          </div>
        </div>

        <form onSubmit={submitForm} className="flex flex-col items-center gap-600 pt-450">
          <div className="flex w-full max-w-[640px] flex-col gap-600">
            <div className="flex flex-col gap-500">
              <PersonalInfoFields control={control} />
              <SchoolInfoFields control={control} schools={schools} majors={majors} />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isPending || !isValid || !hasChanges}
              className="tablet:flex hidden w-full"
            >
              {isPending ? '수정 중...' : '수정 완료'}
            </Button>
          </div>
        </form>
      </div>
      <div className="tablet:hidden fixed inset-x-0 bottom-12 z-20 px-450">
        <Button
          type="button"
          size="lg"
          disabled={isPending || !isValid || !hasChanges}
          className="w-full"
          onClick={submitForm}
        >
          {isPending ? '수정 중...' : '수정 완료'}
        </Button>
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
