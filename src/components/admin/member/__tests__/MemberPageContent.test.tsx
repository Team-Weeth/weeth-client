import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { apiClient } from '@/lib/apis/client';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { MemberPageContent } from '../MemberPageContent';

jest.mock('@/lib/apis/client', () => ({ apiClient: { get: jest.fn() } }));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1', useUserRole: () => 'ADMIN' }));
jest.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: () => false }));
jest.mock('@/hooks/queries', () => ({ useCardinals: () => ({ data: [] }) }));
jest.mock('@/hooks/queries/admin', () =>
  jest.requireActual('@/hooks/queries/admin/useAdminMemberQueries'),
);
jest.mock('@/hooks/board/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({ ref: null, isIntersecting: false }),
}));
jest.mock('../hooks/useMemberBulkActions', () => ({ useMemberBulkActions: () => ({}) }));
jest.mock('../MemberPageModals', () => ({ MemberPageModals: () => null }));
jest.mock('../MemberTopBar', () => ({ MemberTopBar: () => null }));
jest.mock('../MobileMemberTopBar', () => ({ MobileMemberTopBar: () => null }));
jest.mock('../MemberCardList', () => ({ MemberCardList: () => null }));
jest.mock('../MemberMobileSearchPage', () => ({ MemberMobileSearchPage: () => null }));
jest.mock('../CardinalPillList', () => ({ CardinalPillList: () => null }));

// 조회 API만 대체하고 페이지 상태, 개수 버튼, 테이블, 페이지네이션은 실제 구현을 사용한다.
const mockMembers = Array.from({ length: 100 }, (_, index) => ({
  userId: index + 1,
  clubMemberId: index + 1,
  name: `테스트멤버${String(index + 1).padStart(3, '0')}`,
  memberRole: 'USER',
  memberStatus: 'ACTIVE',
  cardinals: [1],
}));
const getMock = jest.mocked(apiClient.get);

beforeEach(() => {
  getMock.mockReset();
  getMock.mockImplementation(async (url, config) => {
    // 표가 포지션 옵션도 조회한다. 멤버 목록 파라미터를 읽기 전에 걸러내야 한다.
    if (url.includes('/positions')) {
      return { data: { data: [] } };
    }

    const { page, size } = config!.params as { page: number; size: number };
    return {
      data: {
        data: {
          content: mockMembers.slice(page * size, (page + 1) * size),
          pageNumber: page,
          pageSize: size,
          totalElements: mockMembers.length,
          totalPages: Math.ceil(mockMembers.length / size),
        },
      },
    };
  });
});

async function expectMembers(count: number, first: number, last: number) {
  await waitFor(() => {
    const table = within(screen.getByRole('table'));
    expect(table.getAllByRole('row')).toHaveLength(count + 1);
    expect(table.getByText(`테스트멤버${String(first).padStart(3, '0')}`)).toBeInTheDocument();
    expect(table.getByText(`테스트멤버${String(last).padStart(3, '0')}`)).toBeInTheDocument();
  });
}

it('100명 중 기본 10명 → 20명 → 50명을 표시하고 선택 상태와 요청 size가 바뀐다', async () => {
  render(<MemberPageContent />, { wrapper: createWrapper(createQueryClient()) });

  for (const size of [10, 20, 50]) {
    fireEvent.click(screen.getByRole('button', { name: `${size}개` }));
    await expectMembers(size, 1, size);
    expect(screen.getByRole('button', { name: `${size}개` })).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    expect(getMock).toHaveBeenLastCalledWith('/admin/clubs/club-1/members', {
      params: { page: 0, size, cardinalNumber: undefined, sort: 'CARDINAL_DESC' },
    });
  }
});

it.each([20, 50])('%i명씩 마지막 페이지까지 중복 없이 조회한다', async (size) => {
  render(<MemberPageContent />, { wrapper: createWrapper(createQueryClient()) });
  await expectMembers(10, 1, 10);
  fireEvent.click(screen.getByRole('button', { name: `${size}개` }));
  await expectMembers(size, 1, size);

  for (let page = 2; page <= 100 / size; page++) {
    fireEvent.click(screen.getByRole('link', { name: String(page) }));
    await expectMembers(size, (page - 1) * size + 1, page * size);
    expect(
      screen.queryByText(`테스트멤버${String((page - 1) * size).padStart(3, '0')}`),
    ).not.toBeInTheDocument();
    expect(getMock).toHaveBeenLastCalledWith('/admin/clubs/club-1/members', {
      params: { page: page - 1, size, cardinalNumber: undefined, sort: 'CARDINAL_DESC' },
    });
  }
  expect(screen.queryByRole('link', { name: String(100 / size + 1) })).not.toBeInTheDocument();
});

it('20명씩 3페이지를 보다가 50명으로 바꾸면 첫 페이지로 돌아오고 스크롤을 초기화한다', async () => {
  render(<MemberPageContent />, { wrapper: createWrapper(createQueryClient()) });
  await expectMembers(10, 1, 10);
  fireEvent.click(screen.getByRole('button', { name: '20개' }));
  await expectMembers(20, 1, 20);
  fireEvent.click(screen.getByRole('link', { name: '3' }));
  await expectMembers(20, 41, 60);

  const scrollContainer = screen.getByRole('table').parentElement!;
  scrollContainer.scrollTop = 400;
  fireEvent.click(screen.getByRole('button', { name: '50개' }));
  await expectMembers(50, 1, 50);
  expect(screen.getByRole('link', { name: '1' })).toHaveAttribute('aria-current', 'page');
  expect(scrollContainer.scrollTop).toBe(0);
  expect(getMock).toHaveBeenLastCalledWith('/admin/clubs/club-1/members', {
    params: { page: 0, size: 50, cardinalNumber: undefined, sort: 'CARDINAL_DESC' },
  });
});
