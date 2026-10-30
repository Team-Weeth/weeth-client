import { http, HttpResponse } from 'msw';
import { isAxiosError } from 'axios';

import { feedbackApi } from '@/lib/apis/feedback';
import { server } from '@/mocks/server';

describe('feedbackApi.create', () => {
  it('clubId 경로로 trim한 본문과 channel을 전송한다', async () => {
    let capturedUrl: URL | null = null;
    let capturedBody: unknown = null;

    server.use(
      http.post('/api/proxy/clubs/:clubId/feedbacks', async ({ request }) => {
        capturedUrl = new URL(request.url);
        capturedBody = await request.json();
        return HttpResponse.json({ code: 11500, message: '성공', data: null });
      }),
    );

    await feedbackApi.create('club-1', { content: '  알림이 늦게 와요  ', channel: 'CHAT' });

    expect(capturedUrl!.pathname).toBe('/api/proxy/clubs/club-1/feedbacks');
    expect(capturedBody).toEqual({ content: '알림이 늦게 와요', channel: 'CHAT' });
  });

  it('기본 목 핸들러는 성공 코드 11500과 data null을 반환한다', async () => {
    const response = await feedbackApi.create('club-1', { content: '좋아요', channel: 'FORM' });

    expect(response.data).toMatchObject({ code: 11500, data: null });
  });

  it('기본 목 핸들러는 공백뿐인 본문을 400으로 거절한다', async () => {
    const error = await feedbackApi
      .create('club-1', { content: '   ', channel: 'FORM' })
      .catch((e: unknown) => e);

    expect(isAxiosError(error) && error.response?.status).toBe(400);
  });
});
