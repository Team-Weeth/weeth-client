import Image from 'next/image';

import { CloseCircleIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import type { Club } from '@/types';

interface ClubSelectedCardProps {
  club: Club;
  onRemove: () => void;
}

function ClubSelectedCard({ club, onRemove }: ClubSelectedCardProps) {
  return (
    <div className="border-line flex items-center justify-between rounded-[10px] border bg-container-neutral px-400 py-200">
      <div className="flex items-center gap-400">
        {club.logoUrl ? (
          <Image
            src={club.logoUrl}
            alt={club.name}
            width={40}
            height={40}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="bg-container-neutral-alternative h-10 w-10 shrink-0 rounded-full" />
        )}
        <div className="flex flex-col gap-0.5">
          <span className="typo-sub2 text-text-strong">{club.name}</span>
          <span className="typo-body2 text-text-alternative">{club.description}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="flex cursor-pointer items-center p-100 text-icon-alternative transition-colors hover:text-icon-normal"
        aria-label="선택 취소"
      >
        <Icon src={CloseCircleIcon} size={20} alt="선택 취소" className="text-icon-alternative" />
      </button>
    </div>
  );
}

export { ClubSelectedCard };
