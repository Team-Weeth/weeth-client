'use client';

import { useHomeTutorial } from '@/hooks/home/useHomeTutorial';
import { HomeTutorialButton } from './HomeTutorialButton';
import { HomeTutorialHost } from './HomeTutorialHost';

function HomeTutorialLauncher() {
  const { tutorialVariant, slides, isOpen, openTutorial, onOpenChange } = useHomeTutorial({
    autoOpen: true,
  });

  return (
    <>
      {tutorialVariant && <HomeTutorialButton onClick={openTutorial} />}
      <HomeTutorialHost open={isOpen} onOpenChange={onOpenChange} slides={slides} />
    </>
  );
}

export { HomeTutorialLauncher };
