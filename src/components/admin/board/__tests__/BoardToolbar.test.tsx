import { fireEvent, render, screen } from '@testing-library/react';

import { BoardToolbar } from '@/components/admin/board/BoardToolbar';

it('서버가 게시판 생성을 허용하지 않으면 생성 버튼을 비활성화한다', () => {
  const onCreateClick = jest.fn();

  render(
    <BoardToolbar
      searchValue=""
      onSearchChange={jest.fn()}
      onCreateClick={onCreateClick}
      createDisabled
    />,
  );

  const button = screen.getByRole('button', { name: '게시판 생성' });
  expect(button).toBeDisabled();
  fireEvent.click(button);
  expect(onCreateClick).not.toHaveBeenCalled();
});
