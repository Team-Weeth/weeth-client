'use client';

import { useEffect, useState, useSyncExternalStore } from 'react';
import { useParams } from 'next/navigation';
import { useHomeQuery } from '@/hooks/home/useHomeQuery';
import {
  HOME_TUTORIAL_SLIDES,
  getHomeTutorialPendingKey,
  getHomeTutorialSeenKey,
  getHomeTutorialVariantByRole,
} from '@/constants/home/tutorial';

interface UseHomeTutorialOptions {
  /**
   * 가입·생성 직후 첫 방문 시 튜토리얼을 자동으로 열지 여부.
   * 자동 열림은 홈에서만 동작해야 하므로 홈 런처만 true로 사용한다.
   */
  autoOpen: boolean;
}

function subscribeTutorialStorage(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener('storage', callback);
  };
}

/**
 * 홈 튜토리얼의 역할별 슬라이드와 열림 상태를 관리한다.
 * 홈의 "?" 버튼(B안)과 서비스 안내 FAB(A안)가 같은 슬라이드·자동 열림 규칙을 공유하도록 분리했다.
 */
function useHomeTutorial({ autoOpen }: UseHomeTutorialOptions) {
  const { clubId } = useParams<{ clubId: string }>();
  const [open, setOpen] = useState(false);
  const [autoOpenDismissed, setAutoOpenDismissed] = useState(false);

  const { data: role } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.role,
  });
  const tutorialVariant = getHomeTutorialVariantByRole(role);
  const slides = tutorialVariant ? HOME_TUTORIAL_SLIDES[tutorialVariant] : [];
  const hasSeenTutorial = useSyncExternalStore(
    subscribeTutorialStorage,
    () =>
      tutorialVariant
        ? window.localStorage.getItem(getHomeTutorialSeenKey(clubId, tutorialVariant)) === 'true'
        : false,
    () => false,
  );
  const pendingLeadClubId = useSyncExternalStore(
    subscribeTutorialStorage,
    () => window.sessionStorage.getItem(getHomeTutorialPendingKey('lead')),
    () => null,
  );
  const pendingMemberClubId = useSyncExternalStore(
    subscribeTutorialStorage,
    () => window.sessionStorage.getItem(getHomeTutorialPendingKey('member')),
    () => null,
  );
  const pendingClubId =
    tutorialVariant === 'lead'
      ? pendingLeadClubId
      : tutorialVariant === 'member'
        ? pendingMemberClubId
        : null;

  const shouldAutoOpen =
    autoOpen &&
    tutorialVariant !== null &&
    pendingClubId === clubId &&
    !hasSeenTutorial &&
    !autoOpenDismissed;

  useEffect(() => {
    if (!autoOpen) return;
    if (role !== 'LEAD' && pendingLeadClubId === clubId) {
      window.sessionStorage.removeItem(getHomeTutorialPendingKey('lead'));
    }
    if (role !== 'USER' && pendingMemberClubId === clubId) {
      window.sessionStorage.removeItem(getHomeTutorialPendingKey('member'));
    }
  }, [autoOpen, clubId, pendingLeadClubId, pendingMemberClubId, role]);

  useEffect(() => {
    if (!autoOpen || !tutorialVariant || pendingClubId !== clubId) return;
    if (hasSeenTutorial) {
      window.sessionStorage.removeItem(getHomeTutorialPendingKey(tutorialVariant));
    }
  }, [autoOpen, clubId, hasSeenTutorial, pendingClubId, tutorialVariant]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (!nextOpen && shouldAutoOpen && tutorialVariant) {
      window.localStorage.setItem(getHomeTutorialSeenKey(clubId, tutorialVariant), 'true');
      window.sessionStorage.removeItem(getHomeTutorialPendingKey(tutorialVariant));
      setAutoOpenDismissed(true);
    }

    setOpen(nextOpen);
  };

  return {
    tutorialVariant,
    slides,
    isOpen: open || shouldAutoOpen,
    openTutorial: () => setOpen(true),
    onOpenChange: handleOpenChange,
  };
}

export { useHomeTutorial, type UseHomeTutorialOptions };
