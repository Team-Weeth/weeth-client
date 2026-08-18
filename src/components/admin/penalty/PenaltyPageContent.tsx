'use client';

import { useState } from 'react';

import {
  MOCK_PENALTY_CARDINAL_NUMBERS,
  MOCK_PENALTY_MEMBERS,
} from '@/constants/admin/penaltyMock.constants';
import { PENALTY_SCORE_MIN, PENALTY_SORT_ORDER } from '@/constants/admin/penaltyTable.constants';
import { toastSuccess } from '@/stores/useToastStore';
import type { PenaltyRecordDraft, PenaltySortBy } from '@/types/admin/penalty';
import {
  filterPenaltyMembers,
  getNextPenaltySort,
  searchPenaltyMembers,
  sortPenaltyMembers,
} from '@/utils/admin/penaltyPageUtils';
import { PenaltyAddSection } from './PenaltyAddSection';
import { PenaltyPageHeader } from './PenaltyPageHeader';
import { PenaltyTable } from './PenaltyTable';
import { PenaltySortButton } from './PenaltySortButton';

const INITIAL_DRAFT: PenaltyRecordDraft = {
  type: 'PENALTY',
  score: PENALTY_SCORE_MIN,
  memberIds: [],
  reason: '',
};

function PenaltyPageContent() {
  const [selectedCardinal, setSelectedCardinal] = useState(MOCK_PENALTY_CARDINAL_NUMBERS[0]);
  const [sortBy, setSortBy] = useState<PenaltySortBy>('cardinal');
  const [memberQuery, setMemberQuery] = useState('');
  const [draft, setDraft] = useState<PenaltyRecordDraft>(INITIAL_DRAFT);

  const nextSortBy = getNextPenaltySort(sortBy, PENALTY_SORT_ORDER);

  // TODO: 페널티 API 연동 시 목 데이터를 서버 데이터로 교체한다.
  const cardinalMembers = filterPenaltyMembers(MOCK_PENALTY_MEMBERS, selectedCardinal);
  const visibleMembers = sortPenaltyMembers(
    searchPenaltyMembers(cardinalMembers, memberQuery),
    sortBy,
  );

  // 인풋의 칩과 테이블 체크박스는 draft.memberIds 하나의 상태를 공유한다.
  const selectedIds = new Set(draft.memberIds);
  const selectedMembers = cardinalMembers.filter((member) => selectedIds.has(member.id));

  const handleDraftChange = (next: Partial<PenaltyRecordDraft>) => {
    setDraft((prev) => ({ ...prev, ...next }));
  };

  const handleSelectionChange = (ids: Set<string>) => {
    handleDraftChange({ memberIds: [...ids] });
  };

  const handleRemoveMember = (id: string) => {
    handleDraftChange({ memberIds: draft.memberIds.filter((memberId) => memberId !== id) });
  };

  const handleSelectCardinal = (cardinalNumber: number) => {
    setSelectedCardinal(cardinalNumber);
    setMemberQuery('');
    handleDraftChange({ memberIds: [] });
  };

  // TODO: 페널티 기록 추가 API 연동 필요
  const handleSubmitRecord = () => {
    toastSuccess(`${draft.type === 'WARNING' ? '경고' : '페널티'}가 기록되었습니다.`);
    setDraft(INITIAL_DRAFT);
    setMemberQuery('');
  };

  return (
    <div className="flex min-h-full min-w-0 pr-450">
      <div className="bg-container-neutral flex min-w-0 flex-1 flex-col rounded-t-[20px]">
        <PenaltyPageHeader
          cardinalNumbers={MOCK_PENALTY_CARDINAL_NUMBERS}
          selectedCardinal={selectedCardinal}
          onSelectCardinal={handleSelectCardinal}
        />

        <div className="flex flex-col gap-400 px-700 pt-400 pb-700">
          <PenaltyAddSection
            draft={draft}
            onDraftChange={handleDraftChange}
            onSubmit={handleSubmitRecord}
            selectedMembers={selectedMembers}
            memberQuery={memberQuery}
            onMemberQueryChange={setMemberQuery}
            onRemoveMember={handleRemoveMember}
          />
          <div className="flex items-center justify-between px-4">
            <h2 className="typo-sub1 text-text-strong">멤버 리스트</h2>
            <PenaltySortButton
              sortBy={sortBy}
              nextSortBy={nextSortBy}
              onToggleSort={() => setSortBy(nextSortBy)}
            />
          </div>

          <PenaltyTable
            members={visibleMembers}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      </div>
    </div>
  );
}

export { PenaltyPageContent };
