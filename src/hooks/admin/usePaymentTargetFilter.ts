'use client';

import { MOCK_PAYMENT_TARGETS } from '@/constants/mock';
import { useState } from 'react';

const PAGE_SIZE = 10;

type TabType = 'selected' | 'excluded' | 'all';

function usePaymentTargetFilter(selectedMemberIds: number[]) {
  const [tab, setTab] = useState<TabType>('selected');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const selectedSet = new Set(selectedMemberIds);

  const totalCount = MOCK_PAYMENT_TARGETS.length;
  const selectedCount = selectedMemberIds.length;
  const excludedCount = totalCount - selectedCount;

  const byTab =
    tab === 'selected'
      ? MOCK_PAYMENT_TARGETS.filter((t) => selectedSet.has(t.paymentTargetInfo.clubMemberId))
      : MOCK_PAYMENT_TARGETS.filter((t) => !selectedSet.has(t.paymentTargetInfo.clubMemberId));
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
