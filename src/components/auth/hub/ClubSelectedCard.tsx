import { CloseCircleIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Icon } from '@/components/ui';
import type { Club } from '@/types';

interface ClubSelectedCardProps {
  club: Club;
  onRemove: () => void;
}

function ClubSelectedCard({ club, onRemove }: ClubSelectedCardProps) {
  return (
    <div className="border-line bg-container-neutral flex items-center justify-between rounded-[10px] border px-400 py-200">
      <div className="flex items-center gap-400">
        <Avatar
          size={64}
          type="square"
          className="border-line h-10 w-10 shrink-0 rounded-lg border"
        >
          {club.logoUrl && (
            <AvatarImage src={club.logoUrl} alt={club.name} className="object-cover" />
          )}
          <AvatarFallback className="bg-container-neutral-alternative text-text-alternative rounded-lg">
            {club.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-0.5">
          <span className="typo-sub2 text-text-strong">{club.name}</span>
          <span className="typo-body2 text-text-alternative">{club.description}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-icon-alternative hover:text-icon-normal flex cursor-pointer items-center p-100 transition-colors"
        aria-label="선택 취소"
      >
        <Icon src={CloseCircleIcon} size={20} alt="선택 취소" className="text-icon-alternative" />
      </button>
    </div>
  );
}

export { ClubSelectedCard };
