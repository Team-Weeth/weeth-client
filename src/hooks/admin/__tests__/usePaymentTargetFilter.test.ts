import { act, renderHook } from '@testing-library/react';

import { usePaymentTargetFilter } from '@/hooks/admin/usePaymentTargetFilter';
import type { PaymentTarget } from '@/types/admin/dues';

function createTarget(clubMemberId: number, name: string): PaymentTarget {
  return {
    targetId: clubMemberId,
    paymentTargetInfo: {
      userId: clubMemberId,
      clubMemberId,
      name,
      tel: '010-0000-0000',
      school: '가천대',
      department: '소프트웨어학과',
      memberRole: 'USER',
      memberStatus: 'ACTIVE',
      profileImageUrl: null,
    },
    targetStatus: 'TARGETED',
    paymentStatus: 'UNPAID',
    dueAmount: 10000,
    paidAmount: 0,
    paidAt: null,
    confirmedBy: null,
    memo: null,
  };
}

function createTargets(count: number): PaymentTarget[] {
  return Array.from({ length: count }, (_, i) => createTarget(i + 1, `회원${i + 1}`));
}

describe('개수 집계', () => {
  it('전체/선택/제외 인원 수를 계산한다', () => {
    const targets = createTargets(5);
    const { result } = renderHook(() => usePaymentTargetFilter(targets, [1, 2, 3]));

    expect(result.current.totalCount).toBe(5);
    expect(result.current.selectedCount).toBe(3);
    expect(result.current.excludedCount).toBe(2);
  });
});

describe('탭 필터', () => {
  const targets = createTargets(4);

  it('all 탭은 모든 대상을 보여준다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter(targets, [1, 2], 'all'));
    expect(result.current.filteredTargets).toHaveLength(4);
  });

  it('selected 탭은 선택된 회원만 보여준다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter(targets, [1, 2], 'selected'));

    const ids = result.current.filteredTargets.map((t) => t.paymentTargetInfo.clubMemberId);
    expect(ids).toEqual([1, 2]);
  });

  it('excluded 탭은 선택되지 않은 회원만 보여준다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter(targets, [1, 2], 'excluded'));

    const ids = result.current.filteredTargets.map((t) => t.paymentTargetInfo.clubMemberId);
    expect(ids).toEqual([3, 4]);
  });
});

describe('검색', () => {
  it('이름에 검색어가 포함된 대상만 남긴다', () => {
    const targets = [createTarget(1, '김위드'), createTarget(2, '이위드'), createTarget(3, '박클럽')];
    const { result } = renderHook(() => usePaymentTargetFilter(targets, []));

    act(() => {
      result.current.handleSearch('위드');
    });

    const names = result.current.filteredTargets.map((t) => t.paymentTargetInfo.name);
    expect(names).toEqual(['김위드', '이위드']);
  });

  it('앞뒤 공백은 무시하고 검색한다', () => {
    const targets = [createTarget(1, '김위드'), createTarget(2, '박클럽')];
    const { result } = renderHook(() => usePaymentTargetFilter(targets, []));

    act(() => {
      result.current.handleSearch('  김위드  ');
    });

    expect(result.current.filteredTargets).toHaveLength(1);
  });
});

describe('페이지네이션', () => {
  it('한 페이지에 최대 10명씩 보여준다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter(createTargets(23), []));

    expect(result.current.totalPages).toBe(3);
    expect(result.current.pagedTargets).toHaveLength(10);
  });

  it('페이지를 이동하면 해당 구간의 대상을 보여준다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter(createTargets(23), []));

    act(() => {
      result.current.setPage(3);
    });

    expect(result.current.pagedTargets).toHaveLength(3);
    expect(result.current.pagedTargets[0].paymentTargetInfo.clubMemberId).toBe(21);
  });

  it('대상이 없어도 totalPages는 최소 1이다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter([], []));
    expect(result.current.totalPages).toBe(1);
  });
});

describe('페이지 초기화', () => {
  it('탭을 바꾸면 첫 페이지로 돌아간다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter(createTargets(23), [1, 2]));

    act(() => {
      result.current.setPage(3);
    });
    act(() => {
      result.current.handleTabChange('selected');
    });

    expect(result.current.page).toBe(1);
    expect(result.current.tab).toBe('selected');
  });

  it('검색어를 입력하면 첫 페이지로 돌아간다', () => {
    const { result } = renderHook(() => usePaymentTargetFilter(createTargets(23), []));

    act(() => {
      result.current.setPage(2);
    });
    act(() => {
      result.current.handleSearch('회원1');
    });

    expect(result.current.page).toBe(1);
  });
});
