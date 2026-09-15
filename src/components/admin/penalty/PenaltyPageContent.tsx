'use client';

import { useEffect, useState } from 'react';

import { PENALTY_SCORE_MIN } from '@/constants/admin/penaltyTable.constants';
import {
  useAdminMemberPenaltyDetail,
  useAdminPenaltyMembers,
} from '@/hooks/queries/admin/useAdminPenaltyQueries';
import { useMyPagePenaltyRuleQuery } from '@/hooks/queries/mypage/useMyPagePenaltyRuleQuery';
import { useCardinals } from '@/hooks/queries/useCardinalsQuery';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useClubId } from '@/stores';
import { cn } from '@/lib/cn';
import type { PenaltyMember, PenaltyRecordDraft, PenaltySortBy } from '@/types/admin/penalty';
import { getNextPenaltySort } from '@/utils/admin/penaltyPageUtils';
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

function PenaltyPageContent({ warningEnabled = false }: { warningEnabled?: boolean }) {
  const clubId = useClubId();
  const [selectedCardinal, setSelectedCardinal] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<PenaltySortBy>('CARDINAL_DESC');
  const [memberQuery, setMemberQuery] = useState('');
  const [page, setPage] = useState(1);
  const [draft, setDraft] = useState<PenaltyRecordDraft>(INITIAL_DRAFT);
  // 선택한 멤버는 페이지를 넘겨도 칩·제출에 필요하므로 id → 멤버로 따로 들고 있는다.
  const [selectedMemberMap, setSelectedMemberMap] = useState<Map<string, PenaltyMember>>(new Map());
  const [detailMember, setDetailMember] = useState<PenaltyMember | null>(null);
  const [isSettingOpen, setIsSettingOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(memberQuery, 300);

  const { data: cardinals = [] } = useCardinals();
  const cardinalNumbers = cardinals.map((cardinal) => cardinal.cardinalNumber);
  // 기수 목록이 늦게 도착하므로, 아직 고르지 않았으면 가장 최근 기수를 기본값으로 쓴다.
  const activeCardinal = selectedCardinal ?? (Math.max(...cardinalNumbers, 0) || null);

  const { data: memberPage, isFetching: isMembersFetching } = useAdminPenaltyMembers({
    cardinalNumber: activeCardinal,
    keyword: debouncedQuery,
    sort: sortBy,
    page,
  });
  const visibleMembers = memberPage?.members ?? [];
  const totalPages = memberPage?.totalPages ?? 1;

  const { data: detailRecords = [] } = useAdminMemberPenaltyDetail(
    detailMember?.clubMemberId ?? null,
  );
  // 규정 입력 폼은 마운트 시점의 값으로 초안을 잡으므로, 규정을 받은 뒤에 모달을 연다.
  const { data: penaltyGuide = '', isPending: isPenaltyGuidePending } = useMyPagePenaltyRuleQuery(
    clubId ?? '',
  );

  const { submitRecord, updateRecord, deleteRecord, saveRule } = usePenaltyRecordActions();

  // 기수·정렬·검색어가 바뀌면 첫 페이지부터 다시 본다.
  useEffect(() => {
    const timeout = window.setTimeout(() => setPage(1), 0);
    return () => window.clearTimeout(timeout);
  }, [activeCardinal, sortBy, debouncedQuery]);

  const nextSortBy = getNextPenaltySort(sortBy);

  // 인풋의 칩과 테이블 체크박스는 draft.memberIds 하나의 상태를 공유한다.
  const selectedIds = new Set(draft.memberIds);
  const selectedMembers = draft.memberIds
    .map((id) => selectedMemberMap.get(id))
    .filter((member): member is PenaltyMember => member !== undefined);

  const handleDraftChange = (next: Partial<PenaltyRecordDraft>) => {
    setDraft((prev) => ({ ...prev, ...next }));
  };

  const handleSelectionChange = (ids: Set<string>) => {
    setSelectedMemberMap((prev) => {
      const next = new Map<string, PenaltyMember>();
      ids.forEach((id) => {
        const member = visibleMembers.find((m) => m.id === id) ?? prev.get(id);
        if (member) next.set(id, member);
      });
      return next;
    });
    handleDraftChange({ memberIds: [...ids] });
    setMemberQuery('');
  };

  const handleRemoveMember = (id: string) => {
    handleDraftChange({ memberIds: draft.memberIds.filter((memberId) => memberId !== id) });
    setSelectedMemberMap((prev) => {
      const next = new Map(prev);
      next.delete(id);
      return next;
    });
  };

  const handleSelectCardinal = (cardinalNumber: number) => {
    setSelectedCardinal(cardinalNumber);
    setMemberQuery('');
    handleDraftChange({ memberIds: [] });
    setSelectedMemberMap(new Map());
  };

  const handleSavePenaltySetting = (guide: string) => {
    saveRule(guide, () => setIsSettingOpen(false));
  };

  const handleSubmitRecord = () => {
    submitRecord(draft, () => {
      setDraft(INITIAL_DRAFT);
      setMemberQuery('');
      setSelectedMemberMap(new Map());
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
            warningEnabled={warningEnabled}
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
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
            className={cn(isMembersFetching && 'pointer-events-none opacity-60 transition-opacity')}
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
        cardinalNumber={activeCardinal}
        warningEnabled={warningEnabled}
        onUpdateRecord={updateRecord}
        onDeleteRecord={deleteRecord}
      />
    </div>
  );
}

export { PenaltyPageContent };
