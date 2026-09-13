import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PenaltyDetailModal } from '@/components/admin/penalty';
import type { PenaltyMember, PenaltyRecord } from '@/types/admin/penalty';

function createMember(): PenaltyMember {
  return {
    id: 'member-1',
    clubMemberId: 1,
    name: '김위드',
    introduction: '열심히 활동하겠습니다',
    position: '백엔드',
    department: '컴퓨터공학과',
    penaltyCount: 1,
    recentPenaltyAt: '2026-07-18',
    cardinal: '4, 3',
    status: 'ACTIVE',
    profileImageUrl: null,
  };
}

function createRecord(): PenaltyRecord {
  return {
    id: 1,
    type: 'PENALTY',
    score: 1,
    reason: '정기 모임 무단 결석',
    createdAt: '2026-07-18',
  };
}

function renderModal({ onDeleteRecord = jest.fn() }: { onDeleteRecord?: jest.Mock } = {}) {
  render(
    <PenaltyDetailModal
      open
      onOpenChange={jest.fn()}
      member={createMember()}
      records={[createRecord()]}
      onDeleteRecord={onDeleteRecord}
    />,
  );

  return { onDeleteRecord };
}

describe('PenaltyDetailModal', () => {
  it('멤버 요약과 활동기수 태그를 보여준다', () => {
    renderModal();

    expect(screen.getByText('김위드')).toBeInTheDocument();
    expect(screen.getByText('4기')).toBeInTheDocument();
    expect(screen.getByText('3기')).toBeInTheDocument();
    expect(screen.getByText('열심히 활동하겠습니다')).toBeInTheDocument();
  });

  it('삭제를 누르면 바로 삭제하지 않고 확인 알럿을 띄운다', async () => {
    const user = userEvent.setup();
    const { onDeleteRecord } = renderModal();

    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(screen.getByText('페널티 기록을 삭제하시겠어요?')).toBeInTheDocument();
    expect(onDeleteRecord).not.toHaveBeenCalled();
  });

  it('알럿에서 삭제를 확인하면 해당 내역을 전달한다', async () => {
    const user = userEvent.setup();
    const { onDeleteRecord } = renderModal();

    await user.click(screen.getByRole('button', { name: '삭제' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: '삭제' }));

    expect(onDeleteRecord).toHaveBeenCalledWith(createRecord());
  });

  it('알럿에서 취소하면 삭제하지 않는다', async () => {
    const user = userEvent.setup();
    const { onDeleteRecord } = renderModal();

    await user.click(screen.getByRole('button', { name: '삭제' }));
    await user.click(within(screen.getByRole('alertdialog')).getByRole('button', { name: '취소' }));

    expect(onDeleteRecord).not.toHaveBeenCalled();
    expect(screen.queryByText('페널티 기록을 삭제하시겠어요?')).not.toBeInTheDocument();
  });
});
