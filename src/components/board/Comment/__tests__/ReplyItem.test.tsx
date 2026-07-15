import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ReplyItem } from '@/components/board/Comment/ReplyItem';

jest.mock('@/components/ui', () => jest.requireActual('@/test-utils/uiMocks'));

jest.mock('@/components/board/ActionMenu', () => ({
  ActionMenu: ({
    onEdit,
    onDeleteSelect,
  }: {
    onEdit?: () => void;
    onDeleteSelect?: (e: Event) => void;
  }) => (
    <div>
      <button type="button" aria-label="수정" onClick={onEdit}>
        수정
      </button>
      <button type="button" aria-label="삭제" onClick={() => onDeleteSelect?.(new Event('select'))}>
        삭제
      </button>
    </div>
  ),
}));

function makeProps(overrides: Partial<React.ComponentProps<typeof ReplyItem>> = {}) {
  return {
    id: 1,
    name: '홍길동',
    content: '답글 내용',
    date: '03/20 14:30',
    ...overrides,
  };
}

describe('ReplyItem', () => {
  describe('기본 렌더링', () => {
    it('크래시 없이 렌더링된다', () => {
      render(<ReplyItem {...makeProps()} />);
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    it('이름·내용·날짜가 표시된다', () => {
      render(<ReplyItem {...makeProps()} />);
      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('답글 내용')).toBeInTheDocument();
      expect(screen.getByText('03/20 14:30')).toBeInTheDocument();
    });
  });

  describe('ActionMenu 가시성', () => {
    it('isAuthor=true이면 수정·삭제 버튼이 표시된다', () => {
      render(<ReplyItem {...makeProps({ isAuthor: true })} />);
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });

    it('isAuthor=false이면 수정·삭제 버튼이 표시되지 않는다', () => {
      render(<ReplyItem {...makeProps({ isAuthor: false })} />);
      expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
    });
  });

  describe('수정 모드', () => {
    it('수정 클릭 시 CommentInput이 표시된다', async () => {
      const user = userEvent.setup();
      render(<ReplyItem {...makeProps({ isAuthor: true })} />);

      await user.click(screen.getByRole('button', { name: '수정' }));

      expect(screen.getByPlaceholderText('답글을 수정하세요')).toBeInTheDocument();
    });

    it('수정 모드에서 취소 클릭 시 원래 내용으로 돌아간다', async () => {
      const user = userEvent.setup();
      render(<ReplyItem {...makeProps({ isAuthor: true })} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(screen.getByText('답글 내용')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('답글을 수정하세요')).not.toBeInTheDocument();
    });

    it('수정 모드에서 저장 시 onEdit이 trim된 값으로 호출된다', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn().mockResolvedValue(undefined);
      render(<ReplyItem {...makeProps({ isAuthor: true, onEdit, content: '기존 내용' })} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(onEdit).toHaveBeenCalledWith('기존 내용');
    });
  });

  describe('삭제 플로우', () => {
    it('삭제 클릭 시 삭제 확인 다이얼로그가 표시된다', async () => {
      const user = userEvent.setup();
      render(<ReplyItem {...makeProps({ isAuthor: true })} />);

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('삭제 확인 클릭 시 onDelete가 호출된다', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      render(<ReplyItem {...makeProps({ isAuthor: true, onDelete })} />);

      await user.click(screen.getByRole('button', { name: '삭제' }));
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' }),
      );

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('삭제 확인 후 다이얼로그가 닫힌다', async () => {
      const user = userEvent.setup();
      render(<ReplyItem {...makeProps({ isAuthor: true, onDelete: jest.fn() })} />);

      await user.click(screen.getByRole('button', { name: '삭제' }));
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' }),
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});
