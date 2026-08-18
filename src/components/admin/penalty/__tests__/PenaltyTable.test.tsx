import { render, screen } from '@testing-library/react';

import { PenaltyTable } from '@/components/admin/penalty/PenaltyTable';
import type { PenaltyMember } from '@/types/admin/penalty';

// 어드민 배럴은 tiptap(lowlight) ESM까지 끌고 와 jest에서 파싱에 실패하므로 필요한 것만 대체한다.
jest.mock('@/components/admin', () => ({
  MemberSelectionCheckbox: ({ ariaLabel }: { ariaLabel: string }) => (
    <button type="button" aria-label={ariaLabel} />
  ),
  MemberPagination: () => null,
}));

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

function renderTable(members: PenaltyMember[]) {
  return render(
    <PenaltyTable members={members} selectedIds={new Set()} onSelectionChange={() => {}} />,
  );
}

describe('PenaltyTable 자기소개 말줄임', () => {
  it('10자를 넘는 자기소개는 ...으로 말줄임해서 보여준다', () => {
    renderTable([createMember()]);

    expect(screen.getByText('안녕하세요 잘부탁드...')).toBeInTheDocument();
    expect(
      screen.queryByText('안녕하세요 잘부탁드리고 안녕하세요 잘부탁드립니다'),
    ).not.toBeInTheDocument();
  });

  it('10자 이하 자기소개는 그대로 보여준다', () => {
    renderTable([createMember({ introduction: '방가방가햄토리' })]);

    expect(screen.getByText('방가방가햄토리')).toBeInTheDocument();
  });
});
