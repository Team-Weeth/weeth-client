import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleInput } from '../TitleInput';

describe('TitleInput', () => {
  // ──────────────────────────────────────────────
  // 렌더링
  // ──────────────────────────────────────────────
  it('placeholder "제목"이 노출된다', () => {
    render(<TitleInput />);
    expect(screen.getByPlaceholderText('제목')).toBeInTheDocument();
  });

  // ──────────────────────────────────────────────
  // Enter 줄바꿈 차단
  // ──────────────────────────────────────────────
  describe('Enter 줄바꿈 차단', () => {
    it('Enter 입력 시 줄바꿈(\n)이 추가되지 않는다', async () => {
      const user = userEvent.setup();
      render(<TitleInput />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, '제목{Enter}');

      expect(textarea).toHaveValue('제목');
    });

    it('Enter 키가 눌려도 외부 onKeyDown prop은 호출된다', async () => {
      const onKeyDown = jest.fn();
      const user = userEvent.setup();
      render(<TitleInput onKeyDown={onKeyDown} />);

      await user.type(screen.getByRole('textbox'), '{Enter}');

      expect(onKeyDown).toHaveBeenCalled();
    });

    it('Enter 외의 키는 차단하지 않는다', async () => {
      const user = userEvent.setup();
      render(<TitleInput />);
      const textarea = screen.getByRole('textbox');

      await user.type(textarea, 'abc');

      expect(textarea).toHaveValue('abc');
    });
  });

  // ──────────────────────────────────────────────
  // onChange 전달
  // ──────────────────────────────────────────────
  it('onChange prop이 입력마다 호출된다', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    render(<TitleInput onChange={onChange} />);

    await user.type(screen.getByRole('textbox'), '제목');

    expect(onChange).toHaveBeenCalledTimes(2); // '제' + '목' = 2회
  });

  // ──────────────────────────────────────────────
  // maxLength
  // ──────────────────────────────────────────────
  it('maxLength(100)을 초과하는 입력은 100자로 잘린다', async () => {
    const user = userEvent.setup();
    render(<TitleInput />);
    const textarea = screen.getByRole('textbox');

    await user.type(textarea, 'a'.repeat(120));

    expect((textarea as HTMLTextAreaElement).value).toHaveLength(100);
  });

  // ──────────────────────────────────────────────
  // className 전달
  // ──────────────────────────────────────────────
  it('className prop이 wrapper div에 적용된다', () => {
    render(<TitleInput className="custom-class" />);
    const wrapper = screen.getByPlaceholderText('제목').closest('div');
    expect(wrapper).toHaveClass('custom-class');
  });
});
