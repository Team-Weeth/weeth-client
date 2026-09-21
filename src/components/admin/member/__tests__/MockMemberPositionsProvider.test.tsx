jest.mock('@/hooks/useMediaQuery', () => ({ useMediaQuery: jest.fn(() => false) }));

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {
  MockMemberPositionsProvider,
  useMockMemberPositions,
} from '../MockMemberPositionsProvider';
import { MemberPositionDropdown } from '../MemberPositionDropdown';
import { MOCK_MEMBER_POSITIONS } from '@/mocks/memberPositions';

function TableSelection() {
  const { getPositionId, setPosition } = useMockMemberPositions();
  return (
    <MemberPositionDropdown
      memberName="김위드"
      value={getPositionId('1')}
      options={MOCK_MEMBER_POSITIONS}
      onChange={(value) => setPosition('1', value)}
    />
  );
}

function DetailPosition() {
  const { getPositionId } = useMockMemberPositions();
  return (
    <output data-testid="detail-position">
      {MOCK_MEMBER_POSITIONS.find((option) => option.id === getPositionId('1'))?.name ?? '미지정'}
    </output>
  );
}

it('테이블의 선택과 지정 해제를 상세에서 공유한다', async () => {
  const user = userEvent.setup();
  render(
    <MockMemberPositionsProvider>
      <TableSelection />
      <DetailPosition />
    </MockMemberPositionsProvider>,
  );
  await user.click(screen.getByRole('button'));
  await user.click(screen.getByRole('menuitem', { name: '프론트엔드' }));
  expect(screen.getByTestId('detail-position')).toHaveTextContent('프론트엔드');
  await user.click(screen.getByRole('button'));
  await user.click(screen.getByRole('menuitem', { name: '지정 해제' }));
  expect(screen.getByTestId('detail-position')).toHaveTextContent('미지정');
});
