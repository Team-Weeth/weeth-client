import { http, HttpResponse } from 'msw';

// 어드민 월간 이벤트 목록 (Schedule[])
const mockEventList = [
  {
    id: 1,
    title: '1차 MT',
    type: 'EVENT',
    start: '2026-11-22T10:00:00',
    end: '2026-11-23T18:00:00',
    location: '강원도 강릉',
    cardinal: 9,
  },
  {
    id: 2,
    title: '종강 파티',
    type: 'EVENT',
    start: '2026-12-20T18:00:00',
    end: '2026-12-20T21:00:00',
    location: '홍대 레스토랑',
    cardinal: 9,
  },
];

// 어드민 세션 목록 (AdminSessionListData)
const mockSessionListData = {
  thisWeek: [
    {
      id: 11,
      cardinal: 9,
      title: '2차 정기모임',
      start: '2026-11-14T19:00:00',
      end: '2026-11-14T21:00:00',
      status: 'OPEN',
    },
  ],
  sessions: [
    {
      groupId: 101,
      title: '정기모임',
      recurrenceType: 'WEEKLY',
      recurrenceDescription: '매주 금요일 오후 7:00 ~ 오후 9:00',
      startDate: '2026-11-07',
      endDate: '2026-12-19',
      completedCount: 1,
      totalCount: 7,
      status: 'OPEN',
      sessions: [
        {
          id: 10,
          cardinal: 9,
          title: '1차 정기모임',
          start: '2026-11-07T19:00:00',
          end: '2026-11-07T21:00:00',
          status: 'COMPLETED',
        },
        {
          id: 11,
          cardinal: 9,
          title: '2차 정기모임',
          start: '2026-11-14T19:00:00',
          end: '2026-11-14T21:00:00',
          status: 'OPEN',
        },
        {
          id: 12,
          cardinal: 9,
          title: '3차 정기모임',
          start: '2026-11-21T19:00:00',
          end: '2026-11-21T21:00:00',
          status: 'SCHEDULED',
        },
      ],
    },
  ],
};

// 이벤트 상세 (ScheduleDetail)
// TODO: 어드민 전용 상세 API 제공 시 이 핸들러를 admin 경로로 교체해야 한다.
const mockEventDetail = {
  id: 1,
  title: '1차 MT',
  type: 'EVENT',
  start: '2026-11-22T10:00:00',
  end: '2026-11-23T18:00:00',
  location: '강원도 강릉',
  cardinal: 9,
  content: '전체 MT 행사입니다.\n준비물: 여벌 옷, 세면도구, 개인 컵',
  name: '김민준',
  createdAt: '2026-11-01T12:00:00',
  modifiedAt: '2026-11-01T12:00:00',
};

// 세션 상세 (ScheduleDetail)
// TODO: 어드민 전용 상세 API 제공 시 이 핸들러를 admin 경로로 교체해야 한다.
const mockSessionDetail = {
  id: 11,
  title: '2차 정기모임',
  type: 'SESSION',
  start: '2026-11-14T19:00:00',
  end: '2026-11-14T21:00:00',
  location: '공학관 302호',
  cardinal: 9,
  content: 'React Query 심화 발표 세션입니다.\n발표자: 이지은',
  name: '이지은',
  createdAt: '2026-10-20T10:00:00',
  modifiedAt: '2026-10-20T10:00:00',
};

export const adminScheduleHandlers = [
  // 월간 이벤트 목록
  http.get('/api/proxy/admin/clubs/:clubId/events', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: mockEventList });
  }),

  // 세션 목록
  http.get('/api/proxy/admin/clubs/:clubId/sessions', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: mockSessionListData });
  }),

  // 이벤트 상세 (유저 경로 — TODO: admin 전용 API로 교체 예정)
  http.get('/api/proxy/clubs/:clubId/events/:eventId', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: mockEventDetail });
  }),

  // 세션 상세 (유저 경로 — TODO: admin 전용 API로 교체 예정)
  http.get('/api/proxy/clubs/:clubId/sessions/:sessionId', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: mockSessionDetail });
  }),

  // 이벤트 생성
  http.post('/api/proxy/admin/clubs/:clubId/events', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: null }, { status: 200 });
  }),

  // 이벤트 수정
  http.patch('/api/proxy/admin/clubs/:clubId/events/:eventId', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: null }, { status: 200 });
  }),

  // 이벤트 삭제
  http.delete('/api/proxy/admin/clubs/:clubId/events/:eventId', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: null }, { status: 200 });
  }),

  // 세션 생성
  http.post('/api/proxy/admin/clubs/:clubId/sessions', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: null }, { status: 200 });
  }),

  // 세션 수정
  http.patch('/api/proxy/admin/clubs/:clubId/sessions/:sessionId', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: null }, { status: 200 });
  }),

  // 세션 삭제
  http.delete('/api/proxy/admin/clubs/:clubId/sessions/:sessionId', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: null }, { status: 200 });
  }),

  // 세션 그룹 삭제
  http.delete('/api/proxy/admin/clubs/:clubId/sessions/groups/:groupId', () => {
    return HttpResponse.json({ code: 200, message: '성공', data: null }, { status: 200 });
  }),
];
