import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdminScheduleMobileSearch } from '@/components/admin/schedule/general/AdminScheduleMobileSearch';
import type { ScheduleDetail } from '@/types/calendar';

function createSchedule(overrides: Partial<ScheduleDetail> = {}): ScheduleDetail {
  return {
    id: 1,
    title: '주간 회의',
    type: 'EVENT',
    start: '2026-06-01T10:00:00',
    end: '2026-06-01T12:00:00',
    location: '회의실 A',
    ...overrides,
  };
}

const SCHEDULES = [
  createSchedule(),
  createSchedule({ id: 2, title: '정기 세션', type: 'SESSION', location: '공학관 101호' }),
  createSchedule({ id: 3, title: '엠티', location: undefined }),
];

function renderSearch() {
  const onClose = jest.fn();
  const onScheduleClick = jest.fn();
  render(
    <AdminScheduleMobileSearch
      schedules={SCHEDULES}
      onClose={onClose}
      onScheduleClick={onScheduleClick}
    />,
  );
  return { onClose, onScheduleClick, user: userEvent.setup() };
}

describe('AdminScheduleMobileSearch', () => {
  it('열리면 검색 입력창에 포커스된다', () => {
    renderSearch();

    expect(screen.getByRole('textbox')).toHaveFocus();
    expect(screen.getByPlaceholderText('일정 검색')).toBeInTheDocument();
  });

  it('검색어가 없으면 결과를 표시하지 않는다', () => {
    renderSearch();

    expect(screen.queryByRole('button', { name: /주간 회의/ })).not.toBeInTheDocument();
    expect(screen.queryByText('검색 결과가 없습니다.')).not.toBeInTheDocument();
  });

  it.each([
    ['제목', '회의', /주간 회의/],
    ['장소', '공학관', /정기 세션/],
  ])('%s으로 검색하면 일치하는 일정만 표시한다', async (_, keyword, expected) => {
    const { user } = renderSearch();

    await user.type(screen.getByRole('textbox'), keyword);

    expect(screen.getByRole('button', { name: expected })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /엠티/ })).not.toBeInTheDocument();
  });

  it('대소문자·앞뒤 공백과 관계없이 검색한다', async () => {
    const { user } = renderSearch();

    await user.type(screen.getByRole('textbox'), '  주간  ');

    expect(screen.getByRole('button', { name: /주간 회의/ })).toBeInTheDocument();
  });

  it('장소가 없는 일정도 제목으로 검색된다', async () => {
    const { user } = renderSearch();

    await user.type(screen.getByRole('textbox'), '엠티');

    expect(screen.getByRole('button', { name: /엠티/ })).toBeInTheDocument();
  });

  it('일치하는 일정이 없으면 빈 결과 문구를 표시한다', async () => {
    const { user } = renderSearch();

    await user.type(screen.getByRole('textbox'), '없는 일정');

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('검색어 지우기를 누르면 입력과 결과가 비워진다', async () => {
    const { user } = renderSearch();
    await user.type(screen.getByRole('textbox'), '회의');

    await user.click(screen.getByRole('button', { name: '검색어 지우기' }));

    expect(screen.getByRole('textbox')).toHaveValue('');
    expect(screen.queryByRole('button', { name: /주간 회의/ })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '검색어 지우기' })).not.toBeInTheDocument();
  });

  it('검색 결과를 누르면 해당 일정으로 onScheduleClick을 호출한다', async () => {
    const { user, onScheduleClick } = renderSearch();
    await user.type(screen.getByRole('textbox'), '정기');

    await user.click(screen.getByRole('button', { name: /정기 세션/ }));

    expect(onScheduleClick).toHaveBeenCalledWith(expect.objectContaining({ id: 2 }));
  });

  it('취소를 누르면 onClose를 호출한다', async () => {
    const { user, onClose } = renderSearch();

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
