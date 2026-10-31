'use client';

import { useEffect, useRef, useState } from 'react';

import SearchIcon from '@/assets/icons/search.svg';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface SearchBarProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** true: expand/collapse 애니메이션 (기존 MemberSearchBar 동작), false: 항상 펼침 */
  expandable?: boolean;
}

function SearchBar({
  className,
  value,
  onValueChange,
  placeholder = '이름, 역할, 학과...',
  expandable = false,
  ...props
}: SearchBarProps) {
  const [isOpen, setIsOpen] = useState(!expandable);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (expandable && isOpen) inputRef.current?.focus();
  }, [expandable, isOpen]);

  const handleOpen = () => {
    if (expandable) setIsOpen(true);
  };

  const handleClose = () => {
    onValueChange('');
    if (expandable) setIsOpen(false);
  };

  if (expandable) {
    return (
      <div
        className={cn(
          'flex h-[34px] items-center justify-end overflow-hidden rounded-[10px] border transition-[width,background-color,border-color] duration-300 ease-out',
          isOpen
            ? 'border-line bg-container-neutral-alternative w-[320px] px-[11px] py-200'
            : 'w-9 border-transparent bg-transparent px-0 py-0',
          className,
        )}
        data-open={isOpen}
        {...props}
      >
        <button
          type="button"
          aria-label="검색"
          className={cn(
            'text-icon-normal tablet:text-icon-alternative hover:text-icon-strong flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-sm transition-colors',
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
          placeholder={placeholder}
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

  return (
    <div
      className={cn(
        'border-line bg-container-neutral flex items-center rounded-[10px] border px-[10px] py-[7px] focus-within:border-neutral-800',
        className,
      )}
      {...props}
    >
      <Icon src={SearchIcon} size={16} className="text-icon-alternative" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="typo-body2 text-text-normal placeholder:text-text-disabled min-w-0 flex-1 bg-transparent py-[2px] pl-200 focus:outline-none"
      />
      <button
        type="button"
        aria-label="검색어 지우기"
        className="text-icon-alternative hover:text-icon-strong flex size-[18px] shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-sm opacity-100 transition-[width,height,opacity,color]"
        onClick={handleClose}
      >
        <Icon src={AdminCloseIcon} size={14} />
      </button>
    </div>
  );
}

export { SearchBar, type SearchBarProps };
