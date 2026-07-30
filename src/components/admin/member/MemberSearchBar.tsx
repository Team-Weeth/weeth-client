'use client';

import { useEffect, useRef, useState } from 'react';

import { SearchIcon } from '@/assets/icons';
import { AdminCloseIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface MemberSearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
}

function MemberSearchBar({ className, value, onValueChange, ...props }: MemberSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  const handleOpen = () => setIsOpen(true);

  const handleClose = () => {
    onValueChange('');
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        'flex h-[34px] items-center justify-end overflow-hidden rounded-[10px] border transition-[width,background-color,border-color] duration-300 ease-out',
        isOpen
          ? 'border-line bg-container-neutral-alternative w-[320px] px-[11px] py-200'
          : 'w-9 border-transparent bg-transparent px-0 py-0',
        className,
      )}
      {...props}
    >
      <button
        type="button"
        aria-label="멤버 검색"
        className={cn(
          'text-icon-alternative hover:text-icon-strong flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors',
          isOpen && 'size-4',
        )}
        onClick={handleOpen}
      >
        <Icon src={SearchIcon} size={isOpen ? 16 : 20} />
      </button>

      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder="이름, 역할, 학과..."
        className={cn(
          'typo-body2 text-text-normal placeholder:text-text-disabled min-w-0 flex-1 bg-transparent py-[2px] pl-200 focus:outline-none',
          !isOpen && 'pointer-events-none w-0 flex-none p-0 opacity-0',
        )}
        tabIndex={isOpen ? 0 : -1}
      />

      <button
        type="button"
        aria-label="검색어 지우기"
        className={cn(
          'text-icon-alternative hover:text-icon-strong flex shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm transition-[width,height,opacity,color]',
          isOpen ? 'size-[18px] opacity-100' : 'pointer-events-none size-0 opacity-0',
        )}
        onClick={handleClose}
      >
        <Icon src={AdminCloseIcon} size={14} />
      </button>
    </div>
  );
}

export { MemberSearchBar, type MemberSearchBarProps };
