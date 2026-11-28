import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScheduleDeleteAlertDialog } from '@/components/admin/schedule/modal/ScheduleDeleteAlertDialog';
import type { ScheduleDeleteAlertDialogProps } from '@/components/admin/schedule/modal/ScheduleDeleteAlertDialog';

function renderWithTrigger(props: Partial<ScheduleDeleteAlertDialogProps> = {}) {
  const onConfirm = jest.fn();
  render(
    <ScheduleDeleteAlertDialog
      trigger={<button type="button">삭제 열기</button>}
      onConfirm={onConfirm}
      {...props}
    />,
  );
  return { onConfirm };
}

async function openDialog() {
  const user = userEvent.setup();
  await user.click(screen.getByRole('button', { name: '삭제 열기' }));
  return user;
}

describe('ScheduleDeleteAlertDialog', () => {
  it('트리거를 누르기 전에는 다이얼로그가 보이지 않는다', () => {
    renderWithTrigger();

    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it.each([
    ['EVENT', '해당 일반 일정을 삭제하시겠어요?', '삭제된 일정은 복구가 불가능합니다.'],
    ['SESSION', '해당 세션을 삭제하시겠어요?', '삭제된 세션은 복구가 불가능합니다.'],
  ] as const)('%s 유형이면 유형별 문구를 표시한다', async (scheduleType, title, description) => {
    renderWithTrigger({ scheduleType });
    await openDialog();

    expect(screen.getByRole('alertdialog', { name: title })).toBeInTheDocument();
    expect(screen.getByText(description)).toBeInTheDocument();
  });

  it('유형을 지정하지 않으면 일반 일정 문구를 표시한다', async () => {
    renderWithTrigger();
    await openDialog();

    expect(screen.getByText('해당 일반 일정을 삭제하시겠어요?')).toBeInTheDocument();
  });

  it('title·description을 넘기면 기본 문구 대신 표시한다', async () => {
    renderWithTrigger({ title: '커스텀 제목', description: '커스텀 설명' });
    await openDialog();

    expect(screen.getByText('커스텀 제목')).toBeInTheDocument();
    expect(screen.getByText('커스텀 설명')).toBeInTheDocument();
  });

  it('삭제를 누르면 onConfirm을 호출하고 닫힌다', async () => {
    const { onConfirm } = renderWithTrigger();
    const user = await openDialog();

    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  it('취소를 누르면 onConfirm 없이 닫힌다', async () => {
    const { onConfirm } = renderWithTrigger();
    const user = await openDialog();

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
  });

  describe('출석 진행 중(inProgress)', () => {
    it('삭제 불가 안내와 확인 버튼만 표시한다', async () => {
      renderWithTrigger({ scheduleType: 'SESSION', inProgress: true });
      await openDialog();

      expect(
        screen.getByRole('alertdialog', { name: /출석 진행 중인 세션은\s*삭제 할 수 없어요\./ }),
      ).toBeInTheDocument();
      expect(screen.getByRole('button', { name: '확인' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: '취소' })).not.toBeInTheDocument();
    });

    it('확인을 누르면 onConfirm 없이 닫힌다', async () => {
      const { onConfirm } = renderWithTrigger({ scheduleType: 'SESSION', inProgress: true });
      const user = await openDialog();

      await user.click(screen.getByRole('button', { name: '확인' }));

      expect(onConfirm).not.toHaveBeenCalled();
      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });

  describe('제어 모드', () => {
    it('open이 true면 트리거 없이 표시된다', () => {
      render(<ScheduleDeleteAlertDialog open onOpenChange={jest.fn()} onConfirm={jest.fn()} />);

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });

    it('취소를 누르면 onOpenChange(false)를 호출한다', async () => {
      const user = userEvent.setup();
      const onOpenChange = jest.fn();
      render(<ScheduleDeleteAlertDialog open onOpenChange={onOpenChange} onConfirm={jest.fn()} />);

      await user.click(screen.getByRole('button', { name: '취소' }));

      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('open이 false면 표시되지 않는다', () => {
      render(
        <ScheduleDeleteAlertDialog open={false} onOpenChange={jest.fn()} onConfirm={jest.fn()} />,
      );

      expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    });
  });
});
