'use client';

import { useState } from 'react';
import Link from 'next/link';
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

function MyPageDropdownMenu() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);

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
            <Link href="/mypage/edit">개인정보 수정</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setLogoutOpen(true)}>로그아웃</DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem destructive onSelect={() => setWithdrawOpen(true)}>
            서비스 탈퇴
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* TODO: "탈퇴하기"와 "로그아웃" 버튼에 onClick 핸들러 */}
      <AlertDialog
        open={withdrawOpen}
        onOpenChange={setWithdrawOpen}
        status="danger"
        title={'동아리를 탈퇴하면\n남긴 추억이 모두 사라져요'}
        description={'동아리에 게시한 게시글은 남아있지 않아요.\n버튼 클릭 시 바로 탈퇴돼요.'}
      >
        <AlertDialogAction>탈퇴하기</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>

      <AlertDialog
        open={logoutOpen}
        onOpenChange={setLogoutOpen}
        title={'로그아웃'}
        description="로그아웃 하시겠습니까?"
      >
        <AlertDialogAction>로그아웃</AlertDialogAction>
        <AlertDialogCancel>취소</AlertDialogCancel>
      </AlertDialog>
    </>
  );
}

export { MyPageDropdownMenu };
