'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';

import { BackButton, DuesSearchBar } from '@/components/admin/dues';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';
import { toastError } from '@/stores/useToastStore';
import { useDuesPaymentTargetsQuery } from '@/hooks/queries/admin';
import { useSaveDuesPaymentTargets } from '@/hooks/mutations/admin';

import {
  DuesSetupStepIndicator,
  DuesMemberTable,
  DuesPagination,
  DuesTabs,
  NextButton,
  PrevButton,
  SetupHeader,
} from '@/components/admin/dues/setup/components';
import { useDuesSetupNavigation } from '@/hooks/admin/useDuesSetupNavigation';
import { useDuesStepNavigator } from '@/hooks/admin/useDuesStepNavigator';
import { usePaymentTargetFilter } from '@/hooks/admin';

function DuesSetupStep2() {
  const { clubId } = useParams<{ clubId: string }>();
  const { goToStep } = useDuesSetupNavigation();

  const { accountId, cardinalNumber, selectedMemberIds, memberIdsInitialized } =
    useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const { data } = useDuesPaymentTargetsQuery(clubId, accountId);
  const savePaymentTargets = useSaveDuesPaymentTargets(clubId, accountId, {
    onError: () => toastError('납부 대상 저장에 실패했습니다. 잠시 후 다시 시도해주세요.'),
  });

  const allTargets = data?.targets.content ?? [];

  // 최초 조회 시 서버의 기존 대상(TARGETED)을 store에 복원한다(1회).
  useEffect(() => {
    if (!data || memberIdsInitialized) return;

    const targetedIds = data.targets.content
      .filter((t) => t.targetStatus === 'TARGETED')
      .map((t) => t.paymentTargetInfo.clubMemberId);
    setField({ selectedMemberIds: targetedIds, memberIdsInitialized: true });
  }, [data, memberIdsInitialized, setField]);

  const {
    totalCount,
    selectedCount,
    tab,
    search,
    selectedSet,
    page,
    setPage,
    excludedCount,
    totalPages,
    pagedTargets,
    handleTabChange,
    handleSearch,
  } = usePaymentTargetFilter(allTargets, selectedMemberIds);

  const toggleMember = (id: number) => {
    const next = selectedSet.has(id)
      ? selectedMemberIds.filter((x) => x !== id)
      : [...selectedMemberIds, id];
    setField({ selectedMemberIds: next });
  };

  const commitStep = async () => {
    if (accountId === null) return false;
    if (selectedMemberIds.length === 0) {
      toastError('납부 대상을 1명 이상 선택해주세요.');
      return false;
    }

    // 스냅샷 방식(전체 교체): 선택된 대상 ID만 전달하면 미선택 회원은 자동 제외된다
    try {
      await savePaymentTargets.mutateAsync({ targetedClubMemberIds: selectedMemberIds });
      return true;
    } catch {
      return false;
    }
  };

  const { goNext, isEditMode } = useDuesStepNavigator(2, commitStep);

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <SetupHeader cardinalNumber={cardinalNumber} />

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator currentStep={2} />

        <div className="bg-container-neutral flex flex-col gap-600 rounded-lg px-400 py-450">
          {/* 섹션 헤더 */}
          <div className="flex flex-col gap-200">
            <span className="typo-caption1 text-text-alternative">납부 대상 (2/5)</span>
            <h2 className="typo-h3 text-text-normal">이번 회비를 납부할 멤버를 선택해주세요</h2>
          </div>

          {/* 탭 + 검색 */}
          <div className="flex flex-col gap-400">
            <DuesTabs
              tabs={[
                { key: 'all', label: `전체 ${totalCount}` },
                { key: 'selected', label: `선택됨 ${selectedCount}` },
                { key: 'excluded', label: `제외됨 ${excludedCount}` },
              ]}
              activeTab={tab}
              onTabChange={handleTabChange}
            />

            {/* 검색바 */}
            <DuesSearchBar searchQuery={search} setSearchQuery={handleSearch} />
          </div>

          {/* 테이블 */}
          <DuesMemberTable
            pagedTargets={pagedTargets}
            selectedSet={selectedSet}
            toggleMember={toggleMember}
          />

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <DuesPagination page={page} totalPages={totalPages} onPageChange={setPage} />
          )}
        </div>
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between">
        <PrevButton handlePrev={() => goToStep(1)} />
        <NextButton
          handleNext={goNext}
          editMode={isEditMode}
          disabled={savePaymentTargets.isPending}
        />
      </div>
    </div>
  );
}

export { DuesSetupStep2 };
