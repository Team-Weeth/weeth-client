import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleItem } from '@/components/admin/schedule/general/ScheduleItem';
import type { Schedule } from '@/types/admin/schedule';

function createSchedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 1,
    title: '팀 회의',
    type: 'EVENT',
    start: '2026-06-20T10:00:00',
    end: '2026-06-20T12:00:00',
    location: '회의실 A',
    cardinal: 7,
    ...overrides,
  };
}

function renderItem(schedule: Schedule = createSchedule()) {
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  render(<ScheduleItem schedule={schedule} onEdit={onEdit} onDelete={onDelete} />);
  return { onEdit, onDelete, user: userEvent.setup({ advanceTimers: jest.advanceTimersByTime }) };
}

describe('ScheduleItem', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(2026, 5, 15, 9, 0)); // 2026-06-15
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('일정 제목·날짜·유형·장소를 표시한다', () => {
    renderItem();

    expect(screen.getByText('팀 회의')).toBeInTheDocument();
    expect(screen.getByText('20')).toBeInTheDocument();
    expect(screen.getByText('일반 일정')).toBeInTheDocument();
    expect(screen.getByText('회의실 A')).toBeInTheDocument();
  });

  it('장소가 없으면 장소 태그를 표시하지 않는다', () => {
    renderItem(createSchedule({ location: '' }));

    expect(screen.queryByText('회의실 A')).not.toBeInTheDocument();
  });

  it('수정을 누르면 onEdit을 호출한다', async () => {
    const { user, onEdit } = renderItem();

    await user.click(screen.getByRole('button', { name: '수정' }));

    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  describe('삭제', () => {
    it.each([
      ['일반 일정', createSchedule(), '해당 일반 일정을 삭제하시겠어요?'],
      [
        '오늘이 아닌 세션',
        createSchedule({ type: 'SESSION', start: '2026-06-20T19:00:00' }),
        '해당 세션을 삭제하시겠어요?',
      ],
    ])(
      '%s은 유형별 확인 문구를 띄우고, 확인하면 onDelete를 호출한다',
      async (_, schedule, title) => {
        const { user, onDelete } = renderItem(schedule);

        await user.click(screen.getByRole('button', { name: '삭제' }));
        expect(screen.getByRole('alertdialog', { name: title })).toBeInTheDocument();
        await user.click(screen.getByRole('button', { name: '삭제' }));

        expect(onDelete).toHaveBeenCalledTimes(1);
      },
    );

    it('출석 진행 중인 세션은 삭제 불가 안내만 띄우고 onDelete를 호출하지 않는다', async () => {
      const { user, onDelete } = renderItem(
        createSchedule({ type: 'SESSION', start: '2026-06-15T19:00:00' }),
      );

      await user.click(screen.getByRole('button', { name: '삭제' }));
      expect(
        screen.getByRole('alertdialog', { name: /출석 진행 중인 세션은\s*삭제 할 수 없어요\./ }),
      ).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: '확인' }));

      expect(onDelete).not.toHaveBeenCalled();
    });

    it('취소하면 onDelete를 호출하지 않는다', async () => {
      const { user, onDelete } = renderItem();

      await user.click(screen.getByRole('button', { name: '삭제' }));
      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(onDelete).not.toHaveBeenCalled();
    });
  });
});
