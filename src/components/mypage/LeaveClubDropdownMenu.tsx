'use client';

import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { AdminMeatballIcon } from '@/assets/icons/admin';
import { WithdrawConfirmDialog } from './WithdrawConfirmDialog';

function MyPageDropdownMenu() {
  const [withdrawOpen, setWithdrawOpen] = useState(false);

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

      <WithdrawConfirmDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
    </>
  );
}

export { MyPageDropdownMenu };
