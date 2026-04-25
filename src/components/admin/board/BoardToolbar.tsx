'use client';

import Image from 'next/image';

import { Button, Icon } from '@/components/ui';
import { AdminPlusIcon } from '@/assets/icons/admin';
// TODO: 휴지통 API 정상화되면 TrashcanIcon import 복원
import { SearchIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';

interface BoardToolbarProps extends React.HTMLAttributes<HTMLDivElement> {
  searchValue: string;
  onSearchChange: (value: string) => void;
  // TODO: 휴지통 API 정상화되면 복원
  // trashCount: number;
  // onTrashClick?: () => void;
  onCreateClick?: () => void;
}

function BoardToolbar({
  className,
  searchValue,
  onSearchChange,
  // trashCount,
  // onTrashClick,
  onCreateClick,
  ...props
}: BoardToolbarProps) {
  return (
    <div className={cn('flex flex-wrap items-center gap-300', className)} {...props}>
      {/* Search bar card */}
      <div className="bg-container-neutral flex h-20 min-w-[260px] flex-1 items-center rounded-lg px-600 py-400 shadow-sm">
        <div className="border-line relative h-12 w-full overflow-hidden rounded-sm border">
          <Image
            src={SearchIcon}
            alt="검색"
            width={24}
            height={24}
            className="absolute top-1/2 left-400 -translate-y-1/2"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="채널 이름 검색"
            className="typo-body2 placeholder:text-text-alternative text-text-normal h-full w-full py-300 pr-400 pl-13 focus:outline-none"
          />
        </div>
      </div>

      {/* Button group */}
      <div className="flex shrink-0 items-center gap-300">
        {/* TODO: 휴지통 API 정상화되면 복원
        <Button
          variant="secondary"
          size="lg"
          onClick={onTrashClick}
          aria-label={`휴지통 (${trashCount})`}
        >
          <Icon src={TrashcanIcon} size={20} className="text-text-strong mr-1" />
          <span>휴지통 ({trashCount})</span>
        </Button>
        */}
        <Button variant="primary" size="lg" onClick={onCreateClick}>
          <Icon src={AdminPlusIcon} size={20} className="text-text-inverse mr-1" />
          <span>게시판 생성</span>
        </Button>
      </div>
    </div>
  );
}

export { BoardToolbar, type BoardToolbarProps };
