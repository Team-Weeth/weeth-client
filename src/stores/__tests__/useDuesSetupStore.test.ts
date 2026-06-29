import { act, renderHook } from '@testing-library/react';

import {
  useDuesSetupActions,
  useDuesSetupStore,
  useDuesSetupValues,
} from '@/stores/useDuesSetupStore';

const defaultState = {
  generationNumber: 0,
  amount: '',
  name: '',
  description: '',
  selectedMemberIds: [] as number[],
  memberIdsInitialized: false,
  carryOverOption: 'none' as const,
  carryOverDescription: '',
  carryOverInitialized: false,
  accountNumber: '',
  bankName: '',
  accountHolder: '',
  accountGuide: '',
  isAccountPublic: false,
};

beforeEach(() => {
  localStorage.clear();
  useDuesSetupStore.setState(defaultState);
});

describe('초기 상태', () => {
  it('모든 필드가 기본값으로 초기화된다', () => {
    const state = useDuesSetupStore.getState();

    expect(state.generationNumber).toBe(0);
    expect(state.amount).toBe('');
    expect(state.name).toBe('');
    expect(state.description).toBe('');
    expect(state.selectedMemberIds).toEqual([]);
    expect(state.memberIdsInitialized).toBe(false);
    expect(state.carryOverOption).toBe('none');
    expect(state.carryOverDescription).toBe('');
    expect(state.carryOverInitialized).toBe(false);
    expect(state.accountNumber).toBe('');
    expect(state.bankName).toBe('');
    expect(state.accountHolder).toBe('');
    expect(state.accountGuide).toBe('');
    expect(state.isAccountPublic).toBe(false);
  });
});

describe('setField', () => {
  it('Step 1 기본 정보 필드를 업데이트한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({
        generationNumber: 10,
        amount: '50000',
        name: '2025년 1학기 회비',
        description: '정기 회비입니다',
      });
    });

    const state = useDuesSetupStore.getState();
    expect(state.generationNumber).toBe(10);
    expect(state.amount).toBe('50000');
    expect(state.name).toBe('2025년 1학기 회비');
    expect(state.description).toBe('정기 회비입니다');
  });

  it('Step 2 납부 대상 필드를 업데이트한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({
        selectedMemberIds: [1, 2, 3],
        memberIdsInitialized: true,
      });
    });

    const state = useDuesSetupStore.getState();
    expect(state.selectedMemberIds).toEqual([1, 2, 3]);
    expect(state.memberIdsInitialized).toBe(true);
  });

  it('Step 3 이월 설정 필드를 업데이트한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({
        carryOverOption: 'carry',
        carryOverDescription: '잔액을 다음 기수로 이월합니다',
        carryOverInitialized: true,
      });
    });

    const state = useDuesSetupStore.getState();
    expect(state.carryOverOption).toBe('carry');
    expect(state.carryOverDescription).toBe('잔액을 다음 기수로 이월합니다');
    expect(state.carryOverInitialized).toBe(true);
  });

  it('Step 4 계좌 공개 필드를 업데이트한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({
        accountNumber: '110-123-456789',
        bankName: '신한은행',
        accountHolder: '홍길동',
        accountGuide: '입금 시 이름을 기재해주세요',
        isAccountPublic: true,
      });
    });

    const state = useDuesSetupStore.getState();
    expect(state.accountNumber).toBe('110-123-456789');
    expect(state.bankName).toBe('신한은행');
    expect(state.accountHolder).toBe('홍길동');
    expect(state.accountGuide).toBe('입금 시 이름을 기재해주세요');
    expect(state.isAccountPublic).toBe(true);
  });

  it('업데이트하지 않은 필드는 기존 값을 유지한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({ amount: '30000' });
    });
    act(() => {
      useDuesSetupStore.getState().setField({ name: '회비' });
    });

    const state = useDuesSetupStore.getState();
    expect(state.amount).toBe('30000');
    expect(state.name).toBe('회비');
  });
});

describe('reset', () => {
  it('모든 필드를 초기 상태로 복원한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({
        amount: '50000',
        name: '회비',
        selectedMemberIds: [1, 2],
        memberIdsInitialized: true,
        carryOverOption: 'carry',
        carryOverInitialized: true,
        isAccountPublic: true,
        bankName: '카카오뱅크',
      });
    });

    act(() => {
      useDuesSetupStore.getState().reset();
    });

    const state = useDuesSetupStore.getState();
    expect(state).toMatchObject(defaultState);
  });
});

describe('useDuesSetupValues', () => {
  it('스토어의 모든 상태 필드를 반환한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({ amount: '20000', generationNumber: 7 });
    });

    const { result } = renderHook(() => useDuesSetupValues());

    expect(result.current.amount).toBe('20000');
    expect(result.current.generationNumber).toBe(7);
    expect(result.current.selectedMemberIds).toEqual([]);
    expect(result.current.carryOverOption).toBe('none');
  });
});

describe('useDuesSetupActions', () => {
  it('setField와 reset 함수를 반환한다', () => {
    const { result } = renderHook(() => useDuesSetupActions());

    expect(typeof result.current.setField).toBe('function');
    expect(typeof result.current.reset).toBe('function');
  });

  it('훅에서 받은 setField가 스토어를 업데이트한다', () => {
    const { result } = renderHook(() => useDuesSetupActions());

    act(() => {
      result.current.setField({ amount: '15000', name: '테스트 회비' });
    });

    const state = useDuesSetupStore.getState();
    expect(state.amount).toBe('15000');
    expect(state.name).toBe('테스트 회비');
  });

  it('훅에서 받은 reset이 스토어를 초기 상태로 복원한다', () => {
    act(() => {
      useDuesSetupStore.getState().setField({ amount: '99000', name: '변경됨' });
    });

    const { result } = renderHook(() => useDuesSetupActions());

    act(() => {
      result.current.reset();
    });

    const state = useDuesSetupStore.getState();
    expect(state.amount).toBe('');
    expect(state.name).toBe('');
  });
});
