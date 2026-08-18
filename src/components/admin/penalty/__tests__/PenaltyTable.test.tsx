import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PenaltyTable } from '@/components/admin/penalty/PenaltyTable';
import { PENALTY_MEMBERS_PER_PAGE } from '@/constants/admin/penaltyTable.constants';
import type { PenaltyMember } from '@/types/admin/penalty';

function createMember(overrides: Partial<PenaltyMember> = {}): PenaltyMember {
  return {
    id: 'member-1',
    name: '김위드',
    introduction: '안녕하세요 잘부탁드리고 안녕하세요 잘부탁드립니다',
    position: '백엔드',
    department: '컴퓨터공학과',
    penaltyCount: 3,
    recentPenaltyAt: '2026-07-18',
    cardinal: '5',
    ...overrides,
  };
}

function createMembers(count: number) {
  return Array.from({ length: count }, (_, index) =>
    createMember({ id: `member-${index + 1}`, name: `멤버${index + 1}` }),
  );
}

function renderTable({
  members,
  selectedIds = new Set<string>(),
  onSelectionChange = jest.fn<void, [Set<string>]>(),
}: {
  members: PenaltyMember[];
  selectedIds?: Set<string>;
  onSelectionChange?: jest.Mock<void, [Set<string>]>;
}) {
  render(
    <PenaltyTable
      members={members}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
    />,
  );

  return { onSelectionChange };
}

describe('PenaltyTable', () => {
  it('멤버가 없으면 검색 결과 없음 메시지를 보여준다', () => {
    renderTable({ members: [] });

    expect(screen.getByText('검색 결과가 없습니다.')).toBeInTheDocument();
  });

  it('행을 클릭하면 해당 멤버 id를 선택 목록에 추가한다', async () => {
    const user = userEvent.setup();
    const { onSelectionChange } = renderTable({ members: [createMember()] });

    await user.click(screen.getByText('김위드'));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set(['member-1']));
  });

  it('이미 선택된 행을 클릭하면 선택을 해제한다', async () => {
    const user = userEvent.setup();
    const { onSelectionChange } = renderTable({
      members: [createMember()],
      selectedIds: new Set(['member-1']),
    });

    await user.click(screen.getByText('김위드'));

    expect(onSelectionChange).toHaveBeenCalledWith(new Set());
  });

  it('전체 선택 버튼은 현재 페이지의 멤버만 선택한다', async () => {
    const user = userEvent.setup();
    const members = createMembers(PENALTY_MEMBERS_PER_PAGE + 3);
    const { onSelectionChange } = renderTable({ members });

    await user.click(screen.getByRole('button', { name: '현재 페이지 멤버 전체 선택' }));

    const selected = onSelectionChange.mock.calls[0][0];
    expect(selected.size).toBe(PENALTY_MEMBERS_PER_PAGE);
    expect(selected.has('member-1')).toBe(true);
    expect(selected.has(`member-${PENALTY_MEMBERS_PER_PAGE + 1}`)).toBe(false);
  });

  it('페이지 크기를 넘는 멤버는 다음 페이지로 넘긴다', () => {
    renderTable({ members: createMembers(PENALTY_MEMBERS_PER_PAGE + 1) });

    expect(screen.getByText('멤버1')).toBeInTheDocument();
    expect(screen.queryByText(`멤버${PENALTY_MEMBERS_PER_PAGE + 1}`)).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: '2' })).toBeInTheDocument();
  });
});
