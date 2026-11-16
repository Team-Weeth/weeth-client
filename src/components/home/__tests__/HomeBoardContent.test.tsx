import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { apiClient } from '@/lib/apis/client';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import { HomeBoardContent } from '@/components/home/HomeBoardContent';

jest.mock('@/lib/apis/client', () => ({ apiClient: { get: jest.fn() } }));

jest.mock('@/stores/useClubStore', () => ({
  useClubId: () => 'test-club-id',
}));

jest.mock('@/hooks/board/useIntersectionObserver', () => ({
  useIntersectionObserver: () => ({ ref: { current: null }, isIntersecting: false }),
}));

// '../board' 배럴이 BoardContent → PostCardBody → isomorphic-dompurify(ESM)를 끌어들여
// Jest 파싱 오류가 발생하므로, 배럴 전체를 mock하고 HomeBoardContent가 사용하는
// PostCard와 PostActionMenu만 최소 구현으로 제공한다.
jest.mock('@/components/board', () => ({
  PostCard: {
    Root: ({ children, className }: React.HTMLAttributes<HTMLElement>) => (
      <article className={className ?? ''}>{children}</article>
    ),
    Header: ({ children }: React.HTMLAttributes<HTMLDivElement>) => <div>{children}</div>,
    Author: ({ author }: { author: { name: string } }) => <span>{author.name}</span>,
    ListContent: ({ title }: { title: string }) => <p>{title}</p>,
    Images: () => null,
    Actions: ({ onComment }: { onComment?: () => void }) => (
      <button onClick={onComment}>댓글</button>
    ),
  },
  PostActionMenu: () => null,
}));

const getMock = jest.mocked(apiClient.get);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockPost = {
  id: 1,
  boardId: 10,
  author: { id: 99, name: '작성자', profileImageUrl: null, role: 'USER' as const },
  title: '테스트 게시글 제목',
  content: '게시글 본문',
  time: '2026-01-01T12:00:00',
  commentCount: 2,
  like: { isLiked: false, likeCount: 0 },
  fileUrls: [],
  isNew: false,
};

function mockDashboard(role: 'USER' | 'ADMIN' | 'LEAD' = 'USER') {
  return {
    data: {
      data: {
        club: {
          id: 'test-club-id',
          name: '테스트 클럽',
          code: 'TEST',
          schoolName: '테스트대학교',
          description: '',
          memberCount: 5,
          profileImageUrl: null,
          backgroundImageUrl: null,
        },
        myInfo: {
          userInfo: { id: 1, name: '홍길동', profileImageUrl: null, role },
          bio: null,
        },
      },
    },
  };
}

function mockRecentPosts(posts = [mockPost], last = true) {
  return {
    data: {
      data: {
        size: 10,
        content: posts,
        number: 0,
        sort: { empty: false, unsorted: false, sorted: true },
        pageable: {
          offset: 0,
          sort: { empty: false, unsorted: false, sorted: true },
          pageNumber: 0,
          pageSize: 10,
          paged: true,
          unpaged: false,
        },
        numberOfElements: posts.length,
        first: true,
        last,
        empty: posts.length === 0,
      },
    },
  };
}

