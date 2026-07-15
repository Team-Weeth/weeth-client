import React from 'react';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentItem } from '@/components/board/Comment/CommentItem';

jest.mock('@/hooks', () => ({
  useScrollIntoView: jest.fn(() => ({ current: null })),
}));

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

function makeProps(overrides: Partial<React.ComponentProps<typeof CommentItem>> = {}) {
  return {
    name: '홍길동',
    content: '댓글 내용',
    date: '03/20 14:30',
    ...overrides,
  };
}

describe('CommentItem', () => {
  describe('기본 렌더링', () => {
    it('크래시 없이 렌더링된다', () => {
      render(<CommentItem {...makeProps()} />);
      expect(screen.getByText('홍길동')).toBeInTheDocument();
    });

    it('이름·내용·날짜가 표시된다', () => {
      render(<CommentItem {...makeProps()} />);
      expect(screen.getByText('홍길동')).toBeInTheDocument();
      expect(screen.getByText('댓글 내용')).toBeInTheDocument();
      expect(screen.getByText('03/20 14:30')).toBeInTheDocument();
    });

    it('답글 버튼이 항상 표시된다', () => {
      render(<CommentItem {...makeProps()} />);
      expect(screen.getByRole('button', { name: '답글' })).toBeInTheDocument();
    });
  });

  describe('isDeleted', () => {
    it('isDeleted=true이면 ActionMenu가 표시되지 않는다 (isAuthor=true여도)', () => {
      render(<CommentItem {...makeProps({ isAuthor: true, isDeleted: true })} />);
      expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
    });
  });

  describe('ActionMenu 가시성', () => {
    it('isAuthor=true이면 수정·삭제 버튼이 표시된다', () => {
      render(<CommentItem {...makeProps({ isAuthor: true })} />);
      expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
    });

    it('isAuthor=false이면 수정·삭제 버튼이 표시되지 않는다', () => {
      render(<CommentItem {...makeProps({ isAuthor: false })} />);
      expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
    });
  });

  describe('수정 모드', () => {
    it('수정 클릭 시 CommentInput이 표시된다', async () => {
      const user = userEvent.setup();
      render(<CommentItem {...makeProps({ isAuthor: true })} />);

      await user.click(screen.getByRole('button', { name: '수정' }));

      expect(screen.getByPlaceholderText('댓글을 수정하세요')).toBeInTheDocument();
    });

    it('수정 모드에서는 답글·ActionMenu 버튼이 숨겨진다', async () => {
      const user = userEvent.setup();
      render(<CommentItem {...makeProps({ isAuthor: true })} />);

      await user.click(screen.getByRole('button', { name: '수정' }));

      expect(screen.queryByRole('button', { name: '답글' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument();
    });

    it('수정 모드에서 취소 클릭 시 원래 내용으로 돌아간다', async () => {
      const user = userEvent.setup();
      render(<CommentItem {...makeProps({ isAuthor: true })} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(screen.getByText('댓글 내용')).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('댓글을 수정하세요')).not.toBeInTheDocument();
    });

    it('수정 모드에서 저장 시 onEdit이 호출된다', async () => {
      const user = userEvent.setup();
      const onEdit = jest.fn().mockResolvedValue(true);
      render(<CommentItem {...makeProps({ isAuthor: true, onEdit, content: '기존 내용' })} />);

      await user.click(screen.getByRole('button', { name: '수정' }));
      await user.click(screen.getByRole('button', { name: '저장' }));

      expect(onEdit).toHaveBeenCalledWith('기존 내용');
    });
  });

  describe('삭제 플로우', () => {
    it('삭제 클릭 시 삭제 확인 다이얼로그가 표시된다', async () => {
      const user = userEvent.setup();
      render(<CommentItem {...makeProps({ isAuthor: true })} />);

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('삭제 확인 클릭 시 onDelete가 호출된다', async () => {
      const user = userEvent.setup();
      const onDelete = jest.fn();
      render(<CommentItem {...makeProps({ isAuthor: true, onDelete })} />);

      await user.click(screen.getByRole('button', { name: '삭제' }));
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' }),
      );

      expect(onDelete).toHaveBeenCalledTimes(1);
    });

    it('삭제 확인 후 다이얼로그가 닫힌다', async () => {
      const user = userEvent.setup();
      render(<CommentItem {...makeProps({ isAuthor: true, onDelete: jest.fn() })} />);

      await user.click(screen.getByRole('button', { name: '삭제' }));
      await user.click(
        within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' }),
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('답글 목록', () => {
    it('replies가 있으면 답글 내용이 표시된다', () => {
      const replies = [
        {
          id: 10,
          name: '이순신',
          content: '답글 내용',
          date: '03/21 09:00',
        },
      ];
      render(<CommentItem {...makeProps({ replies })} />);

      expect(screen.getByText('이순신')).toBeInTheDocument();
      expect(screen.getByText('답글 내용')).toBeInTheDocument();
    });

    it('replies가 없으면 답글 영역이 표시되지 않는다', () => {
      render(<CommentItem {...makeProps({ replies: [] })} />);

      expect(screen.queryByText('이순신')).not.toBeInTheDocument();
    });
  });

  describe('답글 입력', () => {
    it('replyOpen=true이면 답글 입력창이 표시된다', () => {
      render(<CommentItem {...makeProps({ replyOpen: true })} />);
      expect(screen.getByPlaceholderText('답글을 입력하세요')).toBeInTheDocument();
    });

    it('replyOpen=false이면 답글 입력창이 표시되지 않는다', () => {
      render(<CommentItem {...makeProps({ replyOpen: false })} />);
      expect(screen.queryByPlaceholderText('답글을 입력하세요')).not.toBeInTheDocument();
    });

    it('답글 버튼 클릭 시 onReplyToggle이 호출된다', async () => {
      const user = userEvent.setup();
      const onReplyToggle = jest.fn();
      render(<CommentItem {...makeProps({ onReplyToggle })} />);

      await user.click(screen.getByRole('button', { name: '답글' }));

      expect(onReplyToggle).toHaveBeenCalledTimes(1);
    });
  });
});
