import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  clubId: null as string | null,
  clubName: null as string | null,
  clubProfileImageUrl: null as string | null,
};

export type ClubState = typeof initialState;

export const useClubStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        setClubId: (clubId: string) =>
          set({ clubId, clubName: null, clubProfileImageUrl: null }, false, 'setClubId'),
        setClub: (clubId: string, clubName: string, clubProfileImageUrl?: string | null) =>
          set(
            { clubId, clubName, clubProfileImageUrl: clubProfileImageUrl ?? null },
            false,
            'setClub',
          ),
        reset: () => set(initialState, false, 'reset'),
      })),
      { name: 'clubId' },
    ),
    { name: 'ClubStore' },
  ),
);

export const useClubId = () => useClubStore((store) => store.clubId);
export const useClubName = () => useClubStore((store) => store.clubName);
export const useClubProfileImageUrl = () => useClubStore((store) => store.clubProfileImageUrl);
export const useClubActions = () =>
  useClubStore(
    useShallow((store) => ({
      setClubId: store.setClubId,
      setClub: store.setClub,
      reset: store.reset,
    })),
  );
