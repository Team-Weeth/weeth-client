'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/cn';
import { Icon } from '@/components/ui/Icon';
import { Button } from '@/components/ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
} from '@/components/ui/pagination';
import { CalendarModalFooter } from '@/components/calendar/CalendarModalFooter';
import { usePaginationWindow } from '@/hooks/usePaginationWindow';
import { useIsTablet } from '@/hooks/useIsTablet';
import DeleteIcon from '@/assets/icons/delete.svg';
import type { AttendeeInfo } from '@/types/calendar';

const ITEMS_PER_PAGE = 8;

interface CalendarAttendeeListContentProps {
  attendees: AttendeeInfo[];
  onBack: () => void;
}

function CalendarAttendeeListContent({ attendees, onBack }: CalendarAttendeeListContentProps) {
  const isTablet = useIsTablet();

  // Desktop: page-based
  const [currentPage, setCurrentPage] = useState(1);

  // Mobile: infinite scroll
  const [mobileVisibleCount, setMobileVisibleCount] = useState(ITEMS_PER_PAGE);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Mobile: sticky header shadow
  const [tableScrolled, setTableScrolled] = useState(false);

  const mobileHasMore = mobileVisibleCount < attendees.length;

  // Desktop pagination — must be declared before any early return
  const totalPages = Math.max(1, Math.ceil(attendees.length / ITEMS_PER_PAGE));
  const pageNumbers = usePaginationWindow(currentPage, totalPages);

  useEffect(() => {
    if (isTablet || !mobileHasMore) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setMobileVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, attendees.length));
        }
      },
      { threshold: 0.1 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isTablet, mobileHasMore, attendees.length]);

  // ── Mobile: table fills screen, scrolls internally ──────────────────────
  if (!isTablet) {
    const displayedAttendees = attendees.slice(0, mobileVisibleCount);

    return (
      <div className="flex flex-1 flex-col overflow-hidden px-450 pb-800">
        <div className="border-line flex flex-1 flex-col overflow-hidden rounded-sm border">
          <div
            onScroll={(e) => setTableScrolled(e.currentTarget.scrollTop > 0)}
            className="flex-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            <Table wrapperClassName="overflow-x-visible">
              <TableHeader
                className={cn(
                  'sticky top-0 z-10',
                  tableScrolled && 'shadow-[0_1px_5px_0_rgba(17,33,49,0.15)]',
                )}
              >
                <TableRow className="bg-container-neutral-alternative hover:bg-container-neutral-alternative">
                  <TableHead className="text-text-alternative h-[48px] w-[110px]">이름</TableHead>
                  <TableHead className="text-text-alternative h-[48px] w-[138px]">학과</TableHead>
                  <TableHead className="text-text-alternative h-[48px] w-[74px]">역할</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedAttendees.map((attendee, idx) => (
                  <TableRow key={`${attendee.name}-${idx}`} className="hover:bg-container-neutral">
                    <TableCell className="h-[48px] w-[110px] py-0 pl-400">
                      <span className="typo-body2 text-text-strong truncate">{attendee.name}</span>
                    </TableCell>
                    <TableCell className="typo-body2 text-text-strong h-[48px] w-[138px] truncate">
                      {attendee.department ?? '-'}
                    </TableCell>
                    <TableCell className="typo-body2 text-text-strong h-[48px] w-[74px] truncate">
                      {attendee.position ?? '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {mobileHasMore && <div ref={sentinelRef} className="h-1 w-full" />}
          </div>
        </div>
      </div>
    );
  }

  // ── Desktop: paginated with header + footer ──────────────────────────────
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedAttendees = attendees.slice(pageStart, pageStart + ITEMS_PER_PAGE);

  return (
    <>
      <div className="flex items-center justify-between p-400">
        <h2 className="typo-sub1 text-text-strong">참석자 목록</h2>
        <button
          type="button"
          aria-label="상세 보기로 돌아가기"
          className="hover:bg-container-neutral-interaction flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors"
          onClick={onBack}
        >
          <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
        </button>
      </div>

      <div className="flex flex-col gap-400 overflow-y-auto px-700 pb-500">
        <div className="border-line overflow-hidden rounded-sm border">
          <Table>
            <TableHeader>
              <TableRow className="bg-container-neutral-alternative hover:bg-container-neutral-alternative">
                <TableHead className="text-text-alternative h-[48px] w-[175px] min-w-[128px]">
                  이름
                </TableHead>
                <TableHead className="text-text-alternative h-[48px] w-[308px] min-w-[128px]">
                  학과
                </TableHead>
                <TableHead className="text-text-alternative h-[48px] w-[124px]">역할</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedAttendees.map((attendee, idx) => (
                <TableRow
                  key={`${attendee.name}-${pageStart + idx}`}
                  className="hover:bg-container-neutral"
                >
                  <TableCell className="h-[48px] w-[175px] min-w-[128px] py-0 pl-400">
                    <div className="flex items-center gap-300">
                      <Avatar size={40} type="round">
                        {attendee.imageUrl ? (
                          <AvatarImage src={attendee.imageUrl} alt={attendee.name} />
                        ) : null}
                        <AvatarFallback variant="person" />
                      </Avatar>
                      <span className="typo-body2 text-text-strong">{attendee.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="typo-body2 text-text-strong h-[48px] w-[308px] min-w-[128px]">
                    {attendee.department ?? '-'}
                  </TableCell>
                  <TableCell className="typo-body2 text-text-strong h-[48px]">
                    {attendee.position ?? '-'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <Pagination>
            <PaginationContent>
              <PaginationItem className="mr-100">
                <PaginationPrevious
                  className={cn('size-6', currentPage <= 1 && 'pointer-events-none opacity-50')}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                />
              </PaginationItem>
              {pageNumbers.map((page) => (
                <PaginationItem key={page}>
                  <PaginationLink
                    className="size-6"
                    isActive={page === currentPage}
                    onClick={() => setCurrentPage(page)}
                  >
                    {page}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem className="ml-100">
                <PaginationNext
                  className={cn(
                    'size-6',
                    currentPage >= totalPages && 'pointer-events-none opacity-50',
                  )}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        )}
      </div>

      <CalendarModalFooter>
        <Button variant="primary" size="lg" className="w-full" onClick={onBack}>
          확인
        </Button>
      </CalendarModalFooter>
    </>
  );
}

export { CalendarAttendeeListContent, type CalendarAttendeeListContentProps };
