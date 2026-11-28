import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MobileDayScheduleList } from '@/components/calendar/MobileDayScheduleList';
import type { MobileDayScheduleListProps } from '@/components/calendar/MobileDayScheduleList';
import type { ScheduleDetail } from '@/types/calendar';

function createSchedule(overrides: Partial<ScheduleDetail> = {}): ScheduleDetail {
  return {
    id: 1,
    title: '팀 회의',
    type: 'EVENT',
    start: '2026-06-15T10:00:00',
    end: '2026-06-15T12:00:00',
    location: '회의실 A',
    ...overrides,
  };
}

function renderList(props: Partial<MobileDayScheduleListProps> = {}) {
  const onScheduleClick = jest.fn();
  const onScroll = jest.fn();
  render(
    <MobileDayScheduleList
      dateStr="2026-06-15"
      schedules={[]}
      hasScrolled={false}
      listRef={{ current: null }}
      onScroll={onScroll}
      onScheduleClick={onScheduleClick}
      {...props}
    />,
  );
  return { onScheduleClick, onScroll, user: userEvent.setup() };
}

describe('MobileDayScheduleList', () => {
  it('일정이 없으면 날짜 헤더, 0개, 빈 상태 문구를 표시한다', () => {
    renderList();

    expect(screen.getByText('6월 15일 (월)')).toBeInTheDocument();
    expect(screen.getByText('일정 0개')).toBeInTheDocument();
    expect(screen.getByText('등록된 일정이 없어요')).toBeInTheDocument();
  });

  it('일정이 있으면 개수와 목록을 표시하고 빈 상태 문구는 숨긴다', () => {
    renderList({
      schedules: [createSchedule(), createSchedule({ id: 2, title: '정기 세션', type: 'SESSION' })],
    });

    expect(screen.getByText('일정 2개')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /팀 회의/ })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /정기 세션/ })).toBeInTheDocument();
    expect(screen.queryByText('등록된 일정이 없어요')).not.toBeInTheDocument();
  });

  it('일정을 누르면 onScheduleClick에 일정을 넘긴다', async () => {
    const schedule = createSchedule();
    const { user, onScheduleClick } = renderList({ schedules: [schedule] });

    await user.click(screen.getByRole('button', { name: /팀 회의/ }));

    expect(onScheduleClick).toHaveBeenCalledWith(schedule);
  });

  it('listRef를 스크롤 목록 요소에 연결한다', () => {
    const listRef = { current: null as HTMLDivElement | null };
    renderList({ listRef, schedules: [createSchedule()] });

    expect(listRef.current).toContainElement(screen.getByRole('button', { name: /팀 회의/ }));
  });
});
