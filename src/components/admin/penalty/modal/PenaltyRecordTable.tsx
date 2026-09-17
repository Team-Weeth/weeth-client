'use client';

import { useState } from 'react';

import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Tag } from '@/components/ui/tag';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  PENALTY_DETAIL_COLUMN_WIDTH,
  PENALTY_DETAIL_TABLE_COLUMNS,
  PENALTY_REASON_MAX_LENGTH,
} from '@/constants/admin/penaltyTable.constants';
import { cn } from '@/lib/cn';
import type { PenaltyRecord } from '@/types/admin/penalty';
import { formatPenaltyDate } from '@/utils/admin/penaltyPageUtils';
import { PenaltyRecordDeletePopover } from './PenaltyRecordDeletePopover';

/** 인라인 편집 중인 행의 임시 값 (편집 중이 아니면 null) */
interface PenaltyRecordEdit {
  id: number;
  reason: string;
}

interface PenaltyRecordTableProps extends React.HTMLAttributes<HTMLDivElement> {
  records: PenaltyRecord[];
  onUpdate?: (record: PenaltyRecord, next: { reason: string; score: number }) => void;
  onDelete?: (record: PenaltyRecord) => void;
}

function PenaltyRecordTable({
  className,
  records,
  onUpdate,
  onDelete,
  ...props
}: PenaltyRecordTableProps) {
  const [edit, setEdit] = useState<PenaltyRecordEdit | null>(null);

  const handleStartEdit = (record: PenaltyRecord) => {
    setEdit({ id: record.id, reason: record.reason });
  };

  const handleSave = (record: PenaltyRecord) => {
    if (!edit) return;

    onUpdate?.(record, { reason: edit.reason.trim(), score: record.score });
    setEdit(null);
  };

  return (
    <div
      className={cn(
        // 내역이 늘어나도 모달이 밀리지 않도록, 남는 높이 안에서 표 본문만 스크롤한다.
        'border-line bg-container-neutral max-tablet:shrink-0 flex min-h-0 flex-col overflow-hidden rounded-sm border',
        className,
      )}
      {...props}
    >
      <Table
        className="max-tablet:block table-fixed border-separate border-spacing-0"
        wrapperClassName="scrollbar-custom min-h-0 overflow-auto"
      >
        <TableHeader className="typo-caption1 bg-container-neutral-alternative max-tablet:hidden sticky top-0 z-10">
          <TableRow className="h-10 border-0 hover:bg-transparent">
            {PENALTY_DETAIL_TABLE_COLUMNS.map((column) => (
              <TableHead
                key={column.id}
                className={cn('text-text-alternative h-10', column.className)}
              >
                {column.label}
              </TableHead>
            ))}
            <TableHead className={cn('h-10 p-0', PENALTY_DETAIL_COLUMN_WIDTH.actions)} />
          </TableRow>
        </TableHeader>

        <TableBody className="max-tablet:block">
          {records.length === 0 ? (
            <TableRow className="h-16 border-0 hover:bg-transparent">
              <TableCell
                colSpan={PENALTY_DETAIL_TABLE_COLUMNS.length + 1}
                className="typo-body2 text-text-alternative h-16 text-center"
              >
                등록된 페널티 내역이 없습니다.
              </TableCell>
            </TableRow>
          ) : (
            records.map((record) =>
              edit?.id === record.id ? (
                <PenaltyRecordEditRow
                  key={record.id}
                  record={record}
                  edit={edit}
                  onEditChange={(next) => setEdit({ ...edit, ...next })}
                  onSave={() => handleSave(record)}
                  onCancel={() => setEdit(null)}
                />
              ) : (
                <PenaltyRecordReadRow
                  key={record.id}
                  record={record}
                  dimmed={edit !== null}
                  onEdit={() => handleStartEdit(record)}
                  onDelete={() => onDelete?.(record)}
                />
              ),
            )
          )}
        </TableBody>
      </Table>
    </div>
  );
}

