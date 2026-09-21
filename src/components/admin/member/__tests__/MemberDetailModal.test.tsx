import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberDetailModal } from '@/components/admin/member/modal/MemberDetailModal';
import type { Member } from '@/types/admin/member';

function createMember(overrides: Partial<Member> = {}): Member {
  return {
    id: 'member-1',
    clubMemberId: 1,
    name: '김위드',
    email: 'weeth@weeth.kr',
    department: '컴퓨터공학과',
    cardinal: '12, 13',
    phone: '010-0000-0000',
    studentId: '20240001',
    position: '멤버',
    memberRole: 'USER',
    attendance: 3,
    absence: 1,
    attendanceRate: 75,
    penaltyCount: 0,
    status: 'ACTIVE',
    profileImageUrl: null,
    bio: null,
    joinedAt: null,
    ...overrides,
  };
}

function renderModal(props: Partial<React.ComponentProps<typeof MemberDetailModal>> = {}) {
  return render(
    <MemberDetailModal open onOpenChange={jest.fn()} member={createMember()} {...props} />,
  );
}

it('onChangePosition이 없으면 포지션 변경 버튼을 노출하지 않는다', () => {
  renderModal();

  expect(screen.queryByRole('button', { name: '포지션 변경' })).not.toBeInTheDocument();
});

it('포지션 변경 버튼을 누르면 onChangePosition을 호출한다', async () => {
  const user = userEvent.setup();
  const onChangePosition = jest.fn();
  renderModal({ onChangePosition });

  await user.click(screen.getByRole('button', { name: '포지션 변경' }));

  expect(onChangePosition).toHaveBeenCalledTimes(1);
});

it('포지션 변경 버튼을 유저 추방 앞에 배치한다', () => {
  renderModal({ onChangePosition: jest.fn(), onBan: jest.fn() });

  const labels = screen.getAllByRole('button').map((button) => button.textContent);

  expect(labels.indexOf('포지션 변경')).toBeLessThan(labels.indexOf('유저 추방'));
});
