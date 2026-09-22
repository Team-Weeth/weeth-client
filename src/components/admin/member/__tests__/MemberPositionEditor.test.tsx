import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberPositionEditor } from '../MemberPositionEditor';
import { MemberPositionFields } from '../MemberPositionFields';

it('이름을 입력하지 않아도 다른 옵션이 쓰는 색상은 모두 비활성화한다', async () => {
  const user = userEvent.setup();
  render(<MemberPositionEditor onSave={jest.fn()} />);
  await user.click(screen.getByRole('button', { name: '옵션 1 색상: 민트' }));
  for (const label of ['파랑', '보라', '분홍']) {
    expect(screen.getByRole('menuitem', { name: label })).toHaveAttribute('aria-disabled', 'true');
  }
  for (const label of ['노랑', '빨강']) {
    expect(screen.getByRole('menuitem', { name: label })).not.toHaveAttribute(
      'aria-disabled',
      'true',
    );
  }
  expect(screen.getByRole('menuitem', { name: '민트' })).toHaveAttribute('aria-current', 'true');
  await user.click(screen.getByRole('menuitem', { name: '노랑' }));
  expect(screen.getByRole('button', { name: '옵션 1 색상: 노랑' })).toBeInTheDocument();
});

it('현재 색상은 선택 표시하고 다른 옵션의 색상은 막으며 옵션 삭제 시 다시 허용한다', async () => {
  const user = userEvent.setup();
  render(
    <MemberPositionEditor
      initialOptions={[
        { id: '1', name: '개발', color: 'primary' },
        { id: '2', name: '기획', color: 'caution' },
      ]}
      onSave={jest.fn()}
    />,
  );
  await user.click(screen.getByRole('button', { name: '옵션 1 색상: 민트' }));
  expect(screen.getByRole('menuitem', { name: '민트' })).toHaveAttribute('aria-current', 'true');
  expect(screen.getByRole('menuitem', { name: '노랑' })).toHaveAttribute('aria-disabled', 'true');
  await user.click(screen.getByRole('menuitem', { name: '노랑' }));
  expect(screen.getByRole('button', { name: '옵션 1 색상: 민트' })).toBeInTheDocument();
  await user.keyboard('{Escape}');
  await user.click(screen.getByRole('button', { name: '옵션 2 삭제' }));
  await user.click(screen.getByRole('button', { name: '옵션 1 색상: 민트' }));
  expect(screen.getByRole('menuitem', { name: '노랑' })).not.toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await user.click(screen.getByRole('menuitem', { name: '노랑' }));
  expect(screen.getByRole('button', { name: '옵션 1 색상: 노랑' })).toBeInTheDocument();
});

it('포커스가 빠져 카운터가 사라져도 글자 수 오류 설명을 입력에 연결해 둔다', async () => {
  const user = userEvent.setup();
  render(
    <MemberPositionEditor
      initialOptions={[{ id: '1', name: '', color: 'primary' }]}
      onSave={jest.fn()}
    />,
  );
  const input = screen.getByRole('textbox');
  await user.click(input);
  fireEvent.change(input, { target: { value: '가나다라마바사아자차' } });
  await user.type(input, '카');
  await user.tab();
  expect(screen.queryByText('10/10')).not.toBeInTheDocument();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveAccessibleDescription('옵션 이름은 최대 10자까지 입력할 수 있습니다.');
});

it('11자부터 입력을 막고 10/10과 오류 테두리를 유지하며 수정하면 오류를 해제한다', async () => {
  const user = userEvent.setup();
  const onSave = jest.fn();
  render(
    <MemberPositionEditor
      initialOptions={[{ id: '1', name: '', color: 'primary' }]}
      onSave={onSave}
    />,
  );
  const input = screen.getByRole('textbox');
  const save = screen.getByRole('button', { name: '저장하기' });
  expect(screen.queryByText('0/10')).not.toBeInTheDocument();
  await user.click(input);
  fireEvent.change(input, { target: { value: '가나다라마바사아자차' } });
  expect(screen.getByText('10/10')).toBeInTheDocument();
  expect(input).not.toHaveAttribute('aria-invalid', 'true');
  expect(save).toBeEnabled();
  await user.type(input, '카');
  expect(input).toHaveValue('가나다라마바사아자차');
  expect(screen.getByText('10/10')).toHaveClass('text-state-error');
  expect(screen.queryByText('11/10')).not.toBeInTheDocument();
  expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(input).toHaveClass('border-state-error');
  expect(save).toBeEnabled();
  await user.clear(input);
  await user.paste('가나다라마바사아자차카타파하');
  expect(input).toHaveValue('가나다라마바사아자차');
  expect(screen.getByText('10/10')).toHaveClass('text-state-error');
  expect(input).toHaveClass('border-state-error');
  fireEvent.change(input, { target: { value: '개발팀' } });
  expect(screen.getByText('3/10')).toBeInTheDocument();
  expect(input).not.toHaveAttribute('aria-invalid', 'true');
  await user.tab();
  expect(screen.queryByText('3/10')).not.toBeInTheDocument();
  await user.click(input);
  expect(screen.getByText('3/10')).toBeInTheDocument();
  await user.click(save);
  expect(onSave).toHaveBeenCalledWith({
    options: [{ id: 1, name: '개발팀', color: 'primary' }],
    deletedIds: [],
  });
});

