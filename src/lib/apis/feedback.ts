import { apiClient } from '@/lib/apis/client';
import type { ApiResponse } from '@/types/common';
import type { CreateFeedbackRequest } from '@/types/feedback';

export const feedbackApi = {
  /** 서비스 피드백 등록 — 본문은 서버 검증 기준(trim 후 1~1000자)에 맞춰 공백을 제거해 보낸다. */
  create: (clubId: string, body: CreateFeedbackRequest) =>
    apiClient.post<ApiResponse<null>>(`/clubs/${clubId}/feedbacks`, {
      ...body,
      content: body.content.trim(),
    }),
};
