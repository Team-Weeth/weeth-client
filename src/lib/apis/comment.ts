import { apiClientV1 } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { CreateCommentBody, UpdateCommentBody } from '@/types/board';

export const commentApi = {
  /** 댓글 작성 */
  create: (postId: number, body: CreateCommentBody) =>
    apiClientV1.post<ApiResponse<void>>(`/posts/${postId}/comments`, body),

  /** 댓글 수정 */
  update: (postId: number, commentId: number, body: UpdateCommentBody) =>
    apiClientV1.patch<ApiResponse<void>>(`/posts/${postId}/comments/${commentId}`, body),

  /** 댓글 삭제 */
  delete: (postId: number, commentId: number) =>
    apiClientV1.delete<ApiResponse<void>>(`/posts/${postId}/comments/${commentId}`),
};
