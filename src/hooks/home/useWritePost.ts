'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useProfileStatusQuery } from './useProfileStatusQuery';
import { useSetActiveBoardId } from '@/stores/useBoardNavStore';

export function useWritePost() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { data: profileStatus, isLoading, isFetching, refetch } = useProfileStatusQuery(clubId);
  const setActiveBoardId = useSetActiveBoardId();

  const [cardinalModalOpen, setCardinalModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleWriteClick = async () => {
    if (isLoading || isFetching) return;

    let currentProfileStatus = profileStatus;

    if (!currentProfileStatus?.cardinalAssigned || !currentProfileStatus?.profileCompleted) {
      const { data: latestProfileStatus } = await refetch();
      currentProfileStatus = latestProfileStatus ?? currentProfileStatus;
    }

    if (!currentProfileStatus?.cardinalAssigned) {
      setCardinalModalOpen(true);
    } else if (!currentProfileStatus?.profileCompleted) {
      setProfileModalOpen(true);
    } else {
      setActiveBoardId(null);
      router.push(`/${clubId}/board/write`);
    }
  };

  const handleSkipProfile = () => {
    setProfileModalOpen(false);
  };

  const isProfileIncomplete = !profileStatus?.cardinalAssigned || !profileStatus?.profileCompleted;

  return {
    handleWriteClick,
    handleSkipProfile,
    isProfileIncomplete,
    cardinalModalOpen,
    setCardinalModalOpen,
    profileModalOpen,
    setProfileModalOpen,
  };
}
