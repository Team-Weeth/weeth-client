import { useState } from 'react';

import type { Member } from '@/types/admin/member';
import { filterMembers, sortMembers, type MemberSortBy } from '@/utils/admin/memberPageUtils';

interface UseMemberListStateParams {
  members: Member[];
  resetPage: () => void;
}

function useMemberListState({ members, resetPage }: UseMemberListStateParams) {
  const [selectedCardinal, setSelectedCardinal] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<MemberSortBy>('cardinal');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = sortMembers(
    filterMembers(members, selectedCardinal, searchQuery),
    sortBy,
  );

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
    filteredMembers,
    handleSelectCardinal,
    handleSearchQueryChange,
    toggleSort,
    resetSearch,
  };
}

export { useMemberListState };
