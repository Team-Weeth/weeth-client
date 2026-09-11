'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import type { MemberRoleFilterValue } from '@/constants/member';
import { MOCK_MEMBER_PROFILES } from '@/constants/mock';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { cn } from '@/lib/cn';
import type { MemberPosition } from '@/types/member';
import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import { MemberFilterContainer } from './MemberFilterContainer';
import { MemberProfileCard } from './MemberProfileCard';

function toRoleFilterValue(
  role: (typeof MOCK_MEMBER_PROFILES)[number]['role'],
): MemberRoleFilterValue {
  return role === 'USER' ? 'USER' : 'ADMIN';
}

function MemberPageContent() {
  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });
  const [selectedPositions, setSelectedPositions] = useState<MemberPosition[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<MemberRoleFilterValue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const lastScrollY = useRef(0);

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

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredMembers = MOCK_MEMBER_PROFILES.filter((member) => {
    const matchesPosition =
      selectedPositions.length === 0 || selectedPositions.includes(member.position);
    const matchesRole =
      selectedRoles.length === 0 || selectedRoles.includes(toRoleFilterValue(member.role));
    const matchesQuery =
      normalizedQuery === '' || member.name.toLowerCase().includes(normalizedQuery);
    return matchesPosition && matchesRole && matchesQuery;
  });

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
      <div className="tablet:grid-cols-3 desktop:grid-cols-4 grid grid-cols-1 gap-300">
        {filteredMembers.map((member) => (
          <MemberProfileCard key={member.id} member={member} />
        ))}
      </div>
    </div>
  );
}

export { MemberPageContent };
