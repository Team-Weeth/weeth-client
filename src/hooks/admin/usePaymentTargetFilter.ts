'use client';

import { useState } from 'react';

import type { PaymentTarget } from '@/types/admin/dues';

const PAGE_SIZE = 10;

type TabType = 'selected' | 'excluded' | 'all';

function usePaymentTargetFilter(
  allTargets: PaymentTarget[],
  selectedMemberIds: number[],
  initialTab: TabType = 'all',
) {
  const [tab, setTab] = useState<TabType>(initialTab);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const selectedSet = new Set(selectedMemberIds);

  const totalCount = allTargets.length;
  const selectedCount = selectedMemberIds.length;
  const excludedCount = totalCount - selectedCount;

  const byTab =
    tab === 'all'
      ? allTargets
      : tab === 'selected'
        ? allTargets.filter((t) => selectedSet.has(t.paymentTargetInfo.clubMemberId))
        : allTargets.filter((t) => !selectedSet.has(t.paymentTargetInfo.clubMemberId));

  const filteredTargets = search.trim()
    ? byTab.filter((t) => t.paymentTargetInfo.name.includes(search.trim()))
    : byTab;

  const totalPages = Math.max(1, Math.ceil(filteredTargets.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedTargets = filteredTargets.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE,
  );

  const handleTabChange = (next: TabType) => {
    setTab(next);
    setPage(1);
  };

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return {
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
  };
}

export { usePaymentTargetFilter };
