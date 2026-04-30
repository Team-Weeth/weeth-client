import { CloseCircleIcon } from '@/assets/icons';
import { ClubAvatar, Icon } from '@/components/ui';
import type { Club } from '@/types';

interface ClubSelectedCardProps {
  club: Club;
  onRemove: () => void;
}

function ClubSelectedCard({ club, onRemove }: ClubSelectedCardProps) {
  return (
    <div className="border-line bg-container-neutral flex items-center justify-between rounded-[10px] border px-200 py-200">
      <div className="flex items-center gap-400">
        <ClubAvatar size={56} src={club.profileImageUrl} name={club.name} />
        <div className="flex flex-col gap-0.5">
          <span className="typo-sub3 text-text-strong">{club.name}</span>
          <span className="typo-body2 text-text-alternative">{club.description}</span>
        </div>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="text-icon-normal flex cursor-pointer items-center p-100 transition-colors"
        aria-label="선택 취소"
      >
        <Icon src={CloseCircleIcon} size={20} alt="선택 취소" />
      </button>
    </div>
  );
}

export { ClubSelectedCard };
