import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { DevFlagPanel } from '@/components/dev/DevFlagPanel';
import {
  DEV_FLAG_OVERRIDE_COOKIE,
  parseDevFlagOverrides,
  type DevFlagOverrides,
} from '@/flags/club-features/dev-overrides';
import { getAllFeatureFlags } from '@/lib/flagsmith';

jest.mock('@/lib/flagsmith', () => ({ getAllFeatureFlags: jest.fn() }));

function readOverrideCookie() {
  const entry = document.cookie
    .split('; ')
    .find((cookie) => cookie.startsWith(`${DEV_FLAG_OVERRIDE_COOKIE}=`));
  return parseDevFlagOverrides(entry?.slice(DEV_FLAG_OVERRIDE_COOKIE.length + 1));
}

async function openPanel(overrides: DevFlagOverrides = {}) {
  const user = userEvent.setup();
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={queryClient}>
      <DevFlagPanel clubId="club-1" overrides={overrides} />
    </QueryClientProvider>,
  );
  await user.click(screen.getByRole('button', { name: /개발용 플래그 패널/ }));
  return user;
}

afterEach(() => {
  jest.mocked(getAllFeatureFlags).mockReset();
  document.cookie = `${DEV_FLAG_OVERRIDE_COOKIE}=; path=/; max-age=0`;
  jest.mocked(useRouter().refresh).mockClear();
});

describe('DevFlagPanel', () => {
  it('추가한 플래그가 없으면 안내 문구를 보여준다', async () => {
    await openPanel();

    expect(screen.getByText(/추가한 플래그가 없어요/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '전체 삭제' })).toBeDisabled();
  });

  it('추가한 플래그와 값을 스위치로 보여주고 개수를 버튼 이름에 드러낸다', async () => {
    await openPanel({ club_warning_enabled: true, new_flag: false });

    expect(screen.getByRole('switch', { name: 'club_warning_enabled' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'new_flag' })).not.toBeChecked();
    expect(
      screen.getByRole('button', { name: '개발용 플래그 패널 (플래그 2개)' }),
    ).toBeInTheDocument();
  });

  it('플래그 이름을 입력해 추가하면 켠 상태로 쿠키에 저장하고 서버 렌더링을 다시 요청한다', async () => {
    const user = await openPanel();

    await user.type(screen.getByRole('textbox', { name: '추가할 플래그 이름' }), ' new_flag ');
    await user.click(screen.getByRole('button', { name: '추가' }));

    expect(readOverrideCookie()).toEqual({ new_flag: true });
    expect(useRouter().refresh).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['bad key', '영문, 숫자, _ . - 만 쓸 수 있어요.'],
    ['club_warning_enabled', '이미 추가한 플래그예요.'],
  ])('잘못된 이름(%p)은 추가하지 않고 이유를 알려준다', async (key, message) => {
    const user = await openPanel({ club_warning_enabled: true });

    await user.type(screen.getByRole('textbox', { name: '추가할 플래그 이름' }), `${key}{Enter}`);

    expect(screen.getByRole('alert')).toHaveTextContent(message);
    expect(useRouter().refresh).not.toHaveBeenCalled();
  });

  it('스위치로 값을 바꾼다', async () => {
    const user = await openPanel({ club_warning_enabled: true });

    await user.click(screen.getByRole('switch', { name: 'club_warning_enabled' }));

    expect(readOverrideCookie()).toEqual({ club_warning_enabled: false });
  });

  it('삭제하면 목록에서 빠지고 원래 값으로 돌아간다', async () => {
    const user = await openPanel({ club_warning_enabled: true, new_flag: false });

    await user.click(screen.getByRole('button', { name: 'new_flag 삭제' }));

    expect(readOverrideCookie()).toEqual({ club_warning_enabled: true });
  });

  describe('전체 플래그에서 고르기', () => {
    async function openBrowser(overrides: DevFlagOverrides = {}) {
      const user = await openPanel(overrides);
      await user.click(screen.getByRole('button', { name: /전체 플래그에서 고르기/ }));
      return user;
    }

    it('이 동아리 기준으로 전체 플래그를 불러와 이름순으로 보여준다', async () => {
      jest.mocked(getAllFeatureFlags).mockResolvedValue({ zeta_flag: false, alpha_flag: true });
      await openBrowser();

      expect(await screen.findByText('alpha_flag')).toBeInTheDocument();
      expect(getAllFeatureFlags).toHaveBeenCalledWith({
        identifier: 'club:club-1',
        traits: { club_id: 'club-1' },
      });
      const names = screen.getAllByRole('listitem').map((item) => item.textContent);
      expect(names[0]).toContain('alpha_flag');
      expect(names[1]).toContain('zeta_flag');
    });

    it('이름으로 찾을 수 있다', async () => {
      jest.mocked(getAllFeatureFlags).mockResolvedValue({ zeta_flag: false, alpha_flag: true });
      const user = await openBrowser();
      await screen.findByText('alpha_flag');

      await user.type(screen.getByRole('textbox', { name: '플래그 이름으로 찾기' }), 'ZETA');

      expect(screen.queryByText('alpha_flag')).not.toBeInTheDocument();
      expect(screen.getByText('zeta_flag')).toBeInTheDocument();
    });

    it('고른 플래그를 현재 값 그대로 목록에 넣는다', async () => {
      jest.mocked(getAllFeatureFlags).mockResolvedValue({ alpha_flag: true, zeta_flag: false });
      const user = await openBrowser({ alpha_flag: true });

      expect(await screen.findByRole('button', { name: 'alpha_flag 추가됨' })).toBeDisabled();
      await user.click(screen.getByRole('button', { name: 'zeta_flag 추가' }));

      expect(readOverrideCookie()).toEqual({ alpha_flag: true, zeta_flag: false });
      expect(useRouter().refresh).toHaveBeenCalledTimes(1);
    });

    it('불러오지 못하면 다시 시도할 수 있다', async () => {
      jest
        .mocked(getAllFeatureFlags)
        .mockRejectedValueOnce(new Error('offline'))
        .mockResolvedValueOnce({ alpha_flag: true });
      const user = await openBrowser();

      await user.click(await screen.findByRole('button', { name: '다시 시도' }));

      expect(await screen.findByText('alpha_flag')).toBeInTheDocument();
    });
  });
});
