'use client';

import { useState } from 'react';

import { PENALTY_SCORE_MIN } from '@/constants/admin/penaltyTable.constants';
import { useSavePenaltyRule } from '@/hooks/mutations/admin/useAdminPenaltyMutations';
import {
  useAdminMemberPenaltyDetail,
  useAdminPenaltyMembers,
} from '@/hooks/queries/admin/useAdminPenaltyQueries';
import { useMyPagePenaltyRuleQuery } from '@/hooks/queries/mypage/useMyPagePenaltyRuleQuery';
import { useCardinals } from '@/hooks/queries/useCardinalsQuery';
import { useClubId } from '@/stores';
import { toastError, toastSuccess } from '@/stores/useToastStore';
import type { PenaltyMember, PenaltyRecordDraft, PenaltySortBy } from '@/types/admin/penalty';
import {
  getNextPenaltySort,
  searchPenaltyMembers,
  sortPenaltyMembers,
} from '@/utils/admin/penaltyPageUtils';
import { getApiErrorMessage } from '@/utils/shared/getApiErrorCode';
import { usePenaltyRecordActions } from './hooks/usePenaltyRecordActions';
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
  const clubId = useClubId();
  const [selectedCardinal, setSelectedCardinal] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<PenaltySortBy>('cardinal');
  const [memberQuery, setMemberQuery] = useState('');
  const [draft, setDraft] = useState<PenaltyRecordDraft>(INITIAL_DRAFT);
  const [detailMember, setDetailMember] = useState<PenaltyMember | null>(null);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const { data: cardinals = [] } = useCardinals();
  const cardinalNumbers = cardinals.map((cardinal) => cardinal.cardinalNumber);
  // 기수 목록이 늦게 도착하므로, 아직 고르지 않았으면 가장 최근 기수를 기본값으로 쓴다.
  const activeCardinal = selectedCardinal ?? (Math.max(...cardinalNumbers, 0) || null);

  const { data: cardinalMembers = [] } = useAdminPenaltyMembers(activeCardinal);
  const { data: detailRecords = [] } = useAdminMemberPenaltyDetail(
    detailMember?.clubMemberId ?? null,
  );
  // 규정 입력 폼은 마운트 시점의 값으로 초안을 잡으므로, 규정을 받은 뒤에 모달을 연다.
  const { data: penaltyGuide = '', isPending: isPenaltyGuidePending } = useMyPagePenaltyRuleQuery(
    clubId ?? '',
  );

  const savePenaltyRule = useSavePenaltyRule();
  const { submitRecord, updateRecord, deleteRecord } = usePenaltyRecordActions();

  const nextSortBy = getNextPenaltySort(sortBy);
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

  const handleSelectCardinal = (cardinalNumber: number) => {
    setSelectedCardinal(cardinalNumber);
    setMemberQuery('');
    handleDraftChange({ memberIds: [] });
  };

  const handleSavePenaltySetting = (guide: string) => {
    savePenaltyRule.mutate(guide, {
      onSuccess: () => {
        setIsSettingOpen(false);
        toastSuccess('페널티 규정이 저장되었습니다.');
      },
      onError: (err) => toastError(getApiErrorMessage(err)),
    });
  };

  const handleSubmitRecord = () => {
    submitRecord(draft, () => {
      setDraft(INITIAL_DRAFT);
      setMemberQuery('');
    });
  };

  return (
    <div className="flex min-h-full min-w-0 pr-450">
      <div className="bg-container-neutral flex min-w-0 flex-1 flex-col rounded-t-[20px]">
        <PenaltyPageHeader
          cardinalNumbers={cardinalNumbers}
          selectedCardinal={activeCardinal ?? 0}
          onSelectCardinal={handleSelectCardinal}
          onOpenSetting={() => setIsSettingOpen(true)}
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
        open={isSettingOpen && !isPenaltyGuidePending}
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
        records={detailRecords}
        onUpdateRecord={updateRecord}
        onDeleteRecord={deleteRecord}
      />
    </div>
  );
}

export { PenaltyPageContent };
