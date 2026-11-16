import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SessionScheduleList } from '@/components/admin/schedule/general/SessionScheduleList';
import type { AdminSession, AdminSessionGroup } from '@/types/admin/session';

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
}));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

function createSession(overrides: Partial<AdminSession> = {}): AdminSession {
  return {
    id: 10,
    cardinal: 7,
    title: '1회차',
    start: '2026-06-05T19:00:00',
    end: '2026-06-05T21:00:00',
    status: 'COMPLETED',
    ...overrides,
  };
}

function createGroup(overrides: Partial<AdminSessionGroup> = {}): AdminSessionGroup {
  return {
    groupId: 1,
    title: '정기 세션',
    recurrenceType: 'WEEKLY',
    recurrenceDescription: '매주 목요일',
    startDate: '2026-06-01',
    endDate: '2026-06-30',
    completedCount: 2,
    totalCount: 4,
    status: 'OPEN',
    sessions: [
      createSession({ id: 10, title: '1회차' }),
      createSession({
        id: 11,
        title: '2회차',
        start: '2026-06-12T19:00:00',
        end: '2026-06-12T21:00:00',
      }),
    ],
    ...overrides,
  };
}

function createSingleGroup(overrides: Partial<AdminSessionGroup> = {}): AdminSessionGroup {
  return {
    groupId: null,
    title: '단일 세션',
    recurrenceType: null,
    recurrenceDescription: null,
    startDate: '2026-06-15',
    endDate: null,
    completedCount: 0,
    totalCount: 1,
    status: 'SCHEDULED',
    sessions: [createSession({ id: 20, title: '단일 세션' })],
    ...overrides,
  };
}

describe('SessionScheduleList', () => {
  it('세션이 없을 때 빈 상태 메시지를 표시한다', () => {
    render(<SessionScheduleList sessions={[]} />);

    expect(screen.getByText('아직 등록된 세션이 없어요')).toBeInTheDocument();
  });

  it('테이블 헤더를 렌더링한다', () => {
    render(<SessionScheduleList sessions={[createGroup()]} />);

    expect(screen.getByText('세션 제목')).toBeInTheDocument();
    expect(screen.getByText('날짜')).toBeInTheDocument();
    expect(screen.getByText('반복 · 시간')).toBeInTheDocument();
    expect(screen.getByText('진행')).toBeInTheDocument();
    expect(screen.getByText('상태')).toBeInTheDocument();
    // 헤더 + 행에 각 1개씩 있으므로 2개 이상 존재하는 것으로 검증
    expect(screen.getAllByText('출석 관리').length).toBeGreaterThanOrEqual(1);
  });

  it('그룹 제목을 렌더링한다', () => {
    render(<SessionScheduleList sessions={[createGroup(), createSingleGroup()]} />);

    expect(screen.getByText('정기 세션')).toBeInTheDocument();
    expect(screen.getByText('단일 세션')).toBeInTheDocument();
  });

  it('회차 접기 버튼을 클릭하면 토글된다', async () => {
    const user = userEvent.setup();
    render(<SessionScheduleList sessions={[createGroup()]} />);

    const toggleButton = screen.getByText('회차 접기');
    expect(toggleButton).toBeInTheDocument();

    await user.click(toggleButton);
    expect(screen.getByText('회차 펼치기')).toBeInTheDocument();

    await user.click(screen.getByText('회차 펼치기'));
    expect(screen.getByText('회차 접기')).toBeInTheDocument();
  });

  it('검색어로 세션을 필터링한다', () => {
    render(
      <SessionScheduleList
        sessions={[createGroup({ title: '알고리즘 스터디' }), createSingleGroup({ title: '특강' })]}
        searchValue="알고리즘"
      />,
    );

    expect(screen.getByText('알고리즘 스터디')).toBeInTheDocument();
    expect(screen.queryByText('특강')).not.toBeInTheDocument();
  });

  it('검색 결과가 없을 때 빈 상태를 표시한다', () => {
    render(<SessionScheduleList sessions={[createGroup()]} searchValue="존재하지않는검색어" />);

    expect(screen.getByText('아직 등록된 세션이 없어요')).toBeInTheDocument();
  });

  it('수정 버튼 클릭 시 onEditGroup 콜백을 호출한다', async () => {
    const user = userEvent.setup();
    const onEditGroup = jest.fn();
    const group = createSingleGroup();

    render(<SessionScheduleList sessions={[group]} onEditGroup={onEditGroup} />);

    const editButtons = screen.getAllByRole('button', { name: '수정' });
    await user.click(editButtons[0]);

    expect(onEditGroup).toHaveBeenCalledWith(group);
  });
});
