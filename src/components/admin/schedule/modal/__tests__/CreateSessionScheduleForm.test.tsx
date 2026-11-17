import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CreateSessionScheduleForm } from '@/components/admin/schedule/modal/CreateSessionScheduleForm';
import type { ScheduleFormState, SessionFormState } from '@/components/admin/schedule/modal/types';
import type { Cardinal } from '@/types/admin/cardinal';

jest.mock('@/hooks/queries', () => ({
  useCardinals: () => ({
    data: [
      { id: 1, cardinalNumber: 7 },
      { id: 2, cardinalNumber: 8 },
    ],
  }),
}));

interface CapturedSessionFormProps {
  form: ScheduleFormState;
  onFormChange: (patch: Partial<ScheduleFormState>) => void;
  session: SessionFormState;
  onSessionChange: (patch: Partial<SessionFormState>) => void;
  isRecurrenceEndValid: boolean;
  cardinals: Cardinal[];
  selectedCardinal: Cardinal | null | undefined;
}

let capturedProps: CapturedSessionFormProps | Record<string, never> = {};

jest.mock('@/components/admin/schedule/modal/SessionScheduleForm', () => ({
  SessionScheduleForm: (props: CapturedSessionFormProps) => {
    capturedProps = props;
    return (
      <div data-testid="session-form">
        <button
          type="button"
          data-testid="fill-valid-form"
          onClick={() => {
            props.onFormChange({
              title: '테스트 세션',
              startDate: '2026-06-01',
              startTime: '10:00',
              endDate: '2026-06-01',
              endTime: '12:00',
            });
            props.onSessionChange({ selectedCardinalId: 1 });
          }}
        />
        <button
          type="button"
          data-testid="set-recurrence"
          onClick={() => {
            props.onSessionChange({
              recurrenceType: 'WEEKLY',
              recurrenceEndDate: '2026-07-01',
            });
          }}
        />
      </div>
    );
  },
}));

describe('CreateSessionScheduleForm', () => {
  const defaultProps = {
    onCreateSession: jest.fn(),
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    capturedProps = {};
  });

  it('취소 및 저장 버튼을 렌더링한다', () => {
    render(<CreateSessionScheduleForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
  });

  it('초기 상태에서 저장 버튼이 비활성화된다', () => {
    render(<CreateSessionScheduleForm {...defaultProps} />);

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('취소 클릭 시 onClose가 호출된다', async () => {
    const user = userEvent.setup();
    render(<CreateSessionScheduleForm {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('유효한 폼 작성 후 저장 버튼이 활성화되고 제출할 수 있다', async () => {
    const user = userEvent.setup();
    render(<CreateSessionScheduleForm {...defaultProps} />);

    await user.click(screen.getByTestId('fill-valid-form'));

    const saveButton = screen.getByRole('button', { name: '저장' });
    expect(saveButton).not.toBeDisabled();

    await user.click(saveButton);

    expect(defaultProps.onCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        title: '테스트 세션',
        cardinal: 7,
        start: '2026-06-01T10:00:00',
        end: '2026-06-01T12:00:00',
        recurrenceType: null,
        recurrenceEndDate: null,
      }),
    );
    expect(defaultProps.onClose).toHaveBeenCalled();
  });

  it('반복 설정 시 recurrenceType과 recurrenceEndDate를 포함하여 제출한다', async () => {
    const user = userEvent.setup();
    render(<CreateSessionScheduleForm {...defaultProps} />);

    await user.click(screen.getByTestId('fill-valid-form'));
    await user.click(screen.getByTestId('set-recurrence'));

    const saveButton = screen.getByRole('button', { name: '저장' });
    await user.click(saveButton);

    expect(defaultProps.onCreateSession).toHaveBeenCalledWith(
      expect.objectContaining({
        recurrenceType: 'WEEKLY',
        recurrenceEndDate: '2026-07-01',
      }),
    );
  });

  it('SessionScheduleForm에 cardinals와 selectedCardinal을 전달한다', () => {
    render(<CreateSessionScheduleForm {...defaultProps} />);

    expect(capturedProps.cardinals).toEqual([
      { id: 1, cardinalNumber: 7 },
      { id: 2, cardinalNumber: 8 },
    ]);
    expect(capturedProps.selectedCardinal).toBeNull();
  });
});