function PenaltyRecordReadRow({
  record,
  dimmed,
  onEdit,
  onDelete,
}: {
  record: PenaltyRecord;
  /** 다른 행이 편집 중이면 흐리게 비활성 처리한다 (한 번에 한 건만 수정) */
  dimmed: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const textColor = dimmed ? 'text-text-disabled' : 'text-text-strong';

  return (
    <TableRow className="[&>td]:border-line max-tablet:grid max-tablet:h-auto max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:gap-300 max-tablet:border-b max-tablet:border-line max-tablet:p-400 max-tablet:last:border-b-0 max-tablet:[&>td]:h-auto max-tablet:[&>td]:w-auto max-tablet:[&>td]:min-w-0 max-tablet:[&>td]:border-0 max-tablet:[&>td]:p-0 h-16 border-0 hover:bg-transparent [&:last-child>td]:border-b-0 [&>td]:border-b">
      <TableCell className={cn('h-16 py-300 pr-200 pl-600', PENALTY_DETAIL_COLUMN_WIDTH.type)}>
        <Tag variant={record.type === 'WARNING' ? 'caution' : 'error'}>
          {record.type === 'WARNING' ? '경고' : '페널티'}
        </Tag>
      </TableCell>
      <TableCell
        className={cn(
          'typo-body1 max-tablet:col-span-2 max-tablet:row-start-2 max-tablet:overflow-visible max-tablet:whitespace-normal max-tablet:break-words h-16 truncate px-200 py-300',
          textColor,
        )}
      >
        {record.reason}
      </TableCell>
      <TableCell
        className={cn(
          'typo-body2 max-tablet:col-start-2 max-tablet:row-start-1 max-tablet:self-center max-tablet:text-right h-16 py-300 pr-600 pl-400',
          textColor,
          PENALTY_DETAIL_COLUMN_WIDTH.date,
        )}
      >
        {formatPenaltyDate(record.createdAt)}
      </TableCell>
      <TableCell
        className={cn('max-tablet:col-span-2 h-16 p-0 pr-600', PENALTY_DETAIL_COLUMN_WIDTH.actions)}
      >
        <div className="flex items-center justify-end gap-200">
          <Button variant="secondary" size="sm" disabled={dimmed} onClick={onEdit}>
            수정
          </Button>
          <PenaltyRecordDeletePopover disabled={dimmed} onConfirm={onDelete} />
        </div>
      </TableCell>
    </TableRow>
  );
}

function PenaltyRecordEditRow({
  record,
  edit,
  onEditChange,
  onSave,
  onCancel,
}: {
  record: PenaltyRecord;
  edit: PenaltyRecordEdit;
  onEditChange: (next: Partial<PenaltyRecordEdit>) => void;
  onSave: () => void;
  onCancel: () => void;
}) {
  const isWarning = record.type === 'WARNING';
  const canSave = edit.reason.trim().length > 0;

  return (
    <TableRow className="[&>td]:border-line max-tablet:grid max-tablet:h-auto max-tablet:grid-cols-[auto_minmax(0,1fr)] max-tablet:gap-300 max-tablet:border-b max-tablet:border-line max-tablet:p-400 max-tablet:last:border-b-0 max-tablet:[&>td]:h-auto max-tablet:[&>td]:w-auto max-tablet:[&>td]:min-w-0 max-tablet:[&>td]:border-0 max-tablet:[&>td]:p-0 max-tablet:bg-neutral-200 h-16 border-0 hover:bg-transparent [&:last-child>td]:border-b-0 [&>td]:border-b">
      <TableCell
        className={cn('h-16 bg-neutral-200 py-300 pr-200 pl-600', PENALTY_DETAIL_COLUMN_WIDTH.type)}
      >
        <Tag variant={isWarning ? 'caution' : 'error'}>{isWarning ? '경고' : '페널티'}</Tag>
      </TableCell>
      <TableCell className="max-tablet:col-span-2 max-tablet:row-start-2 h-16 bg-neutral-200 px-200 py-200">
        <Input
          autoFocus
          value={edit.reason}
          onChange={(event) => onEditChange({ reason: event.target.value })}
          maxLength={PENALTY_REASON_MAX_LENGTH}
          placeholder={`${isWarning ? '경고' : '페널티'} 사유를 작성해주세요`}
          aria-label="페널티 사유"
          className="typo-body1 border-brand-primary h-12 w-full min-w-0 px-400"
        />
      </TableCell>
      <TableCell
        className={cn(
          'typo-body2 text-text-strong max-tablet:col-start-2 max-tablet:row-start-1 max-tablet:self-center max-tablet:text-right h-16 bg-neutral-200 py-300 pr-600 pl-400',
          PENALTY_DETAIL_COLUMN_WIDTH.date,
        )}
      >
        {formatPenaltyDate(record.createdAt)}
      </TableCell>
      <TableCell
        className={cn(
          'max-tablet:col-span-2 h-16 bg-neutral-200 p-0 pr-600',
          PENALTY_DETAIL_COLUMN_WIDTH.actions,
        )}
      >
        <div className="flex items-center justify-end gap-200">
          <Button variant="primary" size="sm" disabled={!canSave} onClick={onSave}>
            저장
          </Button>
          <Button variant="secondary" size="sm" onClick={onCancel}>
            취소
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export { PenaltyRecordTable, type PenaltyRecordTableProps };
