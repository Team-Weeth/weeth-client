'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';

import { BackButton, DuesSearchBar } from '@/components/admin/dues';
import { duesApi } from '@/lib/apis/dues';
import { useDuesSetupValues, useDuesSetupActions } from '@/stores/useDuesSetupStore';
import type { PaymentTarget } from '@/types/admin/dues';

import {
  DuesSetupStepIndicator,
  DuesMemberTable,
  DuesPagination,
  DuesTabs,
  NextButton,
  PrevButton,
} from '@/components/admin/dues/setup/components';
import { useDuesSetupNavigation } from '@/components/admin/dues/setup/useDuesSetupNavigation';
import { useDuesStepNavigator } from '@/components/admin/dues/setup/useDuesStepNavigator';
import { usePaymentTargetFilter } from '@/hooks/admin';

function DuesSetupStep2() {
  const { clubId } = useParams<{ clubId: string }>();
  const { goToStep } = useDuesSetupNavigation();

  const { accountId, cardinalNumber, selectedMemberIds, memberIdsInitialized } =
    useDuesSetupValues();
  const { setField } = useDuesSetupActions();

  const [allTargets, setAllTargets] = useState<PaymentTarget[]>([]);

  useEffect(() => {
    if (accountId === null) return;

    duesApi
      .getPaymentTargets(clubId, accountId)
      .then((res) => {
        const targets = res.data.data.targets.content;
        setAllTargets(targets);

        if (!memberIdsInitialized) {
          const targetedIds = targets
            .filter((t) => t.targetStatus === 'TARGETED')
            .map((t) => t.paymentTargetInfo.clubMemberId);
          setField({ selectedMemberIds: targetedIds, memberIdsInitialized: true });
        }
      })
      .catch(() => {});
  }, [accountId, clubId, memberIdsInitialized, setField]);

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

  // TODO: 대상자 선택 안 되면 못 넘어가게(null 값 안 들어가게 하기)
  const commitStep = async () => {
    if (accountId === null) return false;

    // 스냅샷 방식(전체 교체): 선택된 대상 ID만 전달하면 미선택 회원은 자동 제외된다
    await duesApi
      .savePaymentTargets(clubId, accountId, { targetedClubMemberIds: selectedMemberIds })
      .catch(() => {});

    return true;
  };

  const { maxReachedStep, goNext, goToReachedStep } = useDuesStepNavigator(2, commitStep);

  return (
    <div className="flex min-w-85 flex-col gap-700 p-700">
      {/* 헤더 */}
      <div className="flex flex-col gap-300">
        <BackButton />
        <h1 className="typo-h2 text-text-strong">{cardinalNumber}기 총 회비 설정</h1>
      </div>

      <div className="flex flex-col gap-600">
        <DuesSetupStepIndicator
          currentStep={2}
          maxReachedStep={maxReachedStep}
          onStepClick={goToReachedStep}
        />

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
        <NextButton handleNext={goNext} />
      </div>
    </div>
  );
}

export { DuesSetupStep2 };
