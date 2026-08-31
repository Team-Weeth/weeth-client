'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import NewIcon from '@/assets/icons/new.svg';
import { useRecentNoticesQuery } from '@/hooks/home/useRecentNoticesQuery';
import { stripHtml } from '@/lib/stripHtml';
import { buildPostPath } from '@/lib/board';

export function UnreadNoticeBox() {
  const { data } = useRecentNoticesQuery(1);
  const { clubId } = useParams<{ clubId: string }>();
  const latestNotice = data?.[0] ?? null;

  if (!latestNotice) return null;

  return (
    <Link
      href={buildPostPath(clubId, latestNotice.id, latestNotice.boardId)}
      className="flex min-w-0 flex-col rounded-lg shadow-[0_5px_20px_0_rgba(17,33,49,0.2)]"
    >
      <div className="bg-icon-normal text-icon-inverse flex items-center rounded-t-lg px-450 pt-450 pb-300">
        <p className="typo-sub1 text-icon-inverse">최신 공지를 확인해보세요</p>
      </div>
      <div className="bg-container-neutral flex min-w-0 flex-col gap-[5px] rounded-b-lg px-450 py-400">
        <div className="flex min-w-0 gap-[5px]">
          <p className="typo-sub3 text-text-strong min-w-0 truncate">{latestNotice.title}</p>
          {latestNotice.isNew && <Image src={NewIcon} alt="new" width={7} height={9} />}
        </div>
        <p className="typo-body2 text-text-normal line-clamp-2 w-full min-w-0 whitespace-pre-line">
          {stripHtml(latestNotice.content)}
        </p>
      </div>
    </Link>
  );
}
