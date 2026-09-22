import { useState } from 'react';

import type { MemberSortBy } from '@/utils/admin/memberPageUtils';

interface UseMemberListStateParams {
  resetPage: () => void;
}

function useMemberListState({ resetPage }: UseMemberListStateParams) {
  const [selectedCardinal, setSelectedCardinal] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<MemberSortBy>('cardinal');
  const [searchQuery, setSearchQuery] = useState('');

  const handleSelectCardinal = (cardinal: number | 'all') => {
    setSelectedCardinal(cardinal);
    resetPage();
  };

  const handleSearchQueryChange = (query: string) => {
    setSearchQuery(query);
    resetPage();
  };

  const toggleSort = () => {
    setSortBy((prev) => (prev === 'cardinal' ? 'name' : 'cardinal'));
  };

  const resetSearch = () => {
    setSearchQuery('');
    resetPage();
  };

  return {
    selectedCardinal,
    sortBy,
    searchQuery,
    handleSelectCardinal,
    handleSearchQueryChange,
    toggleSort,
    resetSearch,
  };
}

export { useMemberListState };
