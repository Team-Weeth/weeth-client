import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BoundTitleInput } from '../BoundTitleInput';

// ──────────────────────────────────────────────
// PostStore mock
// ──────────────────────────────────────────────
const setTitleMock = jest.fn();

jest.mock('@/stores/usePostStore', () => ({
  usePostStore: jest.fn((selector: (s: { title: string; setTitle: jest.Mock }) => unknown) =>
    selector({ title: '테스트 제목', setTitle: setTitleMock }),
  ),
}));

const { usePostStore } = jest.requireMock('@/stores/usePostStore') as {
  usePostStore: jest.Mock;
};

describe('BoundTitleInput', () => {
  beforeEach(() => {
    setTitleMock.mockClear();
    // 기본값 복원
    usePostStore.mockImplementation(
      (selector: (s: { title: string; setTitle: jest.Mock }) => unknown) =>
        selector({ title: '테스트 제목', setTitle: setTitleMock }),
    );
  });

  // ──────────────────────────────────────────────
  // 렌더링
  // ──────────────────────────────────────────────
  it('크래시 없이 렌더링된다', () => {
    render(<BoundTitleInput />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('PostStore의 title 값이 입력창에 표시된다', () => {
    render(<BoundTitleInput />);
    expect(screen.getByRole('textbox')).toHaveValue('테스트 제목');
  });

  // ──────────────────────────────────────────────
  // Store 바인딩
  // ──────────────────────────────────────────────
  describe('Store 바인딩', () => {
    it('사용자 입력 시 setTitle이 입력값으로 호출된다', async () => {
      const user = userEvent.setup();

      // 빈 title로 설정하여 타이핑 가능하게
      usePostStore.mockImplementation(
        (selector: (s: { title: string; setTitle: jest.Mock }) => unknown) =>
          selector({ title: '', setTitle: setTitleMock }),
      );

      render(<BoundTitleInput />);
      await user.type(screen.getByRole('textbox'), '안');

      expect(setTitleMock).toHaveBeenCalledWith('안');
    });

    it('title이 변경되면 입력창에 새 값이 반영된다', () => {
      usePostStore.mockImplementation(
        (selector: (s: { title: string; setTitle: jest.Mock }) => unknown) =>
          selector({ title: '수정된 제목', setTitle: setTitleMock }),
      );

      render(<BoundTitleInput />);
      expect(screen.getByRole('textbox')).toHaveValue('수정된 제목');
    });
  });
});
