import { renderHook, waitFor } from '@testing-library/react';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { useAdminScheduleDetailQuery } from '@/hooks/queries/admin/useAdminScheduleDetailQuery';
import { useClubId } from '@/stores';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { Schedule } from '@/types/admin/schedule';

jest.mock('@/stores', () => ({
  useClubId: jest.fn(() => 'club-1'),
}));

const DETAIL_URL = '/api/proxy/clubs/:clubId/schedules/:id';

function createSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 3,
    title: '목록 제목',
    type: 'EVENT',
    start: '2026-06-01T10:00:00',
    end: '2026-06-01T12:00:00',
    location: '목록 장소',
    cardinal: 7,
    ...overrides,
  };
}

function renderDetailHook(schedule: Schedule) {
  return renderHook(() => useAdminScheduleDetailQuery(schedule), {
    wrapper: createWrapper(createQueryClient()),
  });
}

describe('useAdminScheduleDetailQuery', () => {
  beforeEach(() => {
    jest.mocked(useClubId).mockReturnValue('club-1');
    server.use(
      http.get(DETAIL_URL, ({ params, request }) =>
        HttpResponse.json({
          code: 200,
          message: '성공',
          data: {
            id: Number(params.id),
            type: new URL(request.url).searchParams.get('type'),
            title: '상세 제목',
            start: '2026-06-01T10:00:00',
            end: '2026-06-01T12:00:00',
            location: '상세 장소',
            description: '상세 설명',
            creatorName: '홍길동',
            totalAttendees: 2,
            attendees: [
              { name: '김철수', department: '컴퓨터공학과', profileImageUrl: null, role: 'USER' },
            ],
          },
        }),
      ),
    );
  });

  it('응답 전에는 목록 데이터로 상세를 채우고 로딩 상태다', () => {
    const { result } = renderDetailHook(createSchedule());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.detail.title).toBe('목록 제목');
    expect(result.current.detail.location).toBe('목록 장소');
  });

  it('응답을 받으면 주최자·참석자·설명이 포함된 상세로 바뀐다', async () => {
    const { result } = renderDetailHook(createSchedule());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.detail.title).toBe('상세 제목');
    expect(result.current.detail.description).toBe('상세 설명');
    expect(result.current.detail.host?.name).toBe('홍길동');
    expect(result.current.detail.attendeeCount).toBe(2);
    expect(result.current.detail.attendees?.[0]?.name).toBe('김철수');
    expect(result.current.clubId).toBe('club-1');
  });

  it('일정 유형을 type 쿼리로 전달한다', async () => {
    const { result } = renderDetailHook(createSchedule({ type: 'SESSION' }));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.detail.type).toBe('SESSION');
  });

  it('조회에 실패하면 목록 데이터로 대체한다', async () => {
    server.use(
      http.get(DETAIL_URL, () => HttpResponse.json({ message: '서버 오류' }, { status: 500 })),
    );
    const { result } = renderDetailHook(createSchedule());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.detail.title).toBe('목록 제목');
    expect(result.current.detail.host).toBeUndefined();
  });

  it('clubId가 없으면 조회하지 않고 목록 데이터를 쓴다', () => {
    jest.mocked(useClubId).mockReturnValue(null);
    const { result } = renderDetailHook(createSchedule());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.detail.title).toBe('목록 제목');
  });
});
