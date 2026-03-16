'use client';

import React, { useState } from 'react';

import { AdminMeatballIcon } from '@/assets/icons/admin';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';

interface GenerationDropdownProps {
  generations: number[];
  selectedLabel: string;
  onSelectGeneration: (gen: number) => void;
  onSelectDirect: () => void;
}

function GenerationDropdown({
  generations,
  selectedLabel,
  onSelectGeneration,
  onSelectDirect,
}: GenerationDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleSelectGeneration = (gen: number) => {
    onSelectGeneration(gen);
    setOpen(false);
  };

  const handleSelectDirect = () => {
    onSelectDirect();
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        className={cn(
          'bg-button-neutral flex h-12 w-36 cursor-pointer items-center justify-between rounded-sm px-400',
          'text-text-strong typo-body2',
        )}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span className="typo-button2 truncate">{selectedLabel}</span>
        <Icon src={AdminMeatballIcon} alt="옵션" size={24} />
      </button>

      {open && (
        <div className="bg-container-neutral absolute top-full right-0 z-10 mt-100 w-36 overflow-hidden rounded-sm shadow-lg">
          <button
            type="button"
            className={cn(
              'typo-body2 text-text-normal hover:bg-container-neutral-interaction w-full cursor-pointer px-400 py-300 text-left',
              selectedLabel === '직접 입력' && 'text-brand-primary',
            )}
            onClick={handleSelectDirect}
          >
            직접 입력
          </button>
          {generations.map((gen) => (
            <button
              key={gen}
              type="button"
              className={cn(
                'typo-body2 text-text-normal hover:bg-container-neutral-interaction w-full cursor-pointer px-400 py-300 text-left',
                selectedLabel === `${gen}기` && 'text-brand-primary',
              )}
              onClick={() => handleSelectGeneration(gen)}
            >
              {gen}기
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export { GenerationDropdown, type GenerationDropdownProps };
