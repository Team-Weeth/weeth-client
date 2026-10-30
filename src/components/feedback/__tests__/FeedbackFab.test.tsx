import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { usePathname } from 'next/navigation';
import { FeedbackFab } from '@/components/feedback/FeedbackFab';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { mockMatchMedia, stubLayoutObservers } from '@/test-utils/browser';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { HomeDashboard } from '@/types/home';
import type { Role } from '@/types/user';

let mockRole: Role = 'LEAD';

jest.mock('@/hooks/home/useHomeQuery', () => ({
  useHomeQuery: ({ select }: { select?: (data: HomeDashboard) => unknown } = {}) => {
    const dashboard = { myInfo: { userInfo: { role: mockRole } } } as HomeDashboard;
    return { data: select ? select(dashboard) : dashboard };
  },
}));
jest.mock('@/components/home/HomeProfileSetupModal', () => ({
  HomeProfileSetupModal: () => null,
}));

function renderFab({ enabled = true, role = 'LEAD' }: { enabled?: boolean; role?: Role } = {}) {
  mockRole = role;
  const QueryWrapper = createWrapper(createQueryClient());
  return render(
    <QueryWrapper>
      <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, feedbackFabEnabled: enabled }}>
        <FeedbackFab />
      </ClubFeatureProvider>
    </QueryWrapper>,
  );
}

async function selectMenuItem(name: string) {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: 'Weeth 메뉴' }));
  await user.click(screen.getByRole('menuitem', { name }));
  return user;
}

beforeEach(() => {
  mockMatchMedia(false);
  stubLayoutObservers();
  jest.mocked(usePathname).mockReturnValue('/test-club-id/home');
});

describe('FeedbackFab', () => {
  it('A안 플래그가 꺼져 있으면 렌더링하지 않는다', () => {
    renderFab({ enabled: false });

    expect(screen.queryByRole('button', { name: 'Weeth 메뉴' })).not.toBeInTheDocument();
  });

  it('A안 플래그가 켜져 있으면 FAB 메뉴에 서비스 안내·서비스 피드백 항목을 보여준다', async () => {
    const user = userEvent.setup();
    renderFab();

    await user.click(screen.getByRole('button', { name: 'Weeth 메뉴' }));

    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      '서비스 안내',
      '서비스 피드백',
    ]);
  });

  it.each([
    ['LEAD', '사이트 완성하기'],
    ['USER', '가입하기'],
  ] as const)('%s 역할은 서비스 안내에서 역할별 튜토리얼을 연다', async (role, overline) => {
    renderFab({ role });

    await selectMenuItem('서비스 안내');

    expect(await screen.findByRole('dialog')).toHaveTextContent(overline);
  });

  it('튜토리얼이 없는 ADMIN 역할은 서비스 안내 패널을 연다', async () => {
    renderFab({ role: 'ADMIN' });

    await selectMenuItem('서비스 안내');

    const dialog = await screen.findByRole('dialog', { name: '서비스 안내' });
    expect(dialog).toHaveTextContent('서비스 안내를 준비하고 있어요.');
  });

  describe('하단 고정 버튼이 있는 화면', () => {
    it.each([
      '/test-club-id/member/3',
      '/test-club-id/mypage/edit',
      '/test-club-id/mypage/profiles/add',
      '/test-club-id/mypage/profiles/7/edit',
      '/test-club-id/mypage/settings/theme',
    ])('모바일에서는 %s 화면에서 FAB을 숨긴다', (pathname) => {
      mockMatchMedia(true);
      jest.mocked(usePathname).mockReturnValue(pathname);
      renderFab();

      expect(screen.queryByRole('button', { name: 'Weeth 메뉴' })).not.toBeInTheDocument();
    });

    it('데스크톱에서는 같은 화면이어도 FAB을 보여준다', () => {
      jest.mocked(usePathname).mockReturnValue('/test-club-id/mypage/edit');
      renderFab();

      expect(screen.getByRole('button', { name: 'Weeth 메뉴' })).toBeInTheDocument();
    });
  });
});
