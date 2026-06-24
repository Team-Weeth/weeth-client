import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  generationNumber: 0,
  // Step 1: 기본 정보
  amount: '',
  name: '',
  description: '',
};

export type DuesSetupState = typeof initialState;

export const useDuesSetupStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        setField: (field: Partial<DuesSetupState>) => set(field, false, 'setField'),
        reset: () => set(initialState, false, 'reset'),
      })),
      { name: 'duesSetup' },
    ),
    { name: 'DuesSetupStore' },
  ),
);

export const useDuesSetupValues = () =>
  useDuesSetupStore(
    useShallow((state) => ({
      generationNumber: state.generationNumber,
      amount: state.amount,
      name: state.name,
      description: state.description,
    })),
  );

export const useDuesSetupActions = () =>
  useDuesSetupStore(
    useShallow((state) => ({
      setField: state.setField,
      reset: state.reset,
    })),
  );
