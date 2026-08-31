'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { cn } from '@/lib/cn';

/** 페이지 번호를 몇 개씩 묶어서 보여줄지 (예: 5 → 1~5, 6~10) */
const PAGE_WINDOW_SIZE = 5;

interface DuesPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function DuesPagination({ page, totalPages, onPageChange }: DuesPaginationProps) {
  // 현재 페이지가 속한 묶음(0-base)을 구해 해당 묶음의 시작/끝 페이지만 노출한다.
  const currentGroup = Math.floor((page - 1) / PAGE_WINDOW_SIZE);
  const startPage = currentGroup * PAGE_WINDOW_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_WINDOW_SIZE - 1, totalPages);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(startPage - 1);
            }}
            className={cn(currentGroup === 0 && 'pointer-events-none opacity-40')}
          />
        </PaginationItem>
        {pages.map((p) => (
          <PaginationItem key={p}>
            <PaginationLink
              href="#"
              isActive={p === page}
              onClick={(e) => {
                e.preventDefault();
                onPageChange(p);
              }}
            >
              {p}
            </PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(endPage + 1);
            }}
            className={cn(endPage === totalPages && 'pointer-events-none opacity-40')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { DuesPagination, type DuesPaginationProps };
