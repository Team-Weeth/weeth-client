'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStatusQuery } from './useProfileStatusQuery';

export function useWritePost() {
  const router = useRouter();
  const { data: profileStatus, isLoading } = useProfileStatusQuery();

  const [cardinalModalOpen, setCardinalModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleWriteClick = () => {
    if (isLoading) return;

    if (!profileStatus?.cardinalAssigned) {
      setCardinalModalOpen(true);
    } else if (!profileStatus?.profileCompleted) {
      setProfileModalOpen(true);
    } else {
      router.push('/board/write');
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
