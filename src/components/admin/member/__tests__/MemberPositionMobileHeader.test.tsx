import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberPositionMobileHeader } from '@/components/admin/member/MemberPositionMobileHeader';

const back = jest.fn();
jest.mock('next/navigation', () => ({ useRouter: () => ({ back }) }));

it('필드 메뉴를 열면 기본 필드는 비활성화되고 선택하거나 Escape로 닫을 수 있다', async () => {
  const user = userEvent.setup();
  render(<MemberPositionMobileHeader />);
  const trigger = screen.getByRole('button', { name: '부원 정보 필드 선택' });
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  for (const name of ['학과', '학번', '전화번호', '기수']) {
    expect(screen.getByRole('menuitem', { name })).toHaveAttribute('aria-disabled', 'true');
  }
  await user.click(screen.getByRole('menuitem', { name: '학과' }));
  expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await user.keyboard('{Escape}');
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(trigger);
  await user.click(screen.getByRole('menuitem', { name: '포지션 커스텀 필드' }));
  expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await user.click(screen.getByRole('button', { name: '뒤로가기' }));
  expect(back).toHaveBeenCalled();
});
