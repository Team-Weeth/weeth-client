import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaxEventPopup } from '@/components/wax-event/WaxEventPopup';
import {
  WaxEventTopBanner,
  WaxEventTopBannerSpacer,
} from '@/components/wax-event/WaxEventTopBanner';
import { WAX_EVENT_STORAGE_KEYS, getWaxEventPath } from '@/constants/waxEvent';
import { DEFAULT_CLUB_FEATURES } from '@/flags/club-features/definitions';
import { ClubFeatureProvider } from '@/providers/club-feature-provider';
import { mockMatchMedia, stubLayoutObservers } from '@/test-utils/browser';

const CLUB_ID = 'test-club-id';
const EVENT_PATH = getWaxEventPath(CLUB_ID);

jest.mock('next/navigation', () => ({
  ...jest.requireActual('next/navigation'),
  useParams: () => ({ clubId: 'test-club-id' }),
}));

function renderPopup({ waxEventEnabled = true } = {}) {
  return render(
    <ClubFeatureProvider features={{ ...DEFAULT_CLUB_FEATURES, waxEventEnabled }}>
      <WaxEventPopup />
    </ClubFeatureProvider>,
  );
}

beforeEach(() => {
  mockMatchMedia(false);
  stubLayoutObservers();
  window.localStorage.clear();
});

describe('WaxEventTopBanner', () => {
  it('배너를 누르면 이벤트 페이지로 이동한다', () => {
    render(<WaxEventTopBanner href={EVENT_PATH} />);

    expect(screen.getByRole('link', { name: /교수님 몰래 왁뿌하기/ })).toHaveAttribute(
      'href',
      EVENT_PATH,
    );
  });

  it('X로 닫으면 배너와 본문 여백이 함께 사라지고 닫은 상태를 저장한다', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <>
        <WaxEventTopBanner href={EVENT_PATH} />
        <WaxEventTopBannerSpacer />
      </>,
    );

    await user.click(screen.getByRole('button', { name: '이벤트 배너 닫기' }));

    expect(container).toBeEmptyDOMElement();
    expect(window.localStorage.getItem(WAX_EVENT_STORAGE_KEYS.bannerClosed)).toBe('true');
  });

  it('이미 닫은 배너는 다시 보이지 않는다', () => {
    window.localStorage.setItem(WAX_EVENT_STORAGE_KEYS.bannerClosed, 'true');

    const { container } = render(<WaxEventTopBanner href={EVENT_PATH} />);

    expect(container).toBeEmptyDOMElement();
  });
});

describe('WaxEventPopup', () => {
  it('이벤트 플래그가 꺼져 있으면 띄우지 않는다', () => {
    renderPopup({ waxEventEnabled: false });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('게임 시작하기 버튼은 이벤트 페이지로 이동한다', () => {
    renderPopup();

    expect(screen.getByRole('link', { name: '게임 시작하기' })).toHaveAttribute('href', EVENT_PATH);
  });

  it('X는 이번만 닫고 숨김 기간을 저장하지 않는다', async () => {
    const user = userEvent.setup();
    renderPopup();

    await user.click(screen.getByRole('button', { name: '닫기' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(window.localStorage.getItem(WAX_EVENT_STORAGE_KEYS.popupHideUntil)).toBeNull();
  });

  it('"24시간동안 보이지 않기"는 24시간 뒤까지 숨긴다', async () => {
    const user = userEvent.setup();
    renderPopup();

    await user.click(screen.getByRole('button', { name: '24시간동안 보이지 않기' }));

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const hideUntil = new Date(
      window.localStorage.getItem(WAX_EVENT_STORAGE_KEYS.popupHideUntil)!,
    ).getTime();
    expect(hideUntil - Date.now()).toBeGreaterThan(23 * 60 * 60 * 1000);
  });

  it('숨김 기간이 지나면 다시 띄운다', () => {
    window.localStorage.setItem(
      WAX_EVENT_STORAGE_KEYS.popupHideUntil,
      new Date(Date.now() - 1000).toISOString(),
    );

    renderPopup();

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