function setupDefaultMocks(role: 'USER' | 'ADMIN' | 'LEAD' = 'USER', posts = [mockPost]) {
  getMock.mockImplementation(async (url: string) => {
    if ((url as string).includes('/dashboard/home')) return mockDashboard(role);
    if ((url as string).includes('/dashboard/recent-posts')) return mockRecentPosts(posts);
    return Promise.reject(new Error(`Unhandled mock url: ${url}`));
  });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('HomeBoardContent (integration)', () => {
  afterEach(() => {
    getMock.mockReset();
    sessionStorage.clear();
    jest.restoreAllMocks();
  });

  describe('로딩 상태', () => {
    it('데이터 로딩 중 스켈레톤을 표시한다', () => {
      getMock.mockReturnValue(new Promise(() => {}));
      const { container } = render(<HomeBoardContent />, {
        wrapper: createWrapper(createQueryClient()),
      });
      expect(container.querySelector('[data-slot="skeleton"]')).toBeInTheDocument();
    });
  });

  describe('게시글 목록', () => {
    it('게시글 제목을 렌더링한다', async () => {
      setupDefaultMocks();
      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      expect(await screen.findByText('테스트 게시글 제목')).toBeInTheDocument();
    });

    it('게시글 작성자 이름을 렌더링한다', async () => {
      setupDefaultMocks();
      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      expect(await screen.findByText('작성자')).toBeInTheDocument();
    });
  });

  describe('댓글 버튼', () => {
    it('댓글 버튼 클릭 시 게시글 댓글 경로로 이동한다', async () => {
      setupDefaultMocks();
      const user = userEvent.setup();
      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      await screen.findByText('테스트 게시글 제목');

      await user.click(screen.getByRole('button', { name: '댓글' }));

      const router = (
        jest.requireMock('next/navigation') as { useRouter: () => { push: jest.Mock } }
      ).useRouter();
      expect(router.push).toHaveBeenCalledWith(expect.stringContaining('#comments'));
    });
  });

  describe('빈 상태', () => {
    it('게시글이 없고 일반 회원이면 "아직 게시된 글이 없어요!" 문구를 표시한다', async () => {
      setupDefaultMocks('USER', []);
      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      expect(await screen.findByText(/아직 게시된 글이 없어요!/)).toBeInTheDocument();
    });

    it('게시글이 없고 관리자이면 "사이트 개설을 축하합니다!" 문구를 표시한다', async () => {
      setupDefaultMocks('ADMIN', []);
      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      expect(await screen.findByText(/사이트 개설을 축하합니다!/)).toBeInTheDocument();
    });
  });

  describe('스크롤 복원', () => {
    it('저장된 스크롤 위치로 window.scrollTo를 호출한다', async () => {
      setupDefaultMocks();
      sessionStorage.setItem('scroll:home:recent-posts:test-club-id', '500');
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0);
        return 0;
      });

      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      await screen.findByText('테스트 게시글 제목');

      await waitFor(() => {
        expect(scrollToSpy).toHaveBeenCalledWith({ top: 500, behavior: 'instant' });
      });
    });

    it('저장된 스크롤 위치가 없으면 window.scrollTo를 호출하지 않는다', async () => {
      setupDefaultMocks();
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      await screen.findByText('테스트 게시글 제목');

      expect(scrollToSpy).not.toHaveBeenCalled();
    });

    it('문서 높이가 부족하고 다음 페이지가 있으면 fetchNextPage를 호출한다', async () => {
      // last: false → hasNextPage=true / pendingTarget=500, scrollHeight=0 → !reachable → fetchNextPage
      sessionStorage.setItem('scroll:home:recent-posts:test-club-id', '500');
      jest.spyOn(window, 'scrollTo').mockImplementation(() => {});
      jest.spyOn(window, 'requestAnimationFrame').mockImplementation((cb) => {
        cb(0);
        return 0;
      });
      getMock.mockImplementation(
        async (url: string, config?: { params?: { pageNumber?: number } }) => {
          if ((url as string).includes('/dashboard/home')) return mockDashboard();
          if ((url as string).includes('/dashboard/recent-posts')) {
            const page = config?.params?.pageNumber ?? 0;
            // 0페이지: last=false → hasNextPage=true / 1페이지 이상: last=true
            return page === 0
              ? mockRecentPosts([mockPost], false)
              : mockRecentPosts([{ ...mockPost, id: 2, title: '두 번째 게시글' }], true);
          }
          return Promise.reject(new Error(`Unhandled: ${url}`));
        },
      );

      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      await screen.findByText('테스트 게시글 제목');

      // 스크롤 복원 effect가 fetchNextPage()를 트리거 → 두 번째 recent-posts 요청 발생
      await waitFor(() => {
        const recentPostsCalls = getMock.mock.calls.filter(([url]) =>
          (url as string).includes('/dashboard/recent-posts'),
        );
        expect(recentPostsCalls.length).toBeGreaterThanOrEqual(2);
      });
    });

    it('다른 클럽의 스크롤 위치는 복원하지 않는다', async () => {
      setupDefaultMocks();
      // 다른 clubId 키로 저장된 스크롤 위치
      sessionStorage.setItem('scroll:home:recent-posts:other-club-id', '500');
      const scrollToSpy = jest.spyOn(window, 'scrollTo').mockImplementation(() => {});

      render(<HomeBoardContent />, { wrapper: createWrapper(createQueryClient()) });
      await screen.findByText('테스트 게시글 제목');

      expect(scrollToSpy).not.toHaveBeenCalled();
    });
  });
});
