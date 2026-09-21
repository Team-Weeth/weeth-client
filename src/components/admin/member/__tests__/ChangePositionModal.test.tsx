import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePositionModal } from '../modal/ChangePositionModal';

it('하나의 포지션만 선택해서 저장하고 모달을 닫는다', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  const onOpenChange = jest.fn();
  render(
    <ChangePositionModal open memberCount={3} onSubmit={onSubmit} onOpenChange={onOpenChange} />,
  );
  expect(screen.getByText('3명의 포지션을 일괄 변경합니다.')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '기획' }));
  await user.click(screen.getByRole('button', { name: '프론트엔드' }));
  expect(screen.getByRole('button', { name: '기획' })).toHaveAttribute('aria-pressed', 'false');
  expect(screen.getByRole('button', { name: '프론트엔드' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(onSubmit).toHaveBeenCalledWith('frontend');
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it('취소하면 저장하지 않고 재진입 시 선택 초안을 초기화한다', async () => {
  const user = userEvent.setup();
  const props = { memberCount: 2, onSubmit: jest.fn(), onOpenChange: jest.fn() };
  const { rerender } = render(<ChangePositionModal {...props} open />);
  await user.click(screen.getByRole('button', { name: '디자인' }));
  await user.click(screen.getByRole('button', { name: '취소' }));
  expect(props.onSubmit).not.toHaveBeenCalled();
  expect(props.onOpenChange).toHaveBeenCalledWith(false);
  rerender(<ChangePositionModal {...props} open={false} />);
  rerender(<ChangePositionModal {...props} open />);
  expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  expect(screen.getByRole('button', { name: '디자인' })).toHaveAttribute('aria-pressed', 'false');
});
