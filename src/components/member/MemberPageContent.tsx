'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Dialog } from '@/components/ui/dialog';
import type { MemberRoleFilterValue } from '@/constants/member';
import { MOCK_MEMBER_PROFILES } from '@/constants/mock';
import { useCardinalSelector } from '@/hooks/useCardinalSelector';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { cn } from '@/lib/cn';
import type { MemberPosition } from '@/types/member';
import { CardinalDropdown } from '@/components/common/CardinalDropdown';
import { MemberDetailModal } from './MemberDetailModal';
import { MemberFilterContainer } from './MemberFilterContainer';
import { MemberProfileCard } from './MemberProfileCard';

function toRoleFilterValue(
  role: (typeof MOCK_MEMBER_PROFILES)[number]['role'],
): MemberRoleFilterValue {
  return role === 'USER' ? 'USER' : 'ADMIN';
}

function MemberPageContent() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const searchParams = useSearchParams();
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  const { cardinals, activeCardinal, setSelectedCardinalId } = useCardinalSelector({
    autoSelectLatest: true,
    scope: 'calendar',
  });
  const [selectedPositions, setSelectedPositions] = useState<MemberPosition[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<MemberRoleFilterValue[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(() => {
    const memberId = searchParams.get('memberId');
    return memberId ? Number(memberId) : null;
  });
  const lastScrollY = useRef(0);
  const selectedMember = MOCK_MEMBER_PROFILES.find((member) => member.id === selectedMemberId);

  const handleDialogOpenChange = (open: boolean) => {
    if (open) return;
    setSelectedMemberId(null);
    if (searchParams.get('memberId')) {
      router.replace(`/${clubId}/member`);
    }
  };

  // 데스크톱 모달이 열린 상태에서 모바일 폭으로 리사이즈되면 모바일 상세 페이지로 전환한다.
  // 라우트 자체가 바뀌므로 이 컴포넌트가 언마운트되며 모달도 함께 닫힌다.
  useEffect(() => {
    if (!isMobile || selectedMemberId === null) return;
    router.push(`/${clubId}/member/${selectedMemberId}`);
  }, [isMobile, selectedMemberId, clubId, router]);

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
          <MemberProfileCard key={member.id} member={member} onSelectMember={setSelectedMemberId} />
        ))}
      </div>
      <Dialog open={selectedMember !== undefined} onOpenChange={handleDialogOpenChange}>
        {selectedMember && <MemberDetailModal member={selectedMember} />}
      </Dialog>
    </div>
  );
}

export { MemberPageContent };
