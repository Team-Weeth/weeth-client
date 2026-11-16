import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TourTooltip } from '@/components/tour/TourTooltip';

import type { TourTooltipProps } from '@/components/tour/TourTooltip';
import type { Controls, StepMerged } from 'react-joyride';

function buildButtonProps(label: string, onClick = jest.fn()) {
  return {
    'aria-label': label,
    'data-action': label,
    onClick,
    role: 'button',
    title: label,
  };
}

function buildTooltipProps(overrides: Partial<TourTooltipProps> = {}): TourTooltipProps {
  return {
    continuous: true,
    index: 0,
    isLastStep: false,
    size: 3,
    step: { title: '제목', content: '본문' } as unknown as StepMerged,
    backProps: buildButtonProps('이전'),
    closeProps: buildButtonProps('닫기'),
    controls: {} as unknown as Controls,
    primaryProps: buildButtonProps('다음'),
    skipProps: buildButtonProps('건너뛰기'),
    tooltipProps: { role: 'alertdialog', 'aria-modal': true },
    ...overrides,
  };
}

describe('TourTooltip', () => {
  it('제목과 본문을 렌더링한다', () => {
    render(<TourTooltip {...buildTooltipProps()} />);
    expect(screen.getByText('제목')).toBeInTheDocument();
    expect(screen.getByText('본문')).toBeInTheDocument();
  });

  it('스텝 카운터를 "index+1/size" 형태로 보여준다', () => {
    render(<TourTooltip {...buildTooltipProps({ index: 0, size: 3 })} />);
    expect(screen.getByText('1/3')).toBeInTheDocument();
  });

  it('마지막 스텝이 아니면 "다음" 버튼과 건너뛰기 버튼을 보여준다', () => {
    render(<TourTooltip {...buildTooltipProps({ isLastStep: false, size: 3 })} />);
    expect(screen.getByRole('button', { name: '다음' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '건너뛰기' })).toBeInTheDocument();
  });

  it('마지막 스텝이면 건너뛰기를 숨기고 "시작하기"를 보여준다', () => {
    render(
      <TourTooltip
        {...buildTooltipProps({ isLastStep: true, primaryProps: buildButtonProps('시작하기') })}
      />,
    );
    expect(screen.queryByRole('button', { name: '건너뛰기' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: '시작하기' })).toBeInTheDocument();
  });

  it('스텝이 1개뿐이면 건너뛰기를 숨긴다', () => {
    render(<TourTooltip {...buildTooltipProps({ size: 1, isLastStep: false })} />);
    expect(screen.queryByRole('button', { name: '건너뛰기' })).not.toBeInTheDocument();
  });

  it('"다음" 클릭 시 primaryProps.onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const handlePrimaryClick = jest.fn();
    render(
      <TourTooltip
        {...buildTooltipProps({ primaryProps: buildButtonProps('다음', handlePrimaryClick) })}
      />,
    );

    await user.click(screen.getByRole('button', { name: '다음' }));

    expect(handlePrimaryClick).toHaveBeenCalledTimes(1);
  });

  it('"건너뛰기" 클릭 시 skipProps.onClick이 호출된다', async () => {
    const user = userEvent.setup();
    const handleSkipClick = jest.fn();
    render(
      <TourTooltip
        {...buildTooltipProps({ skipProps: buildButtonProps('건너뛰기', handleSkipClick) })}
      />,
    );

    await user.click(screen.getByRole('button', { name: '건너뛰기' }));

    expect(handleSkipClick).toHaveBeenCalledTimes(1);
  });
});
