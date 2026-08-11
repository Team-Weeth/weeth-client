'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLeaveClubMutation } from '@/hooks/mutations/mypage/useMultiProfileMutations';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import { getApiErrorMessage } from '@/utils/shared';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Icon } from '@/components/ui/Icon';
import AdminMeatballIcon from '@/assets/icons/admin/ic_admin_meatball.svg';
import { WithdrawConfirmDialog } from './WithdrawConfirmDialog';

interface LeaveClubDropdownMenuProps {
  clubId: string;
}

function LeaveClubDropdownMenu({ clubId }: LeaveClubDropdownMenuProps) {
  const router = useRouter();
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const leaveClubMutation = useLeaveClubMutation();

  const handleConfirm = async () => {
    try {
      await leaveClubMutation.mutateAsync({ clubId });
      toastSuccess('동아리에서 탈퇴되었습니다.');
      router.push('/club/select');
    } catch (error) {
      toastError(getApiErrorMessage(error) ?? '동아리 탈퇴에 실패했습니다.');
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-[24px] cursor-pointer items-center justify-center rounded-sm"
            aria-label="더보기"
          >
            <Icon src={AdminMeatballIcon} size={24} className="text-icon-alternative" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem destructive onSelect={() => setWithdrawOpen(true)}>
            탈퇴하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <WithdrawConfirmDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        onConfirm={() => {
          void handleConfirm();
        }}
        title={'동아리에서 탈퇴할까요?'}
        description={'탈퇴하면 이 동아리의 프로필과 활동 정보를 더 이상 사용할 수 없어요.'}
        confirmLabel={leaveClubMutation.isPending ? '탈퇴 중...' : '탈퇴하기'}
      />
    </>
  );
}

export { LeaveClubDropdownMenu };
