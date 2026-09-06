import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PenaltyRecordTable } from '@/components/admin/penalty';
import type { PenaltyRecord } from '@/types/admin/penalty';

function createRecord(overrides: Partial<PenaltyRecord> = {}): PenaltyRecord {
  return {
    id: 'record-1',
    memberId: 'member-1',
    type: 'PENALTY',
    score: 1,
    reason: '정기 모임 무단 결석',
    createdAt: '2026-07-18',
    ...overrides,
  };
}

function renderTable({
  records,
  onUpdate = jest.fn(),
  onDelete = jest.fn(),
}: {
  records: PenaltyRecord[];
  onUpdate?: jest.Mock;
  onDelete?: jest.Mock;
}) {
  render(<PenaltyRecordTable records={records} onUpdate={onUpdate} onDelete={onDelete} />);

  return { onUpdate, onDelete };
}

describe('PenaltyRecordTable', () => {
  it('내역이 없으면 안내 문구를 보여준다', () => {
    renderTable({ records: [] });

    expect(screen.getByText('등록된 페널티 내역이 없습니다.')).toBeInTheDocument();
  });

  it('수정을 누르면 해당 행이 현재 값을 담은 입력으로 바뀐다', async () => {
    const user = userEvent.setup();
    renderTable({ records: [createRecord()] });

    await user.click(screen.getByRole('button', { name: '수정' }));

    expect(screen.getByLabelText('페널티 사유')).toHaveValue('정기 모임 무단 결석');
    expect(screen.getByLabelText('페널티 점수')).toHaveValue('1');
    expect(screen.queryByRole('button', { name: '삭제' })).not.toBeInTheDocument();
  });

  it('값을 바꾸고 저장하면 수정된 값을 전달한다', async () => {
    const user = userEvent.setup();
    const record = createRecord();
    const { onUpdate } = renderTable({ records: [record] });

    await user.click(screen.getByRole('button', { name: '수정' }));
    await user.clear(screen.getByLabelText('페널티 사유'));
    await user.type(screen.getByLabelText('페널티 사유'), '스터디 과제 미제출');
    await user.click(screen.getByRole('button', { name: '값 올리기' }));
    await user.click(screen.getByRole('button', { name: '저장' }));

    expect(onUpdate).toHaveBeenCalledWith(record, { reason: '스터디 과제 미제출', score: 2 });
  });

  it('취소하면 편집을 종료하고 아무것도 저장하지 않는다', async () => {
    const user = userEvent.setup();
    const { onUpdate } = renderTable({ records: [createRecord()] });

    await user.click(screen.getByRole('button', { name: '수정' }));
    await user.type(screen.getByLabelText('페널티 사유'), '추가 입력');
    await user.click(screen.getByRole('button', { name: '취소' }));

    expect(onUpdate).not.toHaveBeenCalled();
    expect(screen.getByRole('button', { name: '수정' })).toBeInTheDocument();
  });

  it('사유가 비어 있으면 저장할 수 없다', async () => {
    const user = userEvent.setup();
    renderTable({ records: [createRecord()] });

    await user.click(screen.getByRole('button', { name: '수정' }));
    await user.clear(screen.getByLabelText('페널티 사유'));

    expect(screen.getByRole('button', { name: '저장' })).toBeDisabled();
  });

  it('경고 내역은 점수를 수정할 수 없다', async () => {
    const user = userEvent.setup();
    renderTable({ records: [createRecord({ type: 'WARNING' })] });

    await user.click(screen.getByRole('button', { name: '수정' }));

    expect(screen.getByLabelText('페널티 점수')).toBeDisabled();
  });

  it('한 행을 편집하는 동안 다른 행의 수정/삭제는 비활성화된다', async () => {
    const user = userEvent.setup();
    renderTable({
      records: [createRecord(), createRecord({ id: 'record-2', reason: '회비 납부 지연' })],
    });

    await user.click(screen.getAllByRole('button', { name: '수정' })[0]);

    expect(screen.getByRole('button', { name: '수정' })).toBeDisabled();
    expect(screen.getByRole('button', { name: '삭제' })).toBeDisabled();
  });

  it('삭제를 누르면 해당 내역을 전달한다', async () => {
    const user = userEvent.setup();
    const record = createRecord();
    const { onDelete } = renderTable({ records: [record] });

    await user.click(screen.getByRole('button', { name: '삭제' }));

    expect(onDelete).toHaveBeenCalledWith(record);
  });
});
