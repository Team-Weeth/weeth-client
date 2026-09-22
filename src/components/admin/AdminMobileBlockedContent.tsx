'use client';

import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { Dialog as DialogPrimitive } from 'radix-ui';
import { Button } from '@/components/ui/Button';
import { MobileBlocker } from '@/components/ui/MobileBlocker';
import { ADMIN_PAGE_LABELS } from '@/constants/admin/adminPage.constants';

function getAdminPageLabel(pathname: string) {
  const segment = pathname.match(/\/admin\/([^/]+)/)?.[1] ?? '';
  return ADMIN_PAGE_LABELS[segment] ?? '이전';
}

function AdminMobileBlockedContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const adminPageLabel = getAdminPageLabel(pathname ?? '');

  return (
    <>
      <div className="tablet:contents hidden">{children}</div>
      <div className="tablet:hidden">
        <DialogPrimitive.Title className="sr-only">PC 버전으로 접속해주세요</DialogPrimitive.Title>
        <MobileBlocker
          action={
            <DialogPrimitive.Close asChild>
              <Button variant="primary" size="md">
                {adminPageLabel} 페이지로 돌아가기
              </Button>
            </DialogPrimitive.Close>
          }
        />
      </div>
    </>
  );
}

export { AdminMobileBlockedContent };
