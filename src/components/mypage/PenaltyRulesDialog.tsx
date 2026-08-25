'use client';

import { DeleteIcon, TooltipIcon } from '@/assets/icons';
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Icon,
} from '@/components/ui';
import { useMyClubsQuery } from '@/hooks/queries/mypage/useMyPageQueries';
import { useMyPagePenaltyRuleQuery } from '@/hooks/queries/mypage/useMyPagePenaltyRuleQuery';

interface PenaltyRulesDialogProps {
  clubId: string;
}

function PenaltyRulesDialog({ clubId }: PenaltyRulesDialogProps) {
  const { data: content } = useMyPagePenaltyRuleQuery(clubId);
  const { data: clubs } = useMyClubsQuery();
  const clubName = clubs?.find((club) => club.id === clubId)?.name ?? '';

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button type="button" className="flex items-center justify-center">
          <Icon src={TooltipIcon} size={20} className="text-icon-alternative" />
        </button>
      </DialogTrigger>
      <DialogContent showCloseButton={false} className="w-[508px]">
        <DialogTitle className="sr-only">페널티 규정</DialogTitle>
        <div className="mb-400 flex w-full justify-between gap-300">
          <div className="flex flex-col">
            <Icon src={TooltipIcon} size={20} className="text-icon-alternative mb-300" />
            <div className="flex flex-col gap-200">
              <p className="typo-sub1 text-text-strong">페널티 규정</p>
              <p className="typo-body2 text-text-alternative">{clubName}의 페널티 규정이에요.</p>
            </div>
          </div>
          <DialogClose asChild>
            <button type="button" className="cursor-pointer self-start">
              <Icon src={DeleteIcon} size={24} className="text-icon-normal" alt="닫기" />
            </button>
          </DialogClose>
        </div>
        <div className="tablet:max-h-[386px] mb-400 flex max-h-[50vh] flex-col overflow-y-auto">
          <p className="typo-body1 text-text-normal whitespace-pre-wrap">{content}</p>
        </div>
        <div className="bg-line h-[1px] w-full" />
        <div className="mt-[10px] flex w-full">
          <DialogClose asChild>
            <Button variant="secondary" className="w-full">
              확인
            </Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { PenaltyRulesDialog, type PenaltyRulesDialogProps };
