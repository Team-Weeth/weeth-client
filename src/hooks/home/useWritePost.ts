'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProfileStatusQuery } from './useProfileStatusQuery';

export function useWritePost() {
  const router = useRouter();
  const { data: profileStatus } = useProfileStatusQuery();

  const [cardinalModalOpen, setCardinalModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const handleWriteClick = () => {
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
    router.push('/board/write');
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
