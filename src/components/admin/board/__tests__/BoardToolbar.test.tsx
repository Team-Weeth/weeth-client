import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { BoardToolbar } from '@/components/admin/board/BoardToolbar';

it('생성 버튼은 항상 활성 상태로 클릭을 전달한다', async () => {
  const user = userEvent.setup();
  const onCreateClick = jest.fn();

  render(<BoardToolbar searchValue="" onSearchChange={jest.fn()} onCreateClick={onCreateClick} />);

  const button = screen.getByRole('button', { name: '게시판 생성' });
  expect(button).toBeEnabled();
  await user.click(button);
  expect(onCreateClick).toHaveBeenCalled();
});
