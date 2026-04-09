'use client';

import Image from 'next/image';
import { useState } from 'react';
import { NewIcon, DeleteIcon } from '@/assets/icons';
import { useUnreadNoticeQuery } from '@/hooks/home';
import { cn } from '@/lib/cn';

export function UnreadNoticeBox() {
  const { data } = useUnreadNoticeQuery();
  const [dismissed, setDismissed] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (!data || hidden) return null;

  return (
    <div
      className={cn(
        'flex flex-col rounded-lg shadow-[0_5px_20px_0_rgba(17,33,49,0.2)] transition-all duration-300',
        dismissed && 'translate-x-2 opacity-0',
      )}
      onTransitionEnd={() => dismissed && setHidden(true)}
    >
      <div className="bg-icon-normal text-icon-inverse flex items-center justify-between rounded-t-lg px-450 pt-450 pb-300">
        <p className="typo-sub1 text-icon-inverse">읽지 않은 최근 공지가 있어요</p>
        <button type="button" onClick={() => setDismissed(true)}>
          <Image src={DeleteIcon} alt="delete" width={16} height={16} className="cursor-pointer" />
        </button>
      </div>
      <div className="bg-container-neutral flex flex-col gap-[5px] rounded-b-lg px-450 py-400">
        <div className="flex gap-[5px]">
          <p className="typo-sub2 text-text-strong">{data.title}</p>
          <Image src={NewIcon} alt="new" width={9} height={12} />
        </div>
        <p className="typo-button2 text-text-normal w-[604px]">{data.content}</p>
      </div>
    </div>
  );
}
