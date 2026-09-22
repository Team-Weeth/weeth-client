import { render as renderView, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useRouter } from 'next/navigation';
import { MemberNavGroup } from '../MemberNavGroup';
import { TooltipProvider } from '@/components/ui/Tooltip';

const render = (ui: React.ReactElement) =>
  renderView(<TooltipProvider disableHoverableContent>{ui}</TooltipProvider>);

it('타 페이지에서 멤버 관리를 누르면 펼치면서 멤버 목록으로 이동한다', async () => {
  const user = userEvent.setup();
  render(<MemberNavGroup clubId="club-1" pathname="/club-1/admin/schedule" collapsed={false} />);
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(useRouter().push).toHaveBeenCalledWith('/club-1/admin/member');
  expect(screen.getByRole('link', { name: '멤버 목록' })).toHaveAttribute(
    'href',
    '/club-1/admin/member',
  );
  expect(screen.getByRole('link', { name: '부원 정보' })).toHaveAttribute(
    'href',
    '/club-1/admin/member/position-settings',
  );
});

it('멤버 경로 안에서는 이동 없이 펼침만 토글한다', async () => {
  const user = userEvent.setup();
  render(<MemberNavGroup clubId="club-1" pathname="/club-1/admin/member" collapsed={false} />);
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByRole('link', { name: '부원 정보' })).not.toBeInTheDocument();
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(useRouter().push).not.toHaveBeenCalled();
});

it('멤버 경로로 이동하면 펼치고 벗어나면 다시 접는다', () => {
  const { rerender } = render(
    <MemberNavGroup clubId="club-1" pathname="/club-1/admin/schedule" collapsed={false} />,
  );
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');

  rerender(
    <TooltipProvider disableHoverableContent>
      <MemberNavGroup clubId="club-1" pathname="/club-1/admin/member" collapsed={false} />
    </TooltipProvider>,
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'true');

  rerender(
    <TooltipProvider disableHoverableContent>
      <MemberNavGroup clubId="club-1" pathname="/club-1/admin/penalty" collapsed={false} />
    </TooltipProvider>,
  );
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
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

it('접힌 사이드바에서는 라벨 없이 하위 아이콘만 펼치고 다시 누르면 접는다', async () => {
  const user = userEvent.setup();
  render(<MemberNavGroup clubId="club-1" pathname="/club-1/admin/member" collapsed />);
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
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
