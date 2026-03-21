'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { AdminMeatballIcon } from '@/assets/icons/admin';

function MyPageDropdownMenu() {
  const handleEditProfile = () => {
    // TODO: 개인정보 수정 페이지 이동
  };

  const handleEditActivity = () => {
    // TODO: 활동정보 수정 페이지 이동
  };

  const handleLogout = () => {
    // TODO: 로그아웃 처리
  };

  const handleWithdraw = () => {
    // TODO: 서비스 탈퇴 처리
  };

  return (
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
        <DropdownMenuItem onSelect={handleEditProfile}>개인정보 수정</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleEditActivity}>활동정보 수정</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={handleLogout}>로그아웃</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem destructive onSelect={handleWithdraw}>
          서비스 탈퇴
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { MyPageDropdownMenu };
