import { http, HttpResponse } from 'msw';

import { FEEDBACK_CONTENT_MAX_LENGTH } from '@/constants/feedback';
import type { CreateFeedbackRequest } from '@/types/feedback';

const FEEDBACK_CREATE_SUCCESS_CODE = 11500;

export const feedbackHandlers = [
  http.post('/api/proxy/clubs/:clubId/feedbacks', async ({ request }) => {
    const body = (await request.json()) as Partial<CreateFeedbackRequest>;
    const content = body.content?.trim() ?? '';

    // 서버의 @Valid 실패 응답(CommonExceptionHandler bindException) 형태를 따른다.
    if (!content || content.length > FEEDBACK_CONTENT_MAX_LENGTH) {
      return HttpResponse.json(
        {
          code: 400,
          message: 'bindException',
          data: [
            { message: '피드백 내용은 1자 이상 1000자 이하로 입력해주세요.', value: body.content },
          ],
        },
        { status: 400 },
      );
    }

    return HttpResponse.json({
      code: FEEDBACK_CREATE_SUCCESS_CODE,
      message: '피드백이 등록되었습니다.',
      data: null,
    });
  }),
];
