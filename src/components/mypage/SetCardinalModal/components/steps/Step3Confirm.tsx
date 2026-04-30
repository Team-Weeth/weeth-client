import { Avatar, AvatarFallback, AvatarImage, Divider, Icon } from '@/components/ui';
import { InfoIcon } from '@/assets/icons';
import type { ClubDto } from '@/types/mypage';
import { CardinalTags } from './Step2Select';

interface Step3ConfirmProps {
  club: ClubDto;
  selected: number[];
}

function Step3Confirm({ club, selected }: Step3ConfirmProps) {
  return (
    <div className="flex flex-col gap-300 px-400 py-400">
      <div className="bg-container-neutral flex flex-col gap-300 rounded-lg px-450 pt-5.5 pb-450">
        <div className="flex items-center gap-4 px-200">
          <Avatar size={64} type="square" className="border-line border">
            <AvatarImage src={club.profileImageUrl ?? undefined} alt={club.name} />
            <AvatarFallback variant="club" />
          </Avatar>
          <div className="flex flex-col gap-[2px]">
            <p className="typo-sub1 text-text-strong">{club.name}</p>
            {club.description && <p className="typo-body2 text-text-normal">{club.description}</p>}
          </div>
        </div>
        <div>
          <Divider />
          <div className="flex flex-col gap-200 px-2.5 pt-450">
            <span className="typo-sub3 text-text-alternative">활동 기수</span>
            <CardinalTags cardinals={selected} />
          </div>
        </div>
      </div>
      <div className="bg-state-caution/10 flex items-start gap-200 rounded-md p-300">
        <Icon src={InfoIcon} size={20} className="text-state-caution size-[20px] shrink-0" />
        <p className="typo-body2 text-text-strong">확정 후에는 수정할 수 없습니다.</p>
      </div>
    </div>
  );
}

export { Step3Confirm, type Step3ConfirmProps };
