import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  // TODO: 로그인 API 연결 후 제거
  clubId: 'YUNJcjFKMO' as string | null,
};

export type ClubState = typeof initialState;

export const useClubStore = create(
  devtools(
    combine(initialState, (set) => ({
      setClubId: (clubId: string) => set({ clubId }, false, 'setClubId'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'ClubIdStore' },
  ),
);

export const useClubId = () => useClubStore((store) => store.clubId);
export const useSetClubId = () => useClubStore((store) => store.setClubId);
export const useClubReset = () => useClubStore((store) => store.reset);
