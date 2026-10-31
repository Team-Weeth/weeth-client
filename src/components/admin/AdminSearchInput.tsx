'use client';

import { useRef } from 'react';
import SearchIcon from '@/assets/icons/search.svg';
import AdminCloseIcon from '@/assets/icons/admin/ic_admin_close.svg';
import { Icon } from '@/components/ui/Icon';
import { cn } from '@/lib/cn';

interface AdminSearchInputProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

function AdminSearchInput({
  className,
  value,
  onValueChange,
  placeholder = '검색어를 입력하세요',
  ...props
}: AdminSearchInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div
      className={cn(
        'bg-container-neutral-alternative flex items-center gap-[10px] rounded-sm px-400 py-300',
        className,
      )}
      onClick={() => inputRef.current?.focus()}
      {...props}
    >
      <Icon src={SearchIcon} size={24} className="text-icon-normal shrink-0" />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        placeholder={placeholder}
        className="typo-body2 text-text-normal placeholder:text-text-alternative min-w-0 flex-1 bg-transparent focus:outline-none"
      />
      {value && (
        <button
          type="button"
          aria-label="검색어 지우기"
          className="text-icon-alternative hover:text-icon-strong flex shrink-0 cursor-pointer items-center justify-center"
          onClick={(e) => {
            e.stopPropagation();
            onValueChange('');
            inputRef.current?.focus();
          }}
        >
          <Icon src={AdminCloseIcon} size={14} />
        </button>
      )}
    </div>
  );
}

export { AdminSearchInput, type AdminSearchInputProps };
