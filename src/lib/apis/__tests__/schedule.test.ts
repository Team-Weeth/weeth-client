import { http, HttpResponse } from 'msw';

import { scheduleApi } from '@/lib/apis/schedule';
import { server } from '@/mocks/server';

describe('scheduleApi.getDetail', () => {
  it('clubId·id를 URL에 포함하고 type을 쿼리 파라미터로 전달한다', async () => {
    let capturedUrl: URL | null = null;

    server.use(
      http.get('/api/proxy/clubs/:clubId/schedules/:id', ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ code: 200, message: '성공', data: null });
      }),
    );

    await scheduleApi.getDetail('club-1', 42, 'SESSION');

    expect(capturedUrl!.pathname).toBe('/api/proxy/clubs/club-1/schedules/42');
    expect(capturedUrl!.searchParams.get('type')).toBe('SESSION');
  });

  it('응답 data를 반환한다', async () => {
    const mockData = {
      id: 42,
      type: 'SESSION',
      title: '1차 정기모임',
      start: '2026-09-20T14:00:00',
      end: '2026-09-20T16:00:00',
    };

    server.use(
      http.get('/api/proxy/clubs/:clubId/schedules/:id', () => {
        return HttpResponse.json({ code: 200, message: '성공', data: mockData });
      }),
    );

    const response = await scheduleApi.getDetail('club-1', 42, 'SESSION');

    expect(response.data.data).toMatchObject({ id: 42, title: '1차 정기모임' });
  });
});

describe('scheduleApi.getMonthly', () => {
  it('clubId를 URL에 포함하고 cardinal·start·end를 쿼리 파라미터로 전달한다', async () => {
    let capturedUrl: URL | null = null;

    server.use(
      http.get('/api/proxy/clubs/:clubId/schedules/monthly', ({ request }) => {
        capturedUrl = new URL(request.url);
        return HttpResponse.json({ code: 200, message: '성공', data: [] });
      }),
    );

    await scheduleApi.getMonthly('club-1', 7, '2026-09-01', '2026-09-30');

    expect(capturedUrl!.pathname).toBe('/api/proxy/clubs/club-1/schedules/monthly');
    expect(capturedUrl!.searchParams.get('cardinal')).toBe('7');
    expect(capturedUrl!.searchParams.get('start')).toBe('2026-09-01');
    expect(capturedUrl!.searchParams.get('end')).toBe('2026-09-30');
  });

  it('응답 data 배열을 반환한다', async () => {
    const mockData = [
      {
        id: 1,
        title: '1차 정기모임',
        start: '2026-09-20T14:00:00',
        end: '2026-09-20T16:00:00',
        type: 'SESSION',
        cardinal: 7,
      },
    ];

    server.use(
      http.get('/api/proxy/clubs/:clubId/schedules/monthly', () => {
        return HttpResponse.json({ code: 200, message: '성공', data: mockData });
      }),
    );

    const response = await scheduleApi.getMonthly('club-1', 7, '2026-09-01', '2026-09-30');

    expect(response.data.data).toHaveLength(1);
    expect(response.data.data?.[0]).toMatchObject({ id: 1, type: 'SESSION' });
  });
});
