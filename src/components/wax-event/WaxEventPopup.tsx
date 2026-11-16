'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import DeleteIcon from '@/assets/icons/delete.svg';
import KeyVisual from '@/assets/image/wax-event/popup_key_visual.png';
import { buttonVariants } from '@/components/ui/Button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '@/components/ui/dialog';
import { Icon } from '@/components/ui/Icon';
import { WAX_EVENT_COPY, getWaxEventPath } from '@/constants/waxEvent';
import { useWaxEventPopupHidden } from '@/hooks/useWaxEventDismissal';
import { cn } from '@/lib/cn';
import { useClubFeatures } from '@/providers/club-feature-provider';

/**
 * 홈에 들어오면 화면 가운데 뜨는 왁뿌볼 이벤트 팝업.
 * X·딤·ESC는 이번만 닫고(다음 홈 진입 때 다시 뜸), 아래 버튼은 24시간 동안 숨긴다.
 */
function WaxEventPopup() {
  const { clubId } = useParams<{ clubId: string }>();
  const { waxEventEnabled } = useClubFeatures();
  const { hidden, hideForHours } = useWaxEventPopupHidden();
  const [dismissed, setDismissed] = useState(false);

  const open = waxEventEnabled && !hidden && !dismissed;

  return (
    <Dialog open={open} onOpenChange={(next) => !next && setDismissed(true)}>
      <DialogContent
        showCloseButton={false}
        // 열릴 때 X 버튼에 포커스 링이 생기지 않게 한다. 포커스는 여전히 팝업 안에 갇힌다.
        onOpenAutoFocus={(event) => event.preventDefault()}
        className="flex w-[339px] max-w-[calc(100%-36px)] flex-col gap-0 rounded-none border-0 bg-transparent p-0 shadow-none drop-shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
      >
        <div className="bg-container-neutral flex flex-col overflow-hidden rounded-lg">
          <div className="relative aspect-square w-full">
            <Image
              src={KeyVisual}
              alt={WAX_EVENT_COPY.bannerTitle}
              fill
              sizes="339px"
              priority
              className="object-cover"
            />
            <DialogClose
              aria-label="닫기"
              className="bg-button-neutral hover:bg-button-neutral-interaction text-icon-normal absolute top-450 right-450 flex size-6 cursor-pointer items-center justify-center rounded-sm"
            >
              <Icon src={DeleteIcon} size={16} />
            </DialogClose>
          </div>
          <div className="flex flex-col gap-200 px-400 pt-400">
            <DialogTitle className="typo-sub1 text-text-strong">
              {WAX_EVENT_COPY.popupTitle}
            </DialogTitle>
            <DialogDescription className="typo-caption2 text-text-alternative">
              {WAX_EVENT_COPY.popupDescription}
            </DialogDescription>
          </div>
          <div className="p-400">
            <Link
              href={getWaxEventPath(clubId)}
              className={cn(buttonVariants({ variant: 'primary', size: 'lg' }), 'w-full')}
            >
              {WAX_EVENT_COPY.popupCta}
            </Link>
          </div>
        </div>
        <div className="px-450">
          <button
            type="button"
            onClick={hideForHours}
            className="typo-button2 text-text-alternative cursor-pointer py-200 underline"
          >
            24시간동안 보이지 않기
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export { WaxEventPopup };
