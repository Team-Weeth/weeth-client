'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import type { MemberRoleFilterValue } from '@/constants/member';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useMembersQuery } from '@/hooks/member/useMembersQuery';
import { cn } from '@/lib/cn';
import type { MemberPosition } from '@/types/member';
import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import { MemberFilterContainer } from './MemberFilterContainer';
import { MemberPageContentSkeleton } from './MemberCardSkeleton';
import { MemberProfileCard } from './MemberProfileCard';

function MemberPageContent() {
  const { clubId } = useParams<{ clubId: string }>();
  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });
  // TODO: 백엔드에 포지션 필드/필터가 추가되면 API 파라미터로 연결
  const [selectedPositions, setSelectedPositions] = useState<MemberPosition[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<MemberRoleFilterValue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedKeyword, setDebouncedKeyword] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

  // '운영진' 필터는 ADMIN뿐 아니라 LEAD도 포함해야 하는데, memberRole 쿼리 파라미터는 값을 하나만 받을 수 있어 서버 필터링 대신 클라이언트에서 함께 걸러낸다.
  const isAdminOnlyFilter = selectedRoles.length === 1 && selectedRoles[0] === 'ADMIN';
  const isUserOnlyFilter = selectedRoles.length === 1 && selectedRoles[0] === 'USER';

  const {
    data: members = [],
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMembersQuery(clubId, {
    cardinalNumber: activeCardinal?.cardinalNumber,
    memberRole: isUserOnlyFilter ? 'USER' : undefined,
    keyword: debouncedKeyword || undefined,
  });
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({ rootMargin: '200px' });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebouncedKeyword(searchQuery.trim()), 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  useEffect(() => {
    const handleScroll = () => {
      const currentY = window.scrollY;
      const shouldShow = currentY < 10 || currentY < lastScrollY.current;

      lastScrollY.current = currentY;

      setIsHeaderVisible((prev) => {
        if (prev === shouldShow) return prev;
        return shouldShow;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredMembers = isAdminOnlyFilter
    ? members.filter((member) => member.role === 'ADMIN' || member.role === 'LEAD')
    : members;

  return (
    <div className="tablet:px-[64px] flex flex-col self-stretch px-450 pb-[80px]">
      <div
        className={cn(
          'bg-background sticky z-40 flex flex-col pt-450 transition-[top] duration-300 ease-in-out',
          isHeaderVisible ? 'top-16' : 'top-0',
        )}
      >
        <Breadcrumb className="tablet:px-450">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage className="typo-caption1 text-text-alternative">멤버</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="tablet:px-450 flex items-center justify-between">
          <h2 className="typo-h2 text-text-normal">멤버</h2>
          <CardinalDropdown
            cardinals={cardinals}
            activeCardinal={activeCardinal}
            onSelect={setSelectedCardinalId}
          />
        </div>
        <MemberFilterContainer
          selectedPositions={selectedPositions}
          selectedRoles={selectedRoles}
          onApplyPositions={setSelectedPositions}
          onApplyRoles={setSelectedRoles}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
        />
      </div>
      {isPending ? (
        <MemberPageContentSkeleton />
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-300 py-800">
          <p className="typo-body1 text-text-alternative">멤버 목록을 불러오지 못했습니다</p>
          <button
            type="button"
            className="typo-button2 text-brand-primary"
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </div>
      ) : filteredMembers.length === 0 ? (
        <p className="typo-body1 text-text-alternative py-800 text-center">
          조건에 맞는 멤버가 없습니다.
        </p>
      ) : (
        <>
          <div className="tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-1 gap-300">
            {filteredMembers.map((member) => (
              <MemberProfileCard key={member.id} member={member} />
            ))}
          </div>
          <div ref={sentinelRef} />
        </>
      )}
    </div>
  );
}

export { MemberPageContent };
