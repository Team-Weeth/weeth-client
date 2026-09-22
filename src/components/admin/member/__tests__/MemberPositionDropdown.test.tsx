import { useState } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberPositionDropdown } from '../MemberPositionDropdown';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

jest.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: jest.fn(() => false) }));

const POSITION_OPTIONS: MemberPositionOption[] = [
  { id: '1', name: '기획', color: 'purple' },
  { id: '2', name: '디자인', color: 'pink' },
  { id: '3', name: '프론트엔드', color: 'secondary' },
  { id: '4', name: '백엔드', color: 'primary' },
];

it.each([true, false])(
  '옵션이 없으면 옵션 없음과 추가하기를 표시한다 (모바일: %s)',
  async (isMobile) => {
    jest.mocked(useMediaQuery).mockReturnValue(isMobile);
    const user = userEvent.setup();
    const onChange = jest.fn();
    const onAddPosition = jest.fn();
    render(
      <MemberPositionDropdown
        memberName="김위드"
        value={null}
        options={[]}
        onChange={onChange}
        onAddPosition={onAddPosition}
      />,
    );
    const trigger = screen.getByRole('button', { name: '김위드 포지션: 미지정' });
    await user.click(trigger);
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([
      '옵션 없음',
      '추가하기',
    ]);
    expect(screen.getByRole('separator').previousElementSibling).toHaveTextContent('옵션 없음');
    expect(screen.getByRole('separator').nextElementSibling).toHaveTextContent('추가하기');
    await user.click(screen.getByRole('menuitem', { name: '옵션 없음' }));
    expect(onChange).not.toHaveBeenCalled();
    await user.click(screen.getByRole('menuitem', { name: '추가하기' }));
    expect(onAddPosition).toHaveBeenCalledTimes(1);
  },
);

it.each([true, false])('모바일 여부(%s)에 맞는 레이어에 목록을 렌더링한다', async (isMobile) => {
  jest.mocked(useMediaQuery).mockReturnValue(isMobile);
  const user = userEvent.setup();
  render(
    <div data-admin data-testid="admin-layout">
      <MemberPositionDropdown
        memberName="김위드"
        value={null}
        options={POSITION_OPTIONS}
        onChange={jest.fn()}
      />
    </div>,
  );
  await user.click(screen.getByRole('button'));
  expect(screen.getByTestId('admin-layout').contains(screen.getByRole('menu'))).toBe(isMobile);
});

it('포지션 선택과 지정 해제를 처리하며 부모의 멤버 클릭 동작을 실행하지 않는다', async () => {
  const user = userEvent.setup();
  const onMemberClick = jest.fn();
  function TestDropdown() {
    const [selected, setSelected] = useState<MemberPositionOption | null>(null);
    return (
      <div onClick={onMemberClick}>
        <MemberPositionDropdown
          memberName="김위드"
          value={selected?.id ?? null}
          options={POSITION_OPTIONS}
          onChange={setSelected}
        />
      </div>
    );
  }
  render(<TestDropdown />);
  await user.click(screen.getByRole('button', { name: '김위드 포지션: 미지정' }));
  expect(screen.getAllByRole('menuitem')).toHaveLength(5);
  expect(screen.getByRole('separator')).toBeInTheDocument();
  await user.click(screen.getByRole('menuitem', { name: '기획' }));
  await user.click(screen.getByRole('button', { name: '김위드 포지션: 기획' }));
  expect(screen.getByRole('menuitem', { name: '기획' })).toHaveAttribute('aria-current', 'true');
  await user.click(screen.getByRole('menuitem', { name: '지정 해제' }));
  expect(screen.getByRole('button', { name: '김위드 포지션: 미지정' })).toBeInTheDocument();
  expect(onMemberClick).not.toHaveBeenCalled();
});
