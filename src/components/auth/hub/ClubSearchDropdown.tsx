import Image from 'next/image';

import { cn } from '@/lib/cn';
import type { Club } from '@/types';

interface ClubSearchDropdownProps {
  clubs: Club[];
  onSelect: (club: Club) => void;
  className?: string;
}

function ClubSearchDropdown({ clubs, onSelect, className }: ClubSearchDropdownProps) {
  if (!clubs.length) return null;

  return (
    <ul
      className={cn(
        'absolute top-full right-0 left-0 z-10 mt-100',
        'bg-container-neutral flex flex-col gap-200 rounded-lg p-400',
        '[box-shadow:var(--shadow-lg)]',
        className,
      )}
    >
      {clubs.map((club) => (
        <li key={club.id}>
          <button
            type="button"
            onClick={() => onSelect(club)}
            className="border-line bg-container-neutral flex w-full cursor-pointer items-center gap-400 rounded-[10px] border px-200 py-200 transition-colors"
          >
            {club.logoUrl ? (
              <Image
                src={club.logoUrl}
                alt={club.name}
                width={40}
                height={40}
                className="shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="bg-container-neutral-alternative h-10 w-10 shrink-0 rounded-full" />
            )}
            <div className="flex flex-col items-start gap-0.5 text-left">
              <span className="typo-sub2 text-text-strong">{club.name}</span>
              <span className="typo-body2 text-text-normal">{club.description}</span>
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export { ClubSearchDropdown };
