import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberDetailModal } from '@/components/admin/member/modal/MemberDetailModal';
import { TooltipProvider } from '@/components/ui/Tooltip';
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
    <TooltipProvider disableHoverableContent>
      <MemberDetailModal open onOpenChange={jest.fn()} member={createMember()} {...props} />
    </TooltipProvider>,
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

it('빈 문자열로 내려온 항목과 0은 구분해서 표시한다', () => {
  renderModal({
    member: createMember({ department: '', studentId: '   ', phone: '', absence: 0 }),
  });

  for (const label of ['학과', '학번', '전화번호']) {
    expect(screen.getByText(label).nextElementSibling).toHaveTextContent('-');
  }
  expect(screen.getByText('결석').nextElementSibling).toHaveTextContent('0');
});

it('활동기수 +N을 누르면 숨은 기수 툴팁을 열고 다시 누르면 닫는다', async () => {
  const user = userEvent.setup();
  renderModal({ member: createMember({ cardinal: '9, 10, 11, 12, 13' }) });

  const more = screen.getByRole('button', { name: '숨겨진 활동기수 9기' });
  await user.click(more);
  expect(await screen.findByRole('tooltip')).toHaveTextContent('9기');
  await user.click(more);
  await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
});

it('포지션 변경 버튼을 유저 추방 앞에 배치한다', () => {
  renderModal({ onChangePosition: jest.fn(), onBan: jest.fn() });

  const labels = screen.getAllByRole('button').map((button) => button.textContent);

  expect(labels.indexOf('포지션 변경')).toBeLessThan(labels.indexOf('유저 추방'));
});
