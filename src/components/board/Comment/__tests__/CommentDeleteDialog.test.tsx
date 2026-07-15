import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentDeleteDialog } from '@/components/board/Comment/CommentDeleteDialog';

jest.mock('@/components/ui', () => jest.requireActual('@/test-utils/uiMocks'));

describe('CommentDeleteDialog', () => {
  describe('기본 렌더링', () => {
    it('open=false이면 다이얼로그 콘텐츠가 표시되지 않는다', () => {
      render(<CommentDeleteDialog open={false} onOpenChange={jest.fn()} onConfirm={jest.fn()} />);
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });

    it('open=true이면 제목이 표시된다', () => {
      render(<CommentDeleteDialog open={true} onOpenChange={jest.fn()} onConfirm={jest.fn()} />);
      expect(screen.getByText('이 댓글을 삭제하시겠어요?')).toBeInTheDocument();
    });

    it('open=true이면 설명이 표시된다', () => {
      render(<CommentDeleteDialog open={true} onOpenChange={jest.fn()} onConfirm={jest.fn()} />);
      expect(screen.getByText('삭제된 댓글은 복구할 수 없어요.')).toBeInTheDocument();
    });

    it('삭제·취소 버튼이 표시된다', () => {
      render(<CommentDeleteDialog open={true} onOpenChange={jest.fn()} onConfirm={jest.fn()} />);
      expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    });
  });

  describe('삭제 확인', () => {
    it('삭제 버튼 클릭 시 onConfirm이 호출된다', async () => {
      const user = userEvent.setup();
      const onConfirm = jest.fn();
      render(<CommentDeleteDialog open={true} onOpenChange={jest.fn()} onConfirm={onConfirm} />);

      await user.click(screen.getByRole('button', { name: '삭제' }));

      expect(onConfirm).toHaveBeenCalledTimes(1);
    });
  });

  describe('isPending', () => {
    it('isPending=true이면 삭제 버튼이 비활성화된다', () => {
      render(
        <CommentDeleteDialog
          open={true}
          onOpenChange={jest.fn()}
          onConfirm={jest.fn()}
          isPending
        />,
      );
      expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
    });

    it('isPending=true이면 취소 버튼이 비활성화된다', () => {
      render(
        <CommentDeleteDialog
          open={true}
          onOpenChange={jest.fn()}
          onConfirm={jest.fn()}
          isPending
        />,
      );
      expect(screen.getByRole('button', { name: '취소' })).toBeDisabled();
    });

    it('isPending=false(기본값)이면 삭제·취소 버튼이 활성화된다', () => {
      render(<CommentDeleteDialog open={true} onOpenChange={jest.fn()} onConfirm={jest.fn()} />);
      expect(screen.getByRole('button', { name: '삭제' })).not.toBeDisabled();
      expect(screen.getByRole('button', { name: '취소' })).not.toBeDisabled();
    });
  });
});
