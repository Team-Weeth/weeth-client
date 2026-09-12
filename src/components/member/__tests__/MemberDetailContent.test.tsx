import { act, render } from '@testing-library/react';
import { useParams, useRouter } from 'next/navigation';
import { MemberDetailContent } from '@/components/member/MemberDetailContent';

jest.mock('@/hooks/member/useMemberDetailQuery', () => ({
  useMemberDetailQuery: () => ({
    data: undefined,
    isPending: true,
    isError: false,
    refetch: jest.fn(),
  }),
}));

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

describe('MemberDetailContent 반응형 전환', () => {
  const router = useRouter();
  const replace = router.replace as jest.Mock;

  beforeEach(() => {
    replace.mockClear();
    jest.mocked(useParams).mockReturnValue({ clubId: 'test-club-id', memberId: '1' });
  });

  it('모바일 폭에서는 전체 페이지 레이아웃을 유지하고 이동하지 않는다', () => {
    mockMatchMedia(true);
    render(<MemberDetailContent />);

    expect(replace).not.toHaveBeenCalled();
  });

  it('모바일 상세 페이지가 데스크톱 폭으로 리사이즈되면 목록 페이지의 모달로 전환된다', () => {
    const { setMobile } = mockMatchMedia(true);
    render(<MemberDetailContent />);

    setMobile(false);

    expect(replace).toHaveBeenCalledWith('/test-club-id/member?memberId=1');
  });
});
