import { http, HttpResponse } from 'msw';

export const scheduleHandlers = [
  // getMonthly must be before :id to avoid param capture of the literal 'monthly'
  http.get('/api/proxy/clubs/:clubId/schedules/monthly', () => {
    return HttpResponse.json({
      code: 200,
      message: '성공',
      data: [
        {
          id: 1,
          title: '1차 정기모임',
          start: '2026-09-20T14:00:00',
          end: '2026-09-20T16:00:00',
          type: 'SESSION',
          cardinal: 7,
        },
      ],
    });
  }),

  http.get('/api/proxy/clubs/:clubId/schedules/:id', ({ params }) => {
    return HttpResponse.json({
      code: 200,
      message: '성공',
      data: {
        id: Number(params.id),
        type: 'SESSION',
        title: '1차 정기모임',
        start: '2026-09-20T14:00:00',
        end: '2026-09-20T16:00:00',
        creatorName: '홍길동',
        myAttendanceStatus: 'UPCOMING',
        totalAttendees: 5,
        attendees: [],
      },
    });
  }),
];
