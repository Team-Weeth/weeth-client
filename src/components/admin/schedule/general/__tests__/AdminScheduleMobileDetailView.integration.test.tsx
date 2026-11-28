import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { AdminScheduleMobileDetailView } from '@/components/admin/schedule/general/AdminScheduleMobileDetailView';
import { createQueryClient, createWrapper } from '@/test-utils/query';
import type { Schedule } from '@/types/admin/schedule';

jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));
jest.mock('@/hooks/useIsTablet', () => ({ useIsTablet: () => false }));

const SCHEDULE: Schedule = {
  id: 3,
  title: '목록 제목',
  type: 'EVENT',
  start: '2026-06-01T10:00:00',
  end: '2026-06-01T12:00:00',
  location: '회의실 A',
  cardinal: 7,
};

function renderDetailView() {
  const onBack = jest.fn();
  const onEdit = jest.fn();
  const onDelete = jest.fn();
  render(
    <AdminScheduleMobileDetailView
      schedule={SCHEDULE}
      onBack={onBack}
      onEdit={onEdit}
      onDelete={onDelete}
    />,
    { wrapper: createWrapper(createQueryClient()) },
  );
  return { onBack, onEdit, onDelete, user: userEvent.setup() };
}

describe('AdminScheduleMobileDetailView (integration)', () => {
  beforeEach(() => {
    server.use(
      http.get('/api/proxy/clubs/:clubId/schedules/:id', ({ params }) =>
        HttpResponse.json({
          code: 200,
          message: '성공',
          data: {
            id: Number(params.id),
            type: 'EVENT',
            title: '상세 제목',
            start: '2026-06-01T10:00:00',
            end: '2026-06-01T12:00:00',
            location: '회의실 A',
            description: '상세 설명입니다',
            creatorName: '홍길동',
            totalAttendees: 1,
            attendees: [
              { name: '김철수', department: '컴퓨터공학과', profileImageUrl: null, role: 'USER' },
            ],
          },
        }),
      ),
    );
  });

  it('일정 상세 헤더와 상세 API 내용을 표시한다', async () => {
    renderDetailView();

    expect(screen.getByRole('heading', { name: '일정 상세' })).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: '상세 제목' })).toBeInTheDocument();
    expect(screen.getByText('홍길동')).toBeInTheDocument();
    expect(screen.getByText('상세 설명입니다')).toBeInTheDocument();
  });

  it('뒤로 가기를 누르면 onBack을 호출한다', async () => {
    const { user, onBack } = renderDetailView();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(onBack).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['수정', 'onEdit'],
    ['삭제', 'onDelete'],
  ] as const)('%s 버튼을 누르면 %s에 일정을 넘긴다', async (label, handler) => {
    const callbacks = renderDetailView();
    await screen.findByRole('heading', { name: '상세 제목' });

    await callbacks.user.click(screen.getByRole('button', { name: label }));

    expect(callbacks[handler]).toHaveBeenCalledWith(SCHEDULE);
  });

  it('참석자를 누르면 참석자 목록으로 바뀌고, 뒤로 가기로 상세에 돌아온다', async () => {
    const { user, onBack } = renderDetailView();
    await screen.findByRole('heading', { name: '상세 제목' });

    const attendeeRow = screen.getByText('참석자').parentElement as HTMLElement;
    await user.click(within(attendeeRow).getByRole('button'));

    expect(screen.getByRole('heading', { name: '참석자 목록' })).toBeInTheDocument();
    expect(screen.getByText('김철수')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: '수정' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '뒤로 가기' }));

    expect(screen.getByRole('heading', { name: '일정 상세' })).toBeInTheDocument();
    expect(onBack).not.toHaveBeenCalled();
  });
});
