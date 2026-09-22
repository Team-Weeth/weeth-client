import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChangePositionModal } from '../modal/ChangePositionModal';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

const POSITION_OPTIONS: MemberPositionOption[] = [
  { id: '1', name: '기획', color: 'purple' },
  { id: '2', name: '디자인', color: 'pink' },
  { id: '3', name: '프론트엔드', color: 'secondary' },
  { id: '4', name: '백엔드', color: 'primary' },
];

it('하나의 포지션만 선택해서 저장하고 모달을 닫는다', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  const onOpenChange = jest.fn();
  render(
    <ChangePositionModal
      open
      memberCount={3}
      options={POSITION_OPTIONS}
      onSubmit={onSubmit}
      onOpenChange={onOpenChange}
    />,
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
  expect(onSubmit).toHaveBeenCalledWith(POSITION_OPTIONS[2]);
  expect(onSubmit).toHaveBeenCalledTimes(1);
  expect(onOpenChange).toHaveBeenCalledWith(false);
});

it('목록 끝의 지정 해제를 선택하면 null로 저장한다', async () => {
  const user = userEvent.setup();
  const onSubmit = jest.fn();
  render(
    <ChangePositionModal
      open
      memberCount={2}
      options={POSITION_OPTIONS}
      onSubmit={onSubmit}
      onOpenChange={jest.fn()}
    />,
  );
  const chips = screen.getAllByRole('button', { pressed: false });
  expect(chips.at(-1)).toHaveTextContent('지정 해제');
  await user.click(screen.getByRole('button', { name: '백엔드' }));
  await user.click(screen.getByRole('button', { name: '지정 해제' }));
  expect(screen.getByRole('button', { name: '백엔드' })).toHaveAttribute('aria-pressed', 'false');
  await user.click(screen.getByRole('button', { name: '저장' }));
  expect(onSubmit).toHaveBeenCalledWith(null);
});

it('취소하면 저장하지 않고 재진입 시 선택 초안을 초기화한다', async () => {
  const user = userEvent.setup();
  const props = {
    memberCount: 2,
    options: POSITION_OPTIONS,
    onSubmit: jest.fn(),
    onOpenChange: jest.fn(),
  };
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
