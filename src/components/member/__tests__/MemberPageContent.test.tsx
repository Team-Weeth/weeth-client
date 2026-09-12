import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { MemberPageContent } from '@/components/member/MemberPageContent';
import { TooltipProvider } from '@/components/ui/Tooltip';
import type { MemberProfile } from '@/types/member';

const MOCK_MEMBERS: MemberProfile[] = [
  {
    id: 1,
    name: '김지수',
    profileImageUrl: null,
    cardinals: [8],
    role: 'LEAD',
    position: '기획',
    description: '설명',
  },
];

jest.mock('@/hooks/useCardinalSelector', () => ({
  useCardinalSelector: () => ({
    cardinals: [],
    activeCardinal: undefined,
    setSelectedCardinalId: jest.fn(),
  }),
}));

jest.mock('@/hooks/member/useMembersQuery', () => ({
  useMembersQuery: () => ({
    data: MOCK_MEMBERS,
    isPending: false,
    isError: false,
    refetch: jest.fn(),
    fetchNextPage: jest.fn(),
    hasNextPage: false,
    isFetchingNextPage: false,
  }),
}));

jest.mock('@/hooks/member/useMemberDetailQuery', () => ({
  useMemberDetailQuery: () => ({
    data: undefined,
    isPending: true,
    isError: false,
    refetch: jest.fn(),
  }),
}));

class MockIntersectionObserver {
  observe = jest.fn();
  disconnect = jest.fn();
  unobserve = jest.fn();
}
window.IntersectionObserver = MockIntersectionObserver as unknown as typeof IntersectionObserver;

function mockMatchMedia(initialMatches: boolean) {
  let matches = initialMatches;
  let changeListener: (() => void) | null = null;

  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      get matches() {
        return matches;
      },
      media: query,
      addEventListener: (_event: string, listener: () => void) => {
        changeListener = listener;
      },
      removeEventListener: jest.fn(),
      onchange: null,
      dispatchEvent: jest.fn(),
    })),
  });

  return {
    setMobile: (nextMatches: boolean) => {
      matches = nextMatches;
      act(() => changeListener?.());
    },
  };
}

describe('MemberPageContent 반응형 상세 뷰 전환', () => {
  const router = useRouter();
  const push = router.push as jest.Mock;
  const replace = router.replace as jest.Mock;

  beforeEach(() => {
    push.mockClear();
    replace.mockClear();
    jest.mocked(useParams).mockReturnValue({ clubId: 'test-club-id' });
    jest
      .mocked(useSearchParams)
      .mockReturnValue(new URLSearchParams() as ReturnType<typeof useSearchParams>);
  });

  it('데스크톱 폭에서 카드를 클릭하면 모달이 열린다', async () => {
    mockMatchMedia(false);
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <MemberPageContent />
      </TooltipProvider>,
    );

    await user.click(screen.getAllByRole('button', { name: /김지수/ })[0]);

    expect(await screen.findByText('멤버 상세')).toBeInTheDocument();
    expect(push).not.toHaveBeenCalled();
  });

  it('데스크톱 모달이 열린 상태에서 모바일 폭으로 리사이즈되면 모바일 상세 라우트로 전환된다', async () => {
    const { setMobile } = mockMatchMedia(false);
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <MemberPageContent />
      </TooltipProvider>,
    );

    await user.click(screen.getAllByRole('button', { name: /김지수/ })[0]);
    expect(await screen.findByText('멤버 상세')).toBeInTheDocument();

    setMobile(true);

    expect(push).toHaveBeenCalledWith('/test-club-id/member/1');
  });

  it('모바일 폭에서는 카드를 클릭하면 모달 대신 상세 라우트로 이동한다', async () => {
    mockMatchMedia(true);
    const user = userEvent.setup();
    render(
      <TooltipProvider>
        <MemberPageContent />
      </TooltipProvider>,
    );

    await user.click(screen.getAllByRole('button', { name: /김지수/ })[0]);

    expect(push).toHaveBeenCalledWith('/test-club-id/member/1');
    expect(screen.queryByText('멤버 상세')).not.toBeInTheDocument();
  });
});
