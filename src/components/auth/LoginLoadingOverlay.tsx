'use client';

import { Dialog, DialogContent } from '@/components/ui';
import { Loading } from '@/components/ui/Loading';

interface LoginLoadingOverlayProps {
  open: boolean;
}

function LoginLoadingOverlay({ open }: LoginLoadingOverlayProps) {
  return (
    <Dialog open={open}>
      <DialogContent showCloseButton={false} className="flex flex-col items-center gap-600 py-600">
        <Loading className="size-20" />
        <p className="typo-sub2 text-text-alternative">진행 중 입니다...</p>
      </DialogContent>
    </Dialog>
  );
}

export { LoginLoadingOverlay };
