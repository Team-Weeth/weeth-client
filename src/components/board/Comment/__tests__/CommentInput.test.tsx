import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CommentInput } from '@/components/board/Comment/CommentInput';

describe('CommentInput', () => {
  describe('기본 렌더링', () => {
    it('기본 placeholder "댓글을 입력하세요"가 표시된다', () => {
      render(<CommentInput />);
      expect(screen.getByPlaceholderText('댓글을 입력하세요')).toBeInTheDocument();
    });

    it('커스텀 placeholder가 표시된다', () => {
      render(<CommentInput placeholder="답글을 입력하세요" />);
      expect(screen.getByPlaceholderText('답글을 입력하세요')).toBeInTheDocument();
    });

    it('초기 문자 카운트 "0/300"이 표시된다', () => {
      render(<CommentInput />);
      expect(screen.getByText('0/300')).toBeInTheDocument();
    });

    it('defaultValue가 textarea에 미리 채워지고 카운트에 반영된다', () => {
      render(<CommentInput defaultValue="기존 댓글" />);
      expect(screen.getByDisplayValue('기존 댓글')).toBeInTheDocument();
      expect(screen.getByText('5/300')).toBeInTheDocument();
    });
  });

  describe('send 모드 (onCancel 미제공)', () => {
    it('댓글 전송 버튼이 렌더링된다', () => {
      render(<CommentInput />);
      expect(screen.getByRole('button', { name: '댓글 전송' })).toBeInTheDocument();
    });

    it('입력값이 없으면 전송 버튼이 비활성화된다', () => {
      render(<CommentInput />);
      expect(screen.getByRole('button', { name: '댓글 전송' })).toBeDisabled();
    });

    it('텍스트 입력 시 문자 카운트가 업데이트된다', async () => {
      const user = userEvent.setup();
      render(<CommentInput />);
      await user.type(screen.getByPlaceholderText('댓글을 입력하세요'), '안녕');
      expect(screen.getByText('2/300')).toBeInTheDocument();
    });

    it('텍스트 입력 시 onValueChange가 호출된다', async () => {
      const user = userEvent.setup();
      const onValueChange = jest.fn();
      render(<CommentInput onValueChange={onValueChange} />);
      await user.type(screen.getByPlaceholderText('댓글을 입력하세요'), '테스트');
      expect(onValueChange).toHaveBeenLastCalledWith('테스트');
    });

    it('전송 시 onSubmit에 trim된 값이 전달된다', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(true);
      render(<CommentInput onSubmit={onSubmit} />);
      await user.type(screen.getByPlaceholderText('댓글을 입력하세요'), '  댓글 내용  ');
      await user.click(screen.getByRole('button', { name: '댓글 전송' }));
      expect(onSubmit).toHaveBeenCalledWith('댓글 내용');
    });

    it('onSubmit 성공 후 입력창이 초기화된다', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(true);
      render(<CommentInput onSubmit={onSubmit} />);
      const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
      await user.type(textarea, '테스트');
      await user.click(screen.getByRole('button', { name: '댓글 전송' }));
      expect(textarea).toHaveValue('');
    });

    it('onSubmit이 false를 반환하면 초안이 유지된다', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(false);
      render(<CommentInput onSubmit={onSubmit} />);
      const textarea = screen.getByPlaceholderText('댓글을 입력하세요');
      await user.type(textarea, '임시 저장');
      await user.click(screen.getByRole('button', { name: '댓글 전송' }));
      expect(textarea).toHaveValue('임시 저장');
    });

    it('onSubmit 없이 전송 버튼을 눌러도 오류가 발생하지 않는다', async () => {
      const user = userEvent.setup();
      render(<CommentInput />);
      await user.type(screen.getByPlaceholderText('댓글을 입력하세요'), '내용');
      await expect(
        user.click(screen.getByRole('button', { name: '댓글 전송' })),
      ).resolves.not.toThrow();
    });
  });

  describe('edit 모드 (onCancel 제공)', () => {
    it('전송 버튼 대신 취소·저장 버튼이 표시된다', () => {
      render(<CommentInput onCancel={jest.fn()} />);
      expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '댓글 전송' })).not.toBeInTheDocument();
    });

    it('취소 클릭 시 onCancel이 호출된다', async () => {
      const user = userEvent.setup();
      const onCancel = jest.fn();
      render(<CommentInput onCancel={onCancel} />);
      await user.click(screen.getByRole('button', { name: '취소' }));
      expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('입력값이 없으면 저장 버튼이 비활성화된다', () => {
      render(<CommentInput onCancel={jest.fn()} />);
      expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
    });

    it('defaultValue가 있으면 저장 버튼이 활성화된다', () => {
      render(<CommentInput onCancel={jest.fn()} defaultValue="기존 댓글" />);
      expect(screen.getByRole('button', { name: '저장' })).not.toBeDisabled();
    });

    it('저장 클릭 시 onSubmit에 trim된 값이 전달된다', async () => {
      const user = userEvent.setup();
      const onSubmit = jest.fn().mockResolvedValue(true);
      render(<CommentInput onCancel={jest.fn()} onSubmit={onSubmit} defaultValue="기존 내용" />);
      await user.click(screen.getByRole('button', { name: '저장' }));
      expect(onSubmit).toHaveBeenCalledWith('기존 내용');
    });
  });

  describe('disabled', () => {
    it('disabled=true이면 textarea가 비활성화된다', () => {
      render(<CommentInput disabled />);
      expect(screen.getByPlaceholderText('댓글을 입력하세요')).toBeDisabled();
    });

    it('disabled=true이면 전송 버튼이 비활성화된다', () => {
      render(<CommentInput disabled />);
      expect(screen.getByRole('button', { name: '댓글 전송' })).toBeDisabled();
    });
  });
});
