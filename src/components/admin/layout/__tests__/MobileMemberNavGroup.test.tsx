import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sheet } from '@/components/ui/Sheet';
import { MobileMemberNavGroup } from '../MobileMemberNavGroup';

function renderNavGroup(pathname: string, onOpenChange = jest.fn()) {
  render(
    <Sheet open onOpenChange={onOpenChange}>
      <div onClick={(event) => event.preventDefault()}>
        <MobileMemberNavGroup clubId="club-1" pathname={pathname} />
      </div>
    </Sheet>,
  );
  return { onOpenChange, trigger: screen.getByRole('button', { name: '멤버 관리' }) };
}

it('멤버 관리 클릭은 시트를 유지하며 하위 메뉴를 토글하고 링크 선택 시 시트를 닫는다', async () => {
  const user = userEvent.setup();
  const { onOpenChange, trigger } = renderNavGroup('/club-1/admin/schedule');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(onOpenChange).not.toHaveBeenCalled();
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
  await user.click(trigger);
  await user.click(screen.getByRole('link', { name: '멤버 목록' }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it('멤버 하위 경로에서는 펼친 상태로 열리고 현재 메뉴를 활성화한다', () => {
  const { trigger } = renderNavGroup('/club-1/admin/member/position-settings');
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByRole('link', { name: '부원 정보' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: '멤버 목록' })).not.toHaveAttribute('aria-current');
});
