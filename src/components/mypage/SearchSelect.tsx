'use client';

import { useState } from 'react';
import ArrowDownIcon from '@/assets/icons/arrow_down.svg';
import { cn } from '@/lib/cn';
import { Icon, Input } from '@/components/ui';
import { useClickOutside } from '@/hooks/useClickOutside';

interface SearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showArrow?: boolean;
}

function SearchSelect({
  value,
  onChange,
  options,
  placeholder,
  className,
  inputClassName,
  showArrow = false,
}: SearchSelectProps) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const close = () => setOpen(false);
  const ref = useClickOutside<HTMLDivElement>(close);

  const filtered = [
    ...new Set(options.filter((o) => o.toLowerCase().includes(query.toLowerCase()))),
  ];

  const handleSelect = (option: string) => {
    onChange(option);
    setQuery('');
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="relative">
        <Input
          value={open ? query : value}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          placeholder={open ? '검색...' : placeholder}
          className={cn('typo-button2 rounded-lg', showArrow && 'pr-10', inputClassName)}
        />
        {showArrow && (
          <div className="pointer-events-none absolute top-1/2 right-300 flex -translate-y-1/2 items-center">
            <Icon src={ArrowDownIcon} size={20} alt="" className="text-icon-normal" />
          </div>
        )}
      </div>
      {open && filtered.length > 0 && (
        <ul className="scrollbar-custom bg-container-neutral border-container-neutral-interaction absolute z-10 mt-100 max-h-[min(200px,calc(100dvh-120px))] w-full touch-pan-y overflow-y-auto overscroll-contain rounded-lg border shadow-md [-webkit-overflow-scrolling:touch]">
          {filtered.map((option) => (
            <li
              key={option}
              onMouseDown={() => handleSelect(option)}
              className={cn(
                'typo-body2 text-text-normal cursor-pointer px-300 py-200',
                'hover:bg-container-neutral-interaction',
                option === value && 'text-brand-primary',
              )}
            >
              {option}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export { SearchSelect, type SearchSelectProps };
