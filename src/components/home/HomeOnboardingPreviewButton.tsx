'use client';

import { useState } from 'react';

import { Button } from '@/components/ui';

import { HomeOnboardingDialog } from './HomeTutorialDialog';

function HomeOnboardingPreviewButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="secondary" size="lg" onClick={() => setOpen(true)}>
        온보딩 모달 보기
      </Button>
      <HomeOnboardingDialog open={open} onOpenChange={setOpen} />
    </>
  );
}

export { HomeOnboardingPreviewButton };
