import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { EditSessionModalContent } from '@/components/admin/schedule/modal/EditSessionModalContent';

const mockSubmitUpdate = jest.fn();
const mockSubmitDeleteSession = jest.fn();
const mockSubmitDeleteGroup = jest.fn();

jest.mock('@/hooks/admin/useSessionMutations', () => ({
  useSessionMutations: () => ({
    submitUpdate: mockSubmitUpdate,
    submitDeleteSession: mockSubmitDeleteSession,
    submitDeleteGroup: mockSubmitDeleteGroup,
    submitCreate: jest.fn(),
    forceConfirmDialog: null,
  }),
}));

jest.mock('@/hooks/queries/admin/useAdminScheduleQueries', () => ({
  useAdminSessionDetail: () => ({
    data: {
      id: 1,
      title: '기존 세션 제목',
      content: '내용',
      location: '장소',
      start: '2026-06-10T10:00:00',
      end: '2026-06-10T12:00:00',
      type: 'SESSION',
      cardinal: 7,
      name: '',
      createdAt: '',
      modifiedAt: '',
    },
  }),
}));

// ScheduleFormBody를 경량 대체체로 모킹 — 제목 필드만 노출
jest.mock('@/components/admin/schedule/modal/ScheduleFormBody', () => ({
  ScheduleFormBody: ({
    form,
    onFormChange,
  }: {
    form: { title: string };
    onFormChange: (patch: { title: string }) => void;
  }) => (
    <input
      aria-label="세션 제목"
      value={form.title}
      onChange={(e) => onFormChange({ title: e.target.value })}
    />
  ),
}));

function createRefs() {
  return {
    hasChangesRef: React.createRef<boolean>() as React.RefObject<boolean>,
    requestCloseRef: React.createRef<(() => void) | null>() as React.RefObject<(() => void) | null>,
  };
}

function renderComponent(props: {
  sessionId?: number;
  isRecurring?: boolean;
  isChildOfRecurringGroup?: boolean;
  groupId?: number | null;
  onClose?: () => void;
}) {
  const { hasChangesRef, requestCloseRef } = createRefs();
  const onClose = props.onClose ?? jest.fn();

  render(
    <EditSessionModalContent
      sessionId={props.sessionId ?? 1}
      isRecurring={props.isRecurring ?? false}
      isChildOfRecurringGroup={props.isChildOfRecurringGroup}
      groupId={props.groupId ?? null}
      onClose={onClose}
      hasChangesRef={hasChangesRef}
      requestCloseRef={requestCloseRef}
    />,
  );

  return { onClose };
}

describe('EditSessionModalContent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('세션 수정 헤더와 저장/취소 버튼을 렌더링한다', () => {
    renderComponent({});

    expect(screen.getByText('세션 수정')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '저장' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '취소' })).toBeInTheDocument();
  });

  it('기존 세션 제목이 폼에 표시된다', () => {
    renderComponent({});

    expect(screen.getByDisplayValue('기존 세션 제목')).toBeInTheDocument();
  });

  it('변경 없이 취소 클릭 시 onClose를 즉시 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderComponent({ onClose });

    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('변경 없이 닫기 버튼 클릭 시 onClose를 즉시 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderComponent({ onClose });

    await user.click(screen.getByRole('button', { name: '닫기' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('비반복 세션 저장 시 단건 업데이트를 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderComponent({ isRecurring: false, onClose });

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(mockSubmitUpdate).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ title: '기존 세션 제목' }),
      'THIS_ONLY',
      false,
      expect.objectContaining({ onSuccess: onClose }),
    );
  });

  it('반복 세션 저장 시 범위 선택 다이얼로그를 표시한다', async () => {
    const user = userEvent.setup();
    renderComponent({ isRecurring: true });

    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(screen.getByText('이 변경사항을 어떻게 저장할까요?')).toBeInTheDocument();
  });

  it('삭제 메뉴를 클릭하면 삭제 확인 다이얼로그가 표시된다', async () => {
    const user = userEvent.setup();
    renderComponent({ isRecurring: false });

    await user.click(screen.getByRole('button', { name: '메뉴' }));
    await user.click(screen.getByText('세션 삭제'));

    expect(screen.getByText('해당 세션을 삭제하시겠어요?')).toBeInTheDocument();
  });

  it('비반복 단일 세션 삭제 확인 시 THIS_ONLY로 삭제한다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderComponent({ isRecurring: false, onClose });

    await user.click(screen.getByRole('button', { name: '메뉴' }));
    await user.click(screen.getByText('세션 삭제'));
    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(mockSubmitDeleteSession).toHaveBeenCalledWith(
      1,
      'THIS_ONLY',
      false,
      expect.objectContaining({ onSuccess: onClose }),
    );
  });

  it('반복 그룹 세션 삭제 확인 시 그룹 삭제를 호출한다', async () => {
    const user = userEvent.setup();
    const onClose = jest.fn();
    renderComponent({ isRecurring: true, isChildOfRecurringGroup: false, groupId: 10, onClose });

    await user.click(screen.getByRole('button', { name: '메뉴' }));
    await user.click(screen.getByText('세션 삭제'));
    await user.click(screen.getByRole('button', { name: '이후 모든 세션 일정 삭제' }));

    expect(mockSubmitDeleteGroup).toHaveBeenCalledWith(
      10,
      false,
      expect.objectContaining({ onSuccess: onClose }),
    );
  });
});