it('기본정보 필드 5개 중 포지션에만 커스텀 필드 태그를 표시한다', () => {
  render(<MemberPositionFields />);
  expect(screen.getAllByRole('listitem')).toHaveLength(5);
  expect(screen.getAllByText('커스텀 필드')).toHaveLength(1);
  expect(screen.getByText('커스텀 필드').closest('li')).toHaveTextContent('포지션');
});

it('빈 옵션 4개로 시작하고 최대 6개까지 추가한 뒤 삭제할 수 있다', async () => {
  const user = userEvent.setup();
  render(<MemberPositionEditor onSave={jest.fn()} />);
  expect(screen.getAllByRole('textbox')).toHaveLength(4);
  expect(screen.getByRole('button', { name: '저장하기' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '옵션 추가하기 (4/6)' }));
  await user.click(screen.getByRole('button', { name: '옵션 추가하기 (5/6)' }));
  expect(screen.getAllByRole('textbox')).toHaveLength(6);
  expect(screen.getByRole('button', { name: '옵션 추가하기 (6/6)' })).toBeDisabled();
  await user.click(screen.getByRole('button', { name: '옵션 2 삭제' }));
  expect(screen.getAllByRole('textbox')).toHaveLength(5);
  expect(screen.getByRole('button', { name: '옵션 추가하기 (5/6)' })).toBeEnabled();
});

it('공백과 중복 이름은 저장하지 않고 변경된 유효한 이름은 다듬어 저장한다', async () => {
  const user = userEvent.setup();
  const onSave = jest.fn();
  render(
    <MemberPositionEditor
      initialOptions={[
        { id: '1', name: '개발', color: 'primary' },
        { id: '2', name: '디자인', color: 'pink' },
      ]}
      onSave={onSave}
    />,
  );
  const save = screen.getByRole('button', { name: '저장하기' });
  const input = screen.getByRole('textbox', { name: '옵션 2 이름' });
  expect(save).toBeDisabled();
  fireEvent.change(input, { target: { value: '   ' } });
  expect(save).toBeDisabled();
  fireEvent.change(input, { target: { value: ' 개발 ' } });
  expect(save).toBeDisabled();
  expect(screen.getByRole('alert')).toHaveTextContent('서로 다르게');
  fireEvent.change(input, { target: { value: ' 기획 ' } });
  await user.click(save);
  await waitFor(() =>
    expect(onSave).toHaveBeenCalledWith({
      options: [
        { id: 1, name: '개발', color: 'primary' },
        { id: 2, name: '기획', color: 'pink' },
      ],
      deletedIds: [],
    }),
  );
  expect(save).toBeDisabled();
});

it('저장 실패 시 입력값과 재시도 기능을 유지하고 서버 오류를 표시한다', async () => {
  const user = userEvent.setup();
  const onSave = jest.fn().mockRejectedValue({
    isAxiosError: true,
    response: { data: { message: '저장할 수 없습니다.' } },
  });
  render(
    <MemberPositionEditor
      initialOptions={[{ id: '1', name: '개발', color: 'primary' }]}
      onSave={onSave}
    />,
  );
  fireEvent.change(screen.getByRole('textbox'), { target: { value: '기획' } });
  await user.click(screen.getByRole('button', { name: '저장하기' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('저장할 수 없습니다.');
  expect(screen.getByRole('textbox')).toHaveValue('기획');
  expect(screen.getByRole('button', { name: '저장하기' })).toBeEnabled();
});

it('색상 선택을 변경하면 선택기를 닫고 선택한 색상을 저장한다', async () => {
  const user = userEvent.setup();
  const onSave = jest.fn();
  render(
    <MemberPositionEditor
      initialOptions={[{ id: '1', name: '개발', color: 'primary' }]}
      onSave={onSave}
    />,
  );
  await user.click(screen.getByRole('button', { name: '옵션 1 색상: 민트' }));
  await user.click(screen.getByRole('menuitem', { name: '보라' }));
  expect(screen.getByRole('button', { name: '옵션 1 색상: 보라' })).toBeInTheDocument();
  expect(screen.queryByRole('menuitem', { name: '보라' })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: '저장하기' }));
  expect(onSave).toHaveBeenCalledWith({
    options: [{ id: 1, name: '개발', color: 'purple' }],
    deletedIds: [],
  });
});
