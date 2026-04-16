import type { AdminSessionListData, SessionStatus } from '@/types/admin/session';

export const SESSION_STATUS_LABEL: Record<SessionStatus, string> = {
  OPEN: '진행 중',
  COMPLETED: '종료',
  SCHEDULED: '예정',
  CANCELED: '취소',
};

// API 연결 전 임시 목업 데이터 (API 연결 이슈에서 제거)
export const MOCK_SESSION_LIST: AdminSessionListData = {
  thisWeek: [],
  sessions: [
    {
      groupId: 1,
      title: '7기 정기모임',
      recurrenceType: 'WEEKLY',
      recurrenceDescription: '매주 목요일 오후 7:00 ~ 오후 9:00',
      startDate: '2026-06-25',
      endDate: '2026-06-30',
      completedCount: 3,
      totalCount: 20,
      status: 'OPEN',
      sessions: [
        {
          id: 11,
          cardinal: 7,
          title: '7기 정기모임',
          start: '2026-06-25T19:00:00',
          end: '2026-06-25T21:00:00',
          status: 'COMPLETED',
        },
        {
          id: 12,
          cardinal: 7,
          title: '7기 정기모임',
          start: '2026-06-26T19:00:00',
          end: '2026-06-26T21:00:00',
          status: 'OPEN',
        },
        {
          id: 13,
          cardinal: 7,
          title: '7기 정기모임',
          start: '2026-07-04T19:00:00',
          end: '2026-07-04T21:00:00',
          status: 'OPEN',
        },
      ],
    },
    {
      groupId: 2,
      title: '7기 스터디 세션',
      recurrenceType: 'NONE',
      recurrenceDescription: '',
      startDate: '2026-06-25',
      endDate: '2026-06-25',
      completedCount: 1,
      totalCount: 1,
      status: 'OPEN',
      sessions: [],
    },
    {
      groupId: 3,
      title: '7기 OT',
      recurrenceType: 'NONE',
      recurrenceDescription: '',
      startDate: '2026-06-25',
      endDate: '2026-06-25',
      completedCount: 1,
      totalCount: 1,
      status: 'COMPLETED',
      sessions: [],
    },
  ],
};
