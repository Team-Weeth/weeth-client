import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HomeTutorialLauncher } from '@/components/home/HomeTutorialLauncher';
import { getHomeTutorialPendingKey, getHomeTutorialSeenKey } from '@/constants/home/tutorial';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { mockMatchMedia, stubLayoutObservers } from '@/test-utils/browser';
import type { HomeDashboard } from '@/types/home';
import type { Role } from '@/types/user';

const CLUB_ID = 'test-club-id';
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

function renderLauncher(role: Role, { feedbackFabEnabled = false } = {}) {
  mockRole = role;
  return render(
    <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, feedbackFabEnabled }}>
      <HomeTutorialLauncher />
    </ClubFeatureProvider>,
  );
}

beforeEach(() => {
  mockMatchMedia(false);
  stubLayoutObservers();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

describe('HomeTutorialLauncher', () => {
  it.each([
    ['LEAD', true],
    ['USER', true],
    ['ADMIN', false],
  ] as const)('%s 역할의 "?" 버튼 노출 여부는 %s다', (role, visible) => {
    renderLauncher(role);

    expect(Boolean(screen.queryByRole('button', { name: '홈 튜토리얼 다시 보기' }))).toBe(visible);
  });

  it('A안(FAB) 플래그가 켜져 있으면 "?" 버튼을 숨긴다', () => {
    renderLauncher('LEAD', { feedbackFabEnabled: true });

    expect(screen.queryByRole('button', { name: '홈 튜토리얼 다시 보기' })).not.toBeInTheDocument();
  });

  it('"?" 버튼을 누르면 역할에 맞는 튜토리얼을 연다', async () => {
    const user = userEvent.setup();
    renderLauncher('USER');

    await user.click(screen.getByRole('button', { name: '홈 튜토리얼 다시 보기' }));

    expect(await screen.findByRole('dialog')).toHaveTextContent('가입하기');
  });

  describe('첫 방문 자동 열림', () => {
    it('대기 중인 동아리이고 아직 보지 않았다면 자동으로 열고, 닫으면 본 것으로 기록한다', async () => {
      const user = userEvent.setup();
      window.sessionStorage.setItem(getHomeTutorialPendingKey('lead'), CLUB_ID);
      renderLauncher('LEAD');

      expect(await screen.findByRole('dialog')).toBeInTheDocument();

      await user.keyboard('{Escape}');

      await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
      expect(window.localStorage.getItem(getHomeTutorialSeenKey(CLUB_ID, 'lead'))).toBe('true');
      expect(window.sessionStorage.getItem(getHomeTutorialPendingKey('lead'))).toBeNull();
    });

    it('이미 본 튜토리얼은 자동으로 열지 않고 대기 상태를 정리한다', async () => {
      window.sessionStorage.setItem(getHomeTutorialPendingKey('lead'), CLUB_ID);
      window.localStorage.setItem(getHomeTutorialSeenKey(CLUB_ID, 'lead'), 'true');
      renderLauncher('LEAD');

      await waitFor(() =>
        expect(window.sessionStorage.getItem(getHomeTutorialPendingKey('lead'))).toBeNull(),
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('A안에서도 첫 방문 자동 열림은 그대로 동작한다', async () => {
      window.sessionStorage.setItem(getHomeTutorialPendingKey('member'), CLUB_ID);
      renderLauncher('USER', { feedbackFabEnabled: true });

      expect(await screen.findByRole('dialog')).toHaveTextContent('가입하기');
    });

    it('역할과 맞지 않는 대기 상태는 열지 않고 정리한다', async () => {
      window.sessionStorage.setItem(getHomeTutorialPendingKey('lead'), CLUB_ID);
      renderLauncher('USER');

      await waitFor(() =>
        expect(window.sessionStorage.getItem(getHomeTutorialPendingKey('lead'))).toBeNull(),
      );
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
