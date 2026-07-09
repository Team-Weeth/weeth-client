'use client';

import { Dialog, DialogContent } from '@/components/ui/dialog';
import { DuesOnboardingContent } from '@/components/admin/dues/DuesOnboardingContent';

interface DuesTutorialModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStart?: () => void;
}

function DuesTutorialModal({ open, onOpenChange, onStart }: DuesTutorialModalProps) {
  const handleStart = () => {
    onOpenChange(false);
    onStart?.();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="bg-background flex w-97.5 flex-col gap-0 overflow-hidden p-0"
        showCloseButton={false}
        adminMobileFullscreen={false}
      >
        <DuesOnboardingContent onStart={handleStart} />
      </DialogContent>
    </Dialog>
  );
}

export { DuesTutorialModal, type DuesTutorialModalProps };
