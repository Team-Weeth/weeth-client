import { render as renderView, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberNavGroup } from '../MemberNavGroup';
import { TooltipProvider } from '@/components/ui/Tooltip';

const render = (ui: React.ReactElement) =>
  renderView(<TooltipProvider disableHoverableContent>{ui}</TooltipProvider>);

it('멤버 관리를 누르면 하위 링크를 펼치고 다시 누르면 닫는다', async () => {
  const user = userEvent.setup();
  render(<MemberNavGroup clubId="club-1" pathname="/club-1/admin/schedule" collapsed={false} />);
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  expect(screen.getByRole('link', { name: '멤버 목록' })).toHaveAttribute(
    'href',
    '/club-1/admin/member',
  );
  expect(screen.getByRole('link', { name: '부원 정보' })).toHaveAttribute(
    'href',
    '/club-1/admin/member/position-settings',
  );
  await user.click(trigger);
  expect(screen.queryByRole('link', { name: '부원 정보' })).not.toBeInTheDocument();
});

it('부원 정보에서는 해당 하위 메뉴만 활성화한다', () => {
  render(
    <MemberNavGroup
      clubId="club-1"
      pathname="/club-1/admin/member/position-settings"
      collapsed={false}
    />,
  );
  expect(screen.getByRole('link', { name: '부원 정보' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: '멤버 목록' })).not.toHaveAttribute('aria-current');
});

it('접힌 사이드바에서 하위 아이콘만 펼치고 다시 누르면 접는다', async () => {
  const user = userEvent.setup();
  render(<MemberNavGroup clubId="club-1" pathname="/club-1/admin/schedule" collapsed />);
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: '부원 정보' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: '멤버 목록' })).toBeInTheDocument();
  expect(screen.queryByText('부원 정보')).not.toBeInTheDocument();
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('link', { name: '부원 정보' })).not.toBeInTheDocument();
});

it('접힌 메뉴에서는 상위 툴팁, 펼친 메뉴에서는 각 하위 툴팁을 표시한다', async () => {
  const user = userEvent.setup();
  render(<MemberNavGroup clubId="club-1" pathname="/club-1/admin/schedule" collapsed />);
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
  await user.hover(trigger);
  expect(await screen.findByRole('tooltip')).toHaveTextContent('멤버 관리');
  await user.click(trigger);
  await user.unhover(trigger);
  for (const label of ['멤버 목록', '부원 정보']) {
    const link = screen.getByRole('link', { name: label });
    await user.hover(link);
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent(label));
    await user.unhover(link);
  }
});
