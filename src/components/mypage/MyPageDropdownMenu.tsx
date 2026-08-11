'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import AdminMeatballIcon from '@/assets/icons/admin/ic_admin_meatball.svg';
import { useLogout } from '@/hooks/useLogout';

function MyPageDropdownMenu() {
  const { clubId } = useParams<{ clubId: string }>();
  const [logoutOpen, setLogoutOpen] = useState(false);
  const handleLogout = useLogout();

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="flex size-[40px] cursor-pointer items-center justify-center rounded-sm"
            aria-label="더보기"
          >
            <Icon src={AdminMeatballIcon} size={24} className="text-icon-normal" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem asChild>
            <Link href={`/${clubId}/mypage/edit`}>개인정보 수정</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={'로그아웃'}
        description="로그아웃 하시겠습니까?"
      >
        <AlertDialogAction onClick={handleLogout}>로그아웃</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </>
  );
}

export { MyPageDropdownMenu };
