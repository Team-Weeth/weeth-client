'use client';

import { useState } from 'react';
import { cn } from '@/lib/cn';
import { Input } from '@/components/ui';
import { useClickOutside } from '@/hooks';

interface SearchSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}

function SearchSelect({ value, onChange, options, placeholder, className }: SearchSelectProps) {
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
      <Input
        value={open ? query : value}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder={open ? '검색...' : placeholder}
        className="rounded-lg"
      />
      {open && filtered.length > 0 && (
        <ul className="bg-container-neutral border-container-neutral-interaction absolute z-10 mt-100 max-h-[200px] w-full overflow-y-auto rounded-lg border shadow-md">
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
