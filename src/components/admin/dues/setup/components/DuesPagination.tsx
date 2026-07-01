'use client';

import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui';
import { cn } from '@/lib/cn';

interface DuesPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function DuesPagination({ page, totalPages, onPageChange }: DuesPaginationProps) {
  return (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onPageChange(Math.max(1, page - 1));
            }}
            className={cn(page === 1 && 'pointer-events-none opacity-40')}
          />
        </PaginationItem>
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
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
              onPageChange(Math.min(totalPages, page + 1));
            }}
            className={cn(page === totalPages && 'pointer-events-none opacity-40')}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { DuesPagination, type DuesPaginationProps };
