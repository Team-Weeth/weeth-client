import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  name: null as string | null,
  profileImage: null as string | null,
};

export type AuthState = typeof initialState;

export const useAuthStore = create(
  devtools(
    combine(initialState, (set) => ({
      setProfile: (name: string, profileImage: string | null) =>
        set({ name, profileImage }, false, 'setProfile'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'AuthStore' },
  ),
);

export const useAuthName = () => useAuthStore((store) => store.name);
export const useAuthProfileImage = () => useAuthStore((store) => store.profileImage);
export const useAuthActions = () =>
  useAuthStore((store) => ({
    setProfile: store.setProfile,
    reset: store.reset,
  }));
