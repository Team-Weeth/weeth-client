import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  cardinalNumber: 0,
  // Step 1: 기본 정보
  amount: '',
  name: '',
  description: '',
  // Step 2: 납부 대상
  selectedMemberIds: [] as number[],
  memberIdsInitialized: false,
  // Step 3: 이월 설정
  carryOverOption: 'none' as 'none' | 'carry',
  carryOverDescription: '',
  carryOverInitialized: false,
  // Step 4: 계좌 공개
  accountNumber: '',
  bankName: '',
  accountHolder: '',
  accountGuide: '',
  isAccountPublic: false,
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
      cardinalNumber: state.cardinalNumber,
      amount: state.amount,
      name: state.name,
      description: state.description,
      selectedMemberIds: state.selectedMemberIds,
      memberIdsInitialized: state.memberIdsInitialized,
      carryOverOption: state.carryOverOption,
      carryOverDescription: state.carryOverDescription,
      carryOverInitialized: state.carryOverInitialized,
      accountNumber: state.accountNumber,
      bankName: state.bankName,
      accountHolder: state.accountHolder,
      accountGuide: state.accountGuide,
      isAccountPublic: state.isAccountPublic,
    })),
  );

export const useDuesSetupActions = () =>
  useDuesSetupStore(
    useShallow((state) => ({
      setField: state.setField,
      reset: state.reset,
    })),
  );
