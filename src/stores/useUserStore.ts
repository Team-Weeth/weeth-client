import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

import type { UserInfo } from '@/types/user';

const initialState = {
  id: null as number | null,
  name: null as string | null,
  profileImageUrl: null as string | null,
  role: null as 'LEAD' | 'ADMIN' | 'USER' | null,
};

export type UserState = typeof initialState;

export const useUserStore = create(
  devtools(
    combine(initialState, (set) => ({
      setUser: (user: UserInfo) => set(user, false, 'setUser'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'UserStore' },
  ),
);

export const useUserId = () => useUserStore((store) => store.id);
export const useUserName = () => useUserStore((store) => store.name);
export const useUserProfileImageUrl = () => useUserStore((store) => store.profileImageUrl);
export const useUserRole = () => useUserStore((store) => store.role);
export const useUserActions = () =>
  useUserStore(
    useShallow((store) => ({
      setUser: store.setUser,
      reset: store.reset,
    })),
  );
