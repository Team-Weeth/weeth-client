import DeleteIcon from '@/assets/icons/delete.svg';
import { DialogClose, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import type { MemberProfile } from '@/types/member';
import { MemberDetailBody } from './MemberDetailBody';

interface MemberDetailModalProps {
  member: MemberProfile;
}

function MemberDetailModal({ member }: MemberDetailModalProps) {
  return (
    <DialogContent
      showCloseButton={false}
      className="bg-background w-full max-w-[min(918px,calc(100%-2rem))] overflow-hidden rounded-lg p-400"
    >
      <div className="flex items-center justify-between gap-300 pb-400">
        <DialogTitle className="typo-sub1 text-text-strong">멤버 상세</DialogTitle>
        <DialogClose className="cursor-pointer">
          <Icon src={DeleteIcon} size={24} className="text-icon-normal" alt="닫기" />
        </DialogClose>
      </div>
      <MemberDetailBody member={member} />
    </DialogContent>
  );
}

export { MemberDetailModal, type MemberDetailModalProps };
