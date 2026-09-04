'use client';

import { useState } from 'react';
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
import DeleteIcon from '@/assets/icons/delete.svg';
import type { AttendeeInfo } from '@/types/calendar';

const ITEMS_PER_PAGE = 8;

interface CalendarAttendeeListContentProps {
  attendees: AttendeeInfo[];
  onBack: () => void;
}

function CalendarAttendeeListContent({ attendees, onBack }: CalendarAttendeeListContentProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(attendees.length / ITEMS_PER_PAGE));
  const pageStart = (currentPage - 1) * ITEMS_PER_PAGE;
  const pagedAttendees = attendees.slice(pageStart, pageStart + ITEMS_PER_PAGE);
  const pageWindowStart = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + 4);
  const pageNumbers = Array.from(
    { length: pageWindowEnd - pageWindowStart + 1 },
    (_, i) => pageWindowStart + i,
  );

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between p-400">
        <h2 className="typo-sub1 text-text-strong">참석자 목록</h2>
        <button
          type="button"
          aria-label="닫기"
          className="hover:bg-container-neutral-interaction flex size-[40px] shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors"
          onClick={onBack}
        >
          <Icon src={DeleteIcon} size={24} className="text-icon-normal" />
        </button>
      </div>

      {/* Body */}
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
                <TableHead className="text-text-alternative h-[48px] w-[124px]">직급</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pagedAttendees.map((attendee) => (
                <TableRow key={attendee.name} className="hover:bg-container-neutral">
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

      {/* Footer */}
      <div className="px-400 pb-400">
        <div className="border-line border-t pt-[10px]">
          <Button variant="primary" size="lg" className="w-full" onClick={onBack}>
            확인
          </Button>
        </div>
      </div>
    </>
  );
}

export { CalendarAttendeeListContent, type CalendarAttendeeListContentProps };
