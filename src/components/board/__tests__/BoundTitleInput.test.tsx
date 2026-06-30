import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoundTitleInput } from '@/components/board/BoundTitleInput';

const setTitleMock = jest.fn();

function mockStore(title: string) {
  return (selector: (s: { title: string; setTitle: jest.Mock }) => unknown) =>
    selector({ title, setTitle: setTitleMock });
}

jest.mock('@/stores/usePostStore', () => ({
  usePostStore: jest.fn(mockStore('테스트 제목')),
}));

const { usePostStore } = jest.requireMock('@/stores/usePostStore') as {
  usePostStore: jest.Mock;
};

describe('BoundTitleInput', () => {
  beforeEach(() => {
    setTitleMock.mockClear();
    usePostStore.mockImplementation(mockStore('테스트 제목'));
  });

  it('크래시 없이 렌더링된다', () => {
    render(<BoundTitleInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('PostStore의 title 값이 입력창에 표시된다', () => {
    render(<BoundTitleInput />);
    expect(screen.getByRole('textbox')).toHaveValue('테스트 제목');
  });

  describe('Store 바인딩', () => {
    it('사용자 입력 시 setTitle이 입력값으로 호출된다', async () => {
      const user = userEvent.setup();

      // 빈 title로 설정하여 타이핑 가능하게
      usePostStore.mockImplementation(mockStore(''));

      render(<BoundTitleInput />);
      await user.type(screen.getByRole('textbox'), '안');

      expect(setTitleMock).toHaveBeenCalledWith('안');
    });

    it('store의 title이 변경되면 이미 마운트된 입력창에 새 값이 반영된다', () => {
      usePostStore.mockImplementation(mockStore('초기 제목'));
      const { rerender } = render(<BoundTitleInput />);
      expect(screen.getByRole('textbox')).toHaveValue('초기 제목');

      usePostStore.mockImplementation(mockStore('수정된 제목'));
      rerender(<BoundTitleInput />);

      expect(screen.getByRole('textbox')).toHaveValue('수정된 제목');
    });
  });
});
