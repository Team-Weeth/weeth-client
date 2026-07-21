'use client';

import { CheckIcon, PeopleIcon } from '@/assets/icons';
import { Avatar, AvatarFallback, AvatarImage, Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import type { ClubDto } from '@/types/mypage';

interface StepTwoContentProps {
  clubs: ClubDto[];
  selectedClubIds: string[];
  onToggleClub: (clubId: string) => void;
  onPrev: () => void;
  onConfirm: () => void;
  isSubmitting?: boolean;
  mobileFixedFooter?: boolean;
}

function StepTwoContent({
  clubs,
  selectedClubIds,
  onToggleClub,
  onPrev,
  onConfirm,
  isSubmitting = false,
  mobileFixedFooter = false,
}: StepTwoContentProps) {
  return (
    <div className="flex flex-col gap-400">
      <div className="divide-line h-[370px] divide-y">
        {clubs.map((club) => {
          const isSelected = selectedClubIds.includes(club.id);

          return (
            <button
              key={club.id}
              type="button"
              onClick={() => onToggleClub(club.id)}
              className="flex w-full items-center justify-between py-400 text-left"
            >
              <div className="flex items-center gap-300">
                <Avatar size={36} type="square">
                  <AvatarImage src={club.profileImageUrl ?? undefined} alt={club.name} />
                  <AvatarFallback variant="club" />
                </Avatar>
                <div className="flex flex-col gap-1">
                  <p className="typo-sub3 text-text-strong">{club.name}</p>
                  <div className="flex items-center gap-100">
                    <Icon src={PeopleIcon} size={16} className="text-icon-alternative" />
                    <span className="typo-caption1 text-text-alternative">
                      {club.memberCount}명
                    </span>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'flex size-[18px] items-center justify-center rounded-[5px] p-[3px]',
                  isSelected
                    ? 'border-brand-primary bg-brand-primary'
                    : 'border-icon-alternative border-[2px] bg-transparent',
                )}
              >
                {isSelected && <Icon src={CheckIcon} size={16} className="text-white" />}
              </div>
            </button>
          );
        })}
      </div>

      <div
        className={cn(
          'flex gap-200',
          mobileFixedFooter &&
            'tablet:static tablet:px-0 bg-background fixed inset-x-0 bottom-12 z-20 px-450',
        )}
      >
        <Button variant="secondary" size="lg" className="flex-1" onClick={onPrev}>
          이전
        </Button>
        <Button
          variant="primary"
          size="lg"
          className="flex-1"
          disabled={selectedClubIds.length === 0 || isSubmitting}
          onClick={onConfirm}
        >
          확인
        </Button>
      </div>
    </div>
  );
}

export { StepTwoContent, type StepTwoContentProps };
