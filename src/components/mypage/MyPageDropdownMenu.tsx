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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { AdminMeatballIcon } from '@/assets/icons/admin';
import { useLogout } from '@/hooks';

function MyPageDropdownMenu() {
  const { clubId } = useParams<{ clubId: string }>();
  // const [withdrawOpen, setWithdrawOpen] = useState(false);
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
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>로그아웃</DropdownMenuItem>
          {/* <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setWithdrawOpen(true)}>
            서비스 탈퇴
          </DropdownMenuItem> */}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* TODO: "탈퇴하기"와 "로그아웃" 버튼에 onClick 핸들러 */}
      {/* <AlertDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        status="danger"
        title={'서비스를 탈퇴하면\n모든 활동 기록이 사라져요'}
        description={'가입한 동아리와 게시글이 모두 삭제돼요.\n버튼 클릭 시 바로 탈퇴돼요.'}
      >
        <AlertDialogAction>탈퇴하기</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog> */}

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
