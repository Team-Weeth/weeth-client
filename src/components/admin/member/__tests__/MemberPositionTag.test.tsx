import { render, screen } from '@testing-library/react';
import { MemberPositionTag } from '../MemberPositionTag';

it.each([
  ['primary', 'text-brand-primary', 'bg-brand-primary/10'],
  ['secondary', 'text-brand-secondary', 'bg-brand-secondary/10'],
  ['purple', 'text-brand-purple', 'bg-brand-purple/10'],
  ['pink', 'text-brand-pink', 'bg-brand-pink/10'],
  ['caution', 'text-state-caution', 'bg-state-caution/10'],
  ['error', 'text-state-error', 'bg-state-error/10'],
] as const)('%s 선택색을 같은 글자색과 10%% 배경의 태그로 매핑한다', (color, text, background) => {
  render(<MemberPositionTag color={color}>포지션</MemberPositionTag>);
  expect(screen.getByText('포지션')).toHaveClass(text, background);
});
