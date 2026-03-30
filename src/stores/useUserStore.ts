import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  id: null as number | null,
  name: null as string | null,
  role: null as 'LEAD' | 'USER' | null,
};

export type UserState = typeof initialState;

export const useUserStore = create(
  devtools(
    combine(initialState, (set) => ({
      setUser: (user: { id: number; name: string; role: 'LEAD' | 'USER' }) =>
        set(user, false, 'setUser'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'UserStore' },
  ),
);

export const useUserId = () => useUserStore((store) => store.id);
export const useUserName = () => useUserStore((store) => store.name);
export const useUserRole = () => useUserStore((store) => store.role);
export const useSetUser = () => useUserStore((store) => store.setUser);
export const useUserReset = () => useUserStore((store) => store.reset);
