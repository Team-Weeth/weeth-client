import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DuesGenerationFilter } from '../DuesGenerationFilter';

it('마지막 수정자가 null이면 기본 프로필과 정보없음 툴팁을 표시한다', async () => {
  const user = userEvent.setup();
  render(
    <DuesGenerationFilter
      cardinals={[]}
      isNotRegistered={false}
      onSelect={jest.fn()}
      updaterProfile={{ modifiedAt: '2026-09-06T14:22:45', modifiedBy: null }}
    />,
  );
  const trigger = screen.getByRole('button', { name: '마지막 수정자' });
  expect(trigger.querySelector('[data-slot="avatar-fallback"]')).toBeInTheDocument();
  await user.hover(trigger);
  expect(await screen.findByRole('tooltip')).toHaveTextContent('정보없음');
});

it('수정자가 있으면 호버 시 이름을 표시한다', async () => {
  const user = userEvent.setup();
  render(
    <DuesGenerationFilter
      cardinals={[]}
      isNotRegistered={false}
      onSelect={jest.fn()}
      updaterProfile={{
        modifiedAt: '2026-09-06T14:22:45',
        modifiedBy: { userId: 1, name: '홍길동', profileImageUrl: null },
      }}
    />,
  );
  await user.hover(screen.getByRole('button', { name: '마지막 수정자' }));
  expect(await screen.findByRole('tooltip')).toHaveTextContent('홍길동');
});
