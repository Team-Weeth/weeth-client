import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Input } from '@/components/ui/Input';

describe('Input', () => {
  describe('기본 렌더링', () => {
    it('input 요소를 렌더링한다', () => {
      render(<Input placeholder="입력하세요" />);
      expect(screen.getByPlaceholderText('입력하세요')).toBeInTheDocument();
    });

    it('disabled 상태를 지원한다', () => {
      render(<Input disabled />);
      expect(screen.getByRole('textbox')).toBeDisabled();
    });

    it('error=true일 때 aria-invalid="true"가 적용된다', () => {
      render(<Input error />);
      expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('error=false이면 aria-invalid가 없다', () => {
      render(<Input />);
      expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-invalid');
    });
  });

  describe('clearable', () => {
    it('clearable 없이는 지우기 버튼이 없다', () => {
      render(<Input value="텍스트" onChange={() => {}} />);
      expect(screen.queryByRole('button', { name: '입력 내용 지우기' })).not.toBeInTheDocument();
    });

    it('clearable=true이고 값이 없으면 지우기 버튼이 없다', () => {
      render(<Input value="" clearable onChange={() => {}} />);
      expect(screen.queryByRole('button', { name: '입력 내용 지우기' })).not.toBeInTheDocument();
    });

    it('clearable=true이고 값이 있으면 지우기 버튼이 나타난다', () => {
      render(<Input value="텍스트" clearable onChange={() => {}} />);
      expect(screen.getByRole('button', { name: '입력 내용 지우기' })).toBeInTheDocument();
    });

    it('비제어 모드: 지우기 버튼 클릭 시 입력값이 비워진다', async () => {
      const user = userEvent.setup();
      render(<Input defaultValue="텍스트" clearable />);

      await user.click(screen.getByRole('button', { name: '입력 내용 지우기' }));

      expect(screen.getByRole('textbox')).toHaveValue('');
    });

    it('disabled 상태에서는 값이 있어도 지우기 버튼이 없다', () => {
      render(<Input value="텍스트" clearable disabled onChange={() => {}} />);
      expect(screen.queryByRole('button', { name: '입력 내용 지우기' })).not.toBeInTheDocument();
    });
  });
});
