import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  accountId: null as number | null,
  // 메인 화면에서 막 신규 진입했는지 여부 (메모리 전용 — partialize 제외)
  // true일 때만 step1에서 "이어서 작성" alert를 노출한다.
  isFreshEntry: false,
  // 이미 등록 완료된(REVIEW) 장부를 복원한 수정 모드 여부.
  // true면 최종 단계에서 complete(POST) 대신 patch만 반영하고 종료한다.
  isEditMode: false,
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
      {
        name: 'duesSetup',
        // accountId는 메모리에만 유지 (새로고침/재접속 시 null 초기화 → 초안 생성 API 재호출)
        // 같은 세션 내 Step2 → Step1 이동 시에는 메모리 값으로 재호출 방지
        partialize: (state) => ({
          isEditMode: state.isEditMode,
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
        }),
        // 구 버전 localStorage에 accountId가 남아있어도 항상 null로 초기화
        merge: (persisted, current) => ({
          ...current,
          ...(persisted as Partial<DuesSetupState>),
          accountId: null,
        }),
      },
    ),
    { name: 'DuesSetupStore' },
  ),
);

export const useDuesSetupValues = () =>
  useDuesSetupStore(
    useShallow((state) => ({
      accountId: state.accountId,
      isFreshEntry: state.isFreshEntry,
      isEditMode: state.isEditMode,
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
