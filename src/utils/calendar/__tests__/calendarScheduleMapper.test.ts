import { toBaseUiSchedule, toUiScheduleDetail } from '@/utils/calendar/calendarScheduleMapper';
import type { ScheduleDetail, ScheduleItem } from '@/types/api/schedule';

jest.mock('@/utils/shared/date', () => ({
  computeDDay: jest.fn().mockReturnValue(3),
}));

function mockScheduleItem(overrides?: Partial<ScheduleItem>): ScheduleItem {
  return {
    id: 1,
    title: '1차 정기모임',
    start: '2026-09-20T14:00:00',
    end: '2026-09-20T16:00:00',
    type: 'SESSION',
    cardinal: 7,
    ...overrides,
  };
}

function mockScheduleDetail(overrides?: Partial<ScheduleDetail>): ScheduleDetail {
  return {
    id: 1,
    title: '1차 정기모임',
    start: '2026-09-20T14:00:00',
    end: '2026-09-20T16:00:00',
    type: 'SESSION',
    ...overrides,
  };
}

describe('toBaseUiSchedule', () => {
  it('id, title, start, end, type, location을 그대로 매핑한다', () => {
    const result = toBaseUiSchedule(mockScheduleItem({ location: '가천대 체육관' }));

    expect(result.id).toBe(1);
    expect(result.title).toBe('1차 정기모임');
    expect(result.start).toBe('2026-09-20T14:00:00');
    expect(result.end).toBe('2026-09-20T16:00:00');
    expect(result.type).toBe('SESSION');
    expect(result.location).toBe('가천대 체육관');
  });

  it('start를 computeDDay에 전달하고 반환값을 dDay에 할당한다', () => {
    const { computeDDay } = jest.requireMock('@/utils/shared/date') as { computeDDay: jest.Mock };
    computeDDay.mockReturnValue(5);

    const result = toBaseUiSchedule(mockScheduleItem());

    expect(computeDDay).toHaveBeenCalledWith('2026-09-20T14:00:00');
    expect(result.dDay).toBe(5);
  });
});

describe('toUiScheduleDetail', () => {
  it('기본 필드와 clubId를 매핑한다', () => {
    const result = toUiScheduleDetail(mockScheduleDetail(), 'club-123');

    expect(result.id).toBe(1);
    expect(result.title).toBe('1차 정기모임');
    expect(result.type).toBe('SESSION');
    expect(result.clubId).toBe('club-123');
  });

  it('creatorName이 있으면 host.name으로 매핑한다', () => {
    const result = toUiScheduleDetail(mockScheduleDetail({ creatorName: '홍길동' }), null);

    expect(result.host).toEqual({ name: '홍길동' });
  });

  it('creatorName이 없으면 host는 undefined다', () => {
    const result = toUiScheduleDetail(mockScheduleDetail({ creatorName: undefined }), null);

    expect(result.host).toBeUndefined();
  });

  it.each([
    ['LEAD', '리더'],
    ['ADMIN', '운영진'],
    ['USER', '부원'],
  ] as const)('attendees role %s → position "%s"으로 변환한다', (role, label) => {
    const result = toUiScheduleDetail(
      mockScheduleDetail({ attendees: [{ name: '테스트', role }] }),
      null,
    );

    expect(result.attendees?.[0].position).toBe(label);
  });

  it('ROLE_LABEL에 없는 role은 원래 문자열을 그대로 사용한다', () => {
    const result = toUiScheduleDetail(
      mockScheduleDetail({
        attendees: [{ name: '테스트', role: 'UNKNOWN' as unknown as NonNullable<ScheduleDetail['attendees']>[number]['role'] }],
      }),
      null,
    );

    expect(result.attendees?.[0].position).toBe('UNKNOWN');
  });

  it('SESSION + myAttendanceStatus 있음 → hasAttendanceCheck=true', () => {
    const result = toUiScheduleDetail(
      mockScheduleDetail({ type: 'SESSION', myAttendanceStatus: 'UPCOMING' }),
      null,
    );

    expect(result.hasAttendanceCheck).toBe(true);
  });

  it('EVENT → hasAttendanceCheck=false', () => {
    const result = toUiScheduleDetail(mockScheduleDetail({ type: 'EVENT' }), null);

    expect(result.hasAttendanceCheck).toBe(false);
  });

  it('SESSION + myAttendanceStatus 없음 → hasAttendanceCheck=false', () => {
    const result = toUiScheduleDetail(
      mockScheduleDetail({ type: 'SESSION', myAttendanceStatus: undefined }),
      null,
    );

    expect(result.hasAttendanceCheck).toBe(false);
  });

  it('totalAttendees가 있으면 showAttendeeCount=true이고 attendeeCount에 매핑된다', () => {
    const result = toUiScheduleDetail(mockScheduleDetail({ totalAttendees: 10 }), null);

    expect(result.showAttendeeCount).toBe(true);
    expect(result.attendeeCount).toBe(10);
  });

  it('totalAttendees가 없으면 showAttendeeCount=false다', () => {
    const result = toUiScheduleDetail(mockScheduleDetail({ totalAttendees: undefined }), null);

    expect(result.showAttendeeCount).toBe(false);
  });

  it('myAttendanceStatus가 없으면 attendanceStatus는 undefined다', () => {
    const result = toUiScheduleDetail(
      mockScheduleDetail({ myAttendanceStatus: undefined }),
      null,
    );

    expect(result.attendanceStatus).toBeUndefined();
  });

  it('attendedAt이 있으면 attendanceCompletedAt으로 매핑한다', () => {
    const result = toUiScheduleDetail(
      mockScheduleDetail({ attendedAt: '2026-09-20T14:05:00' }),
      null,
    );

    expect(result.attendanceCompletedAt).toBe('2026-09-20T14:05:00');
  });

  it('api.attendees가 없으면 result.attendees는 undefined다', () => {
    const result = toUiScheduleDetail(mockScheduleDetail({ attendees: undefined }), null);

    expect(result.attendees).toBeUndefined();
  });

  it('attendees의 profileImageUrl → imageUrl, department를 그대로 매핑한다', () => {
    const result = toUiScheduleDetail(
      mockScheduleDetail({
        attendees: [
          {
            name: '홍길동',
            role: 'USER',
            profileImageUrl: 'https://img.com/1.jpg',
            department: '컴퓨터공학과',
          },
        ],
      }),
      null,
    );

    expect(result.attendees?.[0].imageUrl).toBe('https://img.com/1.jpg');
    expect(result.attendees?.[0].department).toBe('컴퓨터공학과');
    expect(result.attendees?.[0].name).toBe('홍길동');
  });
});
