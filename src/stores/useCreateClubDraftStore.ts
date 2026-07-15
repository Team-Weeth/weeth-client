import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

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
    persist(
      combine(initialState, (set) => ({
        setDraft: (draft: Partial<CreateClubDraftState>) => set(draft, false, 'setDraft'),
        reset: () => set(initialState, false, 'reset'),
      })),
      {
        name: 'createClubDraft',
        partialize: (state) => ({
          school: state.school,
          name: state.name,
          description: state.description,
          generation: state.generation,
          phone: state.phone,
          email: state.email,
          contactType: state.contactType,
        }),
      },
    ),
    { name: 'CreateClubDraftStore' },
  ),
);

export const useCreateClubDraftValues = () =>
  useCreateClubDraftStore(
    useShallow((state) => ({
      school: state.school,
      name: state.name,
      description: state.description,
      generation: state.generation,
      phone: state.phone,
      email: state.email,
      contactType: state.contactType,
    })),
  );

export const useCreateClubDraftActions = () =>
  useCreateClubDraftStore(
    useShallow((state) => ({
      setDraft: state.setDraft,
      reset: state.reset,
    })),
  );
