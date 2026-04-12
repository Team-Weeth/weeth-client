'use client';

import React from 'react';
import Image from 'next/image';
import { NewIcon, ArrowRightIcon } from '@/assets/icons';
import { Divider } from '@/components/ui';
import { useRouter } from 'next/navigation';
import { useRecentNoticesQuery } from '@/hooks/home';
import { stripHtml } from '@/lib/stripHtml';

export function NoticeBoardBox() {
  const router = useRouter();
  const { data: notices = [] } = useRecentNoticesQuery();

  return (
    <div className="bg-container-neutral flex flex-col rounded-lg pb-300">
      <div className="flex items-center justify-between p-450">
        <p className="typo-sub1 text-text-strong">공지</p>
        <button type="button" aria-label="공지 전체보기" onClick={() => router.push('/notice')}>
          <Image
            src={ArrowRightIcon}
            alt=""
            aria-hidden="true"
            width={16}
            height={16}
            className="cursor-pointer px-[6px] py-1"
          />
        </button>
      </div>
      <div className="flex flex-col px-450">
        {notices.map((notice, index) => (
          <React.Fragment key={notice.id}>
            {index > 0 && <Divider />}
            <div className="flex flex-col items-start gap-300 py-400">
              <div className="flex flex-col gap-200">
                <div className="flex gap-[5px]">
                  <p className="typo-sub2 text-text-strong">{notice.title}</p>
                  {notice.isNew && <Image src={NewIcon} alt="new" width={9} height={12} />}
                </div>
                <p className="typo-body2 text-icon-normal line-clamp-2 max-w-[268px]">
                  {stripHtml(notice.content)}
                </p>
                <button
                  type="button"
                  className="typo-body2 text-text-alternative w-fit cursor-pointer text-start"
                  onClick={() => router.push('/board')}
                >
                  전체보기
                </button>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
