import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Sheet } from '@/components/ui/Sheet';
import { MobileMemberNavGroup } from '../MobileMemberNavGroup';

it('멤버 관리 클릭은 시트를 유지하며 하위 메뉴를 토글하고 링크 선택 시 시트를 닫는다', async () => {
  const user = userEvent.setup();
  const onOpenChange = jest.fn();
  render(
    <Sheet open onOpenChange={onOpenChange}>
      <div onClick={(event) => event.preventDefault()}>
        <MobileMemberNavGroup clubId="club-1" pathname="/club-1/admin/member" />
      </div>
    </Sheet>,
  );
  const trigger = screen.getByRole('button', { name: '멤버 관리' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  expect(onOpenChange).not.toHaveBeenCalled();
  expect(screen.getByRole('link', { name: '멤버 목록' })).toHaveAttribute('aria-current', 'page');
  expect(screen.getByRole('link', { name: '부원 정보' })).toHaveAttribute(
    'href',
    '/club-1/admin/member/information-preview',
  );
  await user.click(trigger);
  expect(screen.queryByRole('link', { name: '부원 정보' })).not.toBeInTheDocument();
  await user.click(trigger);
  await user.click(screen.getByRole('link', { name: '멤버 목록' }));
  expect(onOpenChange).toHaveBeenCalledWith(false);
});
