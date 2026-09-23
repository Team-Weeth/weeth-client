import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';
import { apiClient } from '@/lib/apis/client';
import { adminQueryKeys } from '@/hooks/queries/admin/adminQueryKeys';
import { createWrapper } from '@/test-utils/query';
import type { Member } from '@/types/admin/member';
import { useChangeMemberCardinals, useChangeMemberRole } from '../useAdminMemberMutations';

jest.mock('@/lib/apis/client', () => ({ apiClient: { patch: jest.fn() } }));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));
jest.mock('@/lib/actions/club', () => ({ revalidateDashboard: jest.fn() }));

const patchMock = jest.mocked(apiClient.patch);

function mockMember(overrides: Partial<Member> = {}): Member {
  return {
    id: '42',
    clubMemberId: 52,
    name: '이유진',
    email: '',
    department: '',
    studentId: '',
    phone: '',
    position: '부원',
    positionOption: null,
    memberRole: 'USER',
    cardinal: '5',
    attendance: 0,
    absence: 0,
    attendanceRate: 0,
    penaltyCount: 0,
    warningCount: null,
    status: 'ACTIVE',
    profileImageUrl: null,
    bio: null,
    joinedAt: null,
    ...overrides,
  };
}

function createClientWithSearchCache() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  // 검색 결과는 PageResponse가 아니라 Member[] 형태로 캐시된다.
  queryClient.setQueryData([...adminQueryKeys.members('club-1'), 'search', '이', undefined], [
    mockMember(),
  ]);
  return queryClient;
}

beforeEach(() => {
  patchMock.mockReset();
  patchMock.mockResolvedValue({ data: {} });
});

it('검색 결과(배열) 캐시가 있어도 권한 변경 요청을 보낸다', async () => {
  const queryClient = createClientWithSearchCache();
  const { result } = renderHook(() => useChangeMemberRole(), {
    wrapper: createWrapper(queryClient),
  });

  await result.current.mutateAsync({ clubMemberId: 52, memberRole: 'ADMIN' });

  await waitFor(() =>
    expect(patchMock).toHaveBeenCalledWith('/admin/clubs/club-1/members/52/role', {
      memberRole: 'ADMIN',
    }),
  );
});

it('검색 결과(배열) 캐시가 있어도 기수 변경 요청을 보낸다', async () => {
  const queryClient = createClientWithSearchCache();
  const { result } = renderHook(() => useChangeMemberCardinals(), {
    wrapper: createWrapper(queryClient),
  });

  await result.current.mutateAsync({ clubMemberId: 52, cardinalIds: [7] });

  await waitFor(() =>
    expect(patchMock).toHaveBeenCalledWith('/admin/clubs/club-1/members/52/cardinals', {
      cardinalIds: [7],
      force: false,
    }),
  );
});
