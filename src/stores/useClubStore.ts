import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';

const initialState = {
  clubId: null as string | null,
};

export type ClubState = typeof initialState;

export const useClubStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        setClubId: (clubId: string) => set({ clubId }, false, 'setClubId'),
        reset: () => set(initialState, false, 'reset'),
      })),
      { name: 'clubId' },
    ),
    { name: 'ClubIdStore' },
  ),
);

export const useClubId = () => useClubStore((store) => store.clubId);
export const useClubActions = () =>
  useClubStore((store) => ({
    setClubId: store.setClubId,
    reset: store.reset,
  }));
