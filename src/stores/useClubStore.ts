import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { ClubIdentifier } from '@/types/club';

const initialState = {
  clubId: null as string | null,
  clubName: null as string | null,
};

export type ClubState = typeof initialState;

export const useClubStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        setClubId: (clubId: string) => set({ clubId, clubName: null }, false, 'setClubId'),
        setClub: (clubId: string, clubName: string) => set({ clubId, clubName }, false, 'setClub'),
        reset: () => set(initialState, false, 'reset'),
      })),
      { name: 'clubId' },
    ),
    { name: 'ClubStore' },
  ),
);

export const useClubId = () => useClubStore((store) => store.clubId);
export const useClubName = () => useClubStore((store) => store.clubName);
export const useClubActions = () =>
  useClubStore(
    useShallow((store) => ({
      setClubId: store.setClubId,
      setClub: store.setClub,
      reset: store.reset,
    })),
  );
