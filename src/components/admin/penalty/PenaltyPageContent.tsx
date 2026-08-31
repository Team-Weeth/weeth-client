'use client';

import { useState } from 'react';

import {
  MOCK_PENALTY_CARDINAL_NUMBERS,
  MOCK_PENALTY_GUIDE,
  MOCK_PENALTY_MEMBERS,
  MOCK_PENALTY_RECORDS,
} from '@/constants/admin/penaltyMock.constants';
import { PENALTY_SCORE_MIN } from '@/constants/admin/penaltyTable.constants';
import { toastSuccess } from '@/stores/useToastStore';
import type {
  PenaltyMember,
  PenaltyRecord,
  PenaltyRecordDraft,
  PenaltySortBy,
} from '@/types/admin/penalty';
import {
  filterPenaltyMembers,
  getMemberPenaltyRecords,
  getNextPenaltySort,
  searchPenaltyMembers,
  sortPenaltyMembers,
  summarizeMemberPenalties,
} from '@/utils/admin/penaltyPageUtils';
import { PenaltyDetailModal } from './modal/PenaltyDetailModal';
import { PenaltySettingModal } from './modal/PenaltySettingModal';
import { PenaltyAddSection } from './PenaltyAddSection';
import { PenaltyPageHeader } from './PenaltyPageHeader';
import { PenaltySortButton } from './PenaltySortButton';
import { PenaltyTable } from './PenaltyTable';

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
  const [detailMember, setDetailMember] = useState<PenaltyMember | null>(null);
  const [records, setRecords] = useState<PenaltyRecord[]>(MOCK_PENALTY_RECORDS);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [penaltyGuide, setPenaltyGuide] = useState(MOCK_PENALTY_GUIDE);

  const nextSortBy = getNextPenaltySort(sortBy);

  // TODO: 페널티 API 연동 시 목 데이터를 서버 데이터로 교체한다.
  // 페널티/최근 페널티 열은 내역에서 파생시켜 수정·삭제가 목록에 바로 반영되게 한다.
  const penaltySummary = summarizeMemberPenalties(records);
  const members = MOCK_PENALTY_MEMBERS.map((member) => ({
    ...member,
    penaltyCount: penaltySummary.get(member.id)?.penaltyCount ?? 0,
    recentPenaltyAt: penaltySummary.get(member.id)?.recentPenaltyAt ?? null,
  }));

  const cardinalMembers = filterPenaltyMembers(members, selectedCardinal);
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
    setMemberQuery('');
  };

  const handleRemoveMember = (id: string) => {
    handleDraftChange({ memberIds: draft.memberIds.filter((memberId) => memberId !== id) });
  };

  const handlePenaltySetting = () => setIsSettingOpen(true);

  const handleSelectCardinal = (cardinalNumber: number) => {
    setSelectedCardinal(cardinalNumber);
    setMemberQuery('');
    handleDraftChange({ memberIds: [] });
  };

  // TODO: 페널티 기록 수정 API 연동 필요
  const handleUpdateRecord = (record: PenaltyRecord, next: { reason: string; score: number }) => {
    setRecords((prev) => prev.map((item) => (item.id === record.id ? { ...item, ...next } : item)));
    toastSuccess('페널티 내역이 수정되었습니다.');
  };

  // TODO: 페널티 기록 삭제 API 연동 필요
  const handleDeleteRecord = (record: PenaltyRecord) => {
    setRecords((prev) => prev.filter((item) => item.id !== record.id));
    toastSuccess('페널티 내역이 삭제되었습니다.');
  };

  // TODO: 페널티 규정 저장 API 연동 필요
  const handleSavePenaltySetting = (guide: string) => {
    setPenaltyGuide(guide);
    setIsSettingOpen(false);
    toastSuccess('페널티 규정이 저장되었습니다.');
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
          onOpenSetting={handlePenaltySetting}
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
            onOpenDetail={setDetailMember}
          />
        </div>
      </div>

      <PenaltySettingModal
        open={isSettingOpen}
        onOpenChange={setIsSettingOpen}
        guide={penaltyGuide}
        onSave={handleSavePenaltySetting}
      />

      <PenaltyDetailModal
        open={detailMember !== null}
        onOpenChange={(open) => {
          if (!open) setDetailMember(null);
        }}
        member={detailMember}
        records={detailMember ? getMemberPenaltyRecords(records, detailMember.id) : []}
        onUpdateRecord={handleUpdateRecord}
        onDeleteRecord={handleDeleteRecord}
      />
    </div>
  );
}

export { PenaltyPageContent };
