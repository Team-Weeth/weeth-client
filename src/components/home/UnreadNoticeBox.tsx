'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { NewIcon, DeleteIcon } from '@/assets/icons';
import { useUnreadNoticeQuery } from '@/hooks/home';
import { useNoticeBoardId } from '@/hooks/board/useBoardQuery';
import { cn } from '@/lib/cn';
import { stripHtml } from '@/lib/stripHtml';
import { Icon } from '@/components/ui';
import { buildPostPath } from '@/lib/board';

export function UnreadNoticeBox() {
  const { data } = useUnreadNoticeQuery();
  const noticeBoardId = useNoticeBoardId();
  const { clubId } = useParams<{ clubId: string }>();
  const [dismissed, setDismissed] = useState(false);
  const [hidden, setHidden] = useState(false);

  if (!data || hidden) return null;

  return (
    <Link
      href={buildPostPath(clubId, data.id, noticeBoardId)}
      className={cn(
        'flex flex-col rounded-lg shadow-[0_5px_20px_0_rgba(17,33,49,0.2)] transition-all duration-300',
        dismissed && 'pointer-events-none translate-x-2 opacity-0',
      )}
      onTransitionEnd={() => dismissed && setHidden(true)}
    >
      <div className="bg-icon-normal text-icon-inverse flex items-center justify-between rounded-t-lg px-450 pt-450 pb-300">
        <p className="typo-sub1 text-icon-inverse">읽지 않은 최근 공지가 있어요</p>
        <button
          className="flex items-center justify-center"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            setDismissed(true);
          }}
        >
          <Icon src={DeleteIcon} alt="delete" size={16} />
        </button>
      </div>
      <div className="bg-container-neutral flex flex-col gap-[5px] rounded-b-lg px-450 py-400">
        <div className="flex gap-[5px]">
          <p className="typo-sub3 text-text-strong">{data.title}</p>
          <Image src={NewIcon} alt="new" width={7} height={9} />
        </div>
        <p className="typo-body2 text-text-normal line-clamp-2 w-[569px] whitespace-pre-line">
          {stripHtml(data.content)}
        </p>
      </div>
    </Link>
  );
}
