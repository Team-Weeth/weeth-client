import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CustomAlertDialog } from '@/components/alert/CustomAlertDialog';

const defaultProps = {
  open: true,
  onOpenChange: jest.fn(),
  title: '정말 삭제하시겠어요?',
  actionLabel: '삭제',
  onAction: jest.fn(),
};

describe('CustomAlertDialog', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('열린 상태에서 제목과 액션 버튼을 렌더링한다', () => {
    render(<CustomAlertDialog {...defaultProps} />);

    expect(screen.getByText('정말 삭제하시겠어요?')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '삭제' })).toBeInTheDocument();
  });

  it('닫힌 상태에서는 콘텐츠를 표시하지 않는다', () => {
    render(<CustomAlertDialog {...defaultProps} open={false} />);

    expect(screen.queryByText('정말 삭제하시겠어요?')).not.toBeInTheDocument();
  });

  it('description이 있으면 렌더링한다', () => {
    render(<CustomAlertDialog {...defaultProps} description="삭제된 항목은 복구할 수 없습니다." />);

    expect(screen.getByText('삭제된 항목은 복구할 수 없습니다.')).toBeInTheDocument();
  });

  it('description이 없으면 렌더링하지 않는다', () => {
    render(<CustomAlertDialog {...defaultProps} />);

    expect(screen.queryByRole('note')).not.toBeInTheDocument();
  });

  it('액션 버튼 클릭 시 onAction을 호출한다', async () => {
    const user = userEvent.setup();
    const onAction = jest.fn();
    render(<CustomAlertDialog {...defaultProps} onAction={onAction} />);

    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('cancelLabel이 있으면 취소 버튼을 렌더링한다', () => {
    render(<CustomAlertDialog {...defaultProps} cancelLabel="취소" />);

    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('취소 버튼 클릭 시 onCancel을 호출한다', async () => {
    const user = userEvent.setup();
    const onCancel = jest.fn();
    render(<CustomAlertDialog {...defaultProps} cancelLabel="취소" onCancel={onCancel} />);

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it('secondActionLabel이 있으면 두 번째 버튼을 렌더링한다', () => {
    render(
      <CustomAlertDialog
        {...defaultProps}
        secondActionLabel="이후 모두 삭제"
        onSecondAction={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: '이후 모두 삭제' })).toBeInTheDocument();
  });

  it('두 번째 액션 버튼 클릭 시 onSecondAction을 호출한다', async () => {
    const user = userEvent.setup();
    const onSecondAction = jest.fn();
    render(
      <CustomAlertDialog
        {...defaultProps}
        secondActionLabel="이후 모두 삭제"
        onSecondAction={onSecondAction}
      />,
    );

    await user.click(screen.getByRole('button', { name: '이후 모두 삭제' }));

    expect(onSecondAction).toHaveBeenCalledTimes(1);
  });

  it('children을 렌더링한다', () => {
    // 다이얼로그가 열려 있으면 focus trap이 외부 요소를 aria-hidden 처리하므로
    // closed 상태에서 children 렌더링을 검증한다
    render(
      <CustomAlertDialog {...defaultProps} open={false}>
        <button type="button">트리거</button>
      </CustomAlertDialog>,
    );

    expect(screen.getByRole('button', { name: '트리거' })).toBeInTheDocument();
  });

  it('title에 개행 문자가 있으면 렌더링된다', () => {
    render(<CustomAlertDialog {...defaultProps} title={'첫 번째 줄\n두 번째 줄'} />);

    // AlertDialogPrimitive.Title은 <h2>로 렌더링되므로 heading role로 조회
    const heading = screen.getByRole('heading');
    expect(heading.textContent).toBe('첫 번째 줄\n두 번째 줄');
  });
});
