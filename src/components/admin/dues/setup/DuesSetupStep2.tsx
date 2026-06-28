'use client';

import { useEffect } from 'react';

import { BackButton, DuesSearchBar } from '@/components/admin/dues';
import { MOCK_PAYMENT_TARGETS } from '@/constants/mock';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';

import {
  DuesSetupStepIndicator,
  DuesMemberTable,
  DuesPagination,
  DuesTabs,
  NextButton,
  PrevButton,
} from '@/components/admin/dues/setup/components';
import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';
import { usePaymentTargetFilter } from '@/hooks/admin';

function DuesSetupStep2() {
  const { goToStep } = useDuesSetupNavigation();

  const { cardinalNumber, selectedMemberIds, memberIdsInitialized } = useDuesSetupValues();
  const { setField } = useDuesSetupActions();

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
  } = usePaymentTargetFilter(selectedMemberIds);

  // 첫 진입 시 TARGETED 멤버로 초기화
  useEffect(() => {
    if (!memberIdsInitialized) {
      const targetedIds = MOCK_PAYMENT_TARGETS.filter((t) => t.targetStatus === 'TARGETED').map(
        (t) => t.paymentTargetInfo.clubMemberId,
      );
      setField({ selectedMemberIds: targetedIds, memberIdsInitialized: true });
    }
  }, [memberIdsInitialized, setField]);

  const toggleMember = (id: number) => {
    const next = selectedSet.has(id)
      ? selectedMemberIds.filter((x) => x !== id)
      : [...selectedMemberIds, id];
    setField({ selectedMemberIds: next });
  };

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{cardinalNumber}기 총 회비 설정</h1>
      </div>

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
        <NextButton handleNext={() => goToStep(3)} />
      </div>
    </div>
  );
}

export { DuesSetupStep2 };
