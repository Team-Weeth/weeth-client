import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { WaxNicknameDialog } from '@/components/minigame/wax/WaxNicknameDialog';

function renderDialog(serverError?: string) {
  const props = {
    open: true,
    suggestion: '수상한 복학생',
    onEnter: jest.fn(),
    onCancel: jest.fn(),
  };
  const view = render(<WaxNicknameDialog {...props} serverError={serverError} />);
  return {
    ...view,
    rerenderWith: (next?: string) =>
      view.rerender(<WaxNicknameDialog {...props} serverError={next} />),
  };
}

describe('WaxNicknameDialog', () => {
  beforeEach(() => window.localStorage.clear());

  it('서버가 이름을 거절하면 입력칸을 비우고, 다시 입력하기 시작하면 거절 문구를 숨긴다', async () => {
    const user = userEvent.setup();
    const { rerenderWith } = renderDialog();
    const input = screen.getByLabelText('닉네임 직접 입력');
    await user.type(input, '왁뿌볼고수');

    rerenderWith('사용할 수 없는 닉네임이에요.');
    expect(input).toHaveValue('');
    expect(screen.getByRole('alert')).toHaveTextContent('사용할 수 없는 닉네임이에요.');

    await user.type(input, '새이름');
    expect(screen.queryByText('사용할 수 없는 닉네임이에요.')).not.toBeInTheDocument();
  });

  it('입력칸이 오류 문구를 설명으로 참조한다', async () => {
    const user = userEvent.setup();
    renderDialog();
    const input = screen.getByLabelText('닉네임 직접 입력');
    await user.type(input, '!');
    await user.tab();
    const describedBy = input.getAttribute('aria-describedby');
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(describedBy as string)).toHaveTextContent('2~8자');
  });
});
