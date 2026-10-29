'use client';

import { useHomeTutorial } from '@/hooks/home/useHomeTutorial';
import { useClubFeatures } from '@/providers/club-feature-provider';
import { HomeTutorialButton } from './HomeTutorialButton';
import { HomeTutorialHost } from './HomeTutorialHost';

function HomeTutorialLauncher() {
  const { feedbackFabEnabled } = useClubFeatures();
  const { tutorialVariant, slides, isOpen, openTutorial, onOpenChange } = useHomeTutorial({
    autoOpen: true,
  });
  // A안에서는 FAB의 "서비스 안내"가 다시 보기 진입점을 대신하므로 "?" 버튼을 숨긴다. 첫 방문 자동 열림은 유지한다.
  const showTutorialButton = tutorialVariant !== null && !feedbackFabEnabled;

  return (
    <>
      {showTutorialButton && <HomeTutorialButton onClick={openTutorial} />}
      <HomeTutorialHost open={isOpen} onOpenChange={onOpenChange} slides={slides} />
    </>
  );
}

export { HomeTutorialLauncher };
