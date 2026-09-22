import { useState } from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemberPositionDropdown } from '../MemberPositionDropdown';
import type { MemberPositionOption } from '@/types/admin/memberPosition';

const POSITION_OPTIONS: MemberPositionOption[] = [
  { id: '1', name: '기획', color: 'purple' },
  { id: '2', name: '디자인', color: 'pink' },
  { id: '3', name: '프론트엔드', color: 'secondary' },
  { id: '4', name: '백엔드', color: 'primary' },
];

it('옵션이 없으면 옵션 없음과 추가하기를 표시한다', async () => {
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
});

it.each([
  ['pending', '불러오는 중'],
  ['error', '불러오지 못했어요'],
] as const)(
  '옵션을 아직 못 받아온 상태(%s)에서는 추가하기 대신 조회 상태를 보여준다',
  async (optionsStatus, label) => {
    const user = userEvent.setup();
    render(
      <MemberPositionDropdown
        memberName="김위드"
        value={POSITION_OPTIONS[0]}
        options={[]}
        optionsStatus={optionsStatus}
        onChange={jest.fn()}
        onAddPosition={jest.fn()}
      />,
    );
    // 옵션 목록과 무관하게 멤버가 들고 있는 포지션은 그대로 보여준다.
    const trigger = screen.getByRole('button', { name: '김위드 포지션: 기획' });

    await user.click(trigger);
    expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual([label]);
  },
);

function renderInScrollContainer() {
  render(
    <div data-admin>
      {/* jsdom은 overflow 단축 속성을 계산값으로 펼치지 않아 축별로 지정한다. */}
      <div data-testid="scroll-container" style={{ overflowX: 'auto', overflowY: 'auto' }}>
        <MemberPositionDropdown
          memberName="김위드"
          value={null}
          options={POSITION_OPTIONS}
          onChange={jest.fn()}
        />
      </div>
    </div>,
  );
  return screen.getByTestId('scroll-container');
}

it('표를 스크롤하는 컨테이너 밖에 목록을 띄운다', async () => {
  const user = userEvent.setup();
  // 스크롤 컨테이너 안에 띄우면 위로 뒤집혔을 때 컨테이너 경계에서 잘린다.
  const scrollContainer = renderInScrollContainer();

  await user.click(screen.getByRole('button'));
  expect(scrollContainer.contains(screen.getByRole('menu'))).toBe(false);
});

it('표를 스크롤하면 열려 있던 목록을 닫는다', async () => {
  const user = userEvent.setup();
  const scrollContainer = renderInScrollContainer();

  await user.click(screen.getByRole('button'));
  expect(screen.getByRole('menu')).toBeInTheDocument();

  await act(async () => {
    scrollContainer.dispatchEvent(new Event('scroll'));
  });

  await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
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
          value={selected}
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
