'use client';

import Image from 'next/image';
import { cn } from '@/lib/cn';
import { SearchIcon } from '@/assets/icons';

interface MemberSearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  isWrapped?: boolean;
  isPenaltyPage?: boolean;
  value: string;
  onValueChange: (value: string) => void;
}

function MemberSearchBar({
  className,
  isWrapped = true,
  isPenaltyPage = false,
  value,
  onValueChange,
  ...props
}: MemberSearchBarProps) {
  const inputField = (
    <div className="relative w-full">
      <Image
        src={SearchIcon}
        alt="검색"
        width={20}
        height={20}
        className="absolute top-1/2 left-400 -translate-y-1/2"
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="Search for name"
        className="typo-body1 placeholder:text-text-alternative focus:outline-line focus:border-accent-foreground h-12 w-full rounded-sm border py-300 pr-300 pl-13 focus:outline-[1.5px]"
      />
    </div>
  );

  if (!isWrapped) return inputField;

  return (
    <div
      className={cn(
        'flex items-center rounded-lg bg-white px-500 py-3.75 shadow-[0px_3px_8px_0px_rgba(133,141,138,0.2)]',
        isPenaltyPage ? 'w-[63%] min-w-174' : 'mt-7.5 mb-2.5 w-full min-w-174',
        className,
      )}
      {...props}
    >
      {inputField}
    </div>
  );
}

export { MemberSearchBar, type MemberSearchBarProps };
