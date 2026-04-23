'use client';

import React from 'react';
import Image from 'next/image';
import { NewIcon, ArrowRightIcon } from '@/assets/icons';
import { Divider, Icon } from '@/components/ui';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useRecentNoticesQuery } from '@/hooks/home';
import { stripHtml } from '@/lib/stripHtml';
import { EmptyBox } from './EmptyBox';
import { NoticeBoardBoxSkeleton } from './skeleton';
import { useIsAdmin } from '@/hooks/shared';

export function NoticeBoardBox() {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { data: notices = [], isLoading } = useRecentNoticesQuery();
  const { isAdmin } = useIsAdmin();

  if (isLoading) return <NoticeBoardBoxSkeleton />;

  return (
    <div className="bg-container-neutral flex flex-col rounded-lg pb-300">
      <div className="flex items-center justify-between px-450 pt-450 pb-300">
        <p className="typo-sub1 text-text-strong">공지</p>
        <button
          className="flex items-center justify-center"
          type="button"
          aria-label="공지 전체보기"
          onClick={() => router.push(`/${clubId}/board?type=NOTICE`)}
        >
          <Icon src={ArrowRightIcon} size={16} className="cursor-pointer px-1 py-[1px]" />
        </button>
      </div>
      <div className="flex flex-col px-450">
        {notices.length > 0 ? (
          notices.map((notice, index) => (
            <React.Fragment key={notice.id}>
              {index > 0 && <Divider />}
              <Link
                href={`/${clubId}/board/${notice.id}`}
                className="flex flex-col items-start gap-300 py-400"
              >
                <div className="flex flex-col gap-200">
                  <div className="flex gap-[5px]">
                    <p className="typo-sub3 text-text-strong">{notice.title}</p>
                    {notice.isNew && <Image src={NewIcon} alt="new" width={7} height={9} />}
                  </div>
                  <p className="typo-body2 text-icon-normal line-clamp-2 max-w-[268px] whitespace-pre-line">
                    {stripHtml(notice.content)}
                  </p>
                  <span className="typo-body2 text-text-alternative hover:text-text-normal w-fit text-start transition-colors">
                    전체보기
                  </span>
                </div>
              </Link>
            </React.Fragment>
          ))
        ) : isAdmin ? (
          <EmptyBox
            description="아직 공지 게시글이 없습니다."
            button={{
              label: '공지 작성하기',
              onClick: () => router.push(`/${clubId}/board/write?type=NOTICE`),
            }}
          />
        ) : (
          <EmptyBox description="공지 게시글이 없습니다" />
        )}
      </div>
    </div>
  );
}
