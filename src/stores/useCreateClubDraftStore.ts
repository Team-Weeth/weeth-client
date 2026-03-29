import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

const initialState = {
  school: '',
  name: '',
  description: '',
  generation: '',
  phone: '',
  email: '',
  contactType: 'phone' as 'phone' | 'email',
};

export type CreateClubDraftState = typeof initialState;

export const useCreateClubDraftStore = create(
  devtools(
    combine(initialState, (set) => ({
      setDraft: (draft: Partial<CreateClubDraftState>) => set(draft, false, 'setDraft'),
      reset: () => set(initialState, false, 'reset'),
    })),
    { name: 'CreateClubDraftStore' },
  ),
);
