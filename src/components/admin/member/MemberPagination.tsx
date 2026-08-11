import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';

import { Pagination, PaginationContent, PaginationItem, PaginationLink } from '@/components/ui/pagination';
import { cn } from '@/lib/cn';

const PAGE_WINDOW_SIZE = 5;

interface MemberPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function MemberPagination({ page, totalPages, onPageChange }: MemberPaginationProps) {
  const currentGroup = Math.floor((page - 1) / PAGE_WINDOW_SIZE);
  const startPage = currentGroup * PAGE_WINDOW_SIZE + 1;
  const endPage = Math.min(startPage + PAGE_WINDOW_SIZE - 1, totalPages);
  const pages = Array.from({ length: endPage - startPage + 1 }, (_, index) => startPage + index);
  const canGoPrevious = startPage > 1;
  const canGoNext = endPage < totalPages;

  return (
    <Pagination className="mt-800">
      <PaginationContent className="gap-200">
        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="이전 페이지"
            onClick={(event) => {
              event.preventDefault();
              if (canGoPrevious) onPageChange(startPage - 1);
            }}
            className={cn(
              'text-icon-alternative size-6 rounded-sm p-0 hover:bg-transparent',
              !canGoPrevious && 'pointer-events-none opacity-40',
            )}
          >
            <ChevronLeftIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>

        <div className="flex items-center gap-100">
          {pages.map((pageNumber) => (
            <PaginationItem key={pageNumber}>
              <PaginationLink
                href="#"
                isActive={pageNumber === page}
                onClick={(event) => {
                  event.preventDefault();
                  onPageChange(pageNumber);
                }}
                className={cn(
                  'typo-button1 size-6 rounded-sm p-0',
                  pageNumber === page
                    ? 'bg-button-neutral text-text-strong hover:bg-button-neutral'
                    : 'text-text-normal hover:bg-container-neutral-interaction',
                )}
              >
                {pageNumber}
              </PaginationLink>
            </PaginationItem>
          ))}
        </div>

        <PaginationItem>
          <PaginationLink
            href="#"
            aria-label="다음 페이지"
            onClick={(event) => {
              event.preventDefault();
              if (canGoNext) onPageChange(endPage + 1);
            }}
            className={cn(
              'text-icon-alternative size-6 rounded-sm p-0 hover:bg-transparent',
              !canGoNext && 'pointer-events-none opacity-40',
            )}
          >
            <ChevronRightIcon className="size-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}

export { MemberPagination, type MemberPaginationProps };
