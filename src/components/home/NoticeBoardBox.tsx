'use client';

import React from 'react';
import Image from 'next/image';
import { NewIcon, ArrowRightIcon } from '@/assets/icons';
import { Tag, Divider, type TagProps } from '@/components/ui';
import { useRouter } from 'next/navigation';

interface NoticeItem {
  id: number;
  tag: { label: string; variant: TagProps['variant'] };
  title: string;
  content: string;
  isNew: boolean;
}

const MOCK_NOTICES: NoticeItem[] = [
  {
    id: 1,
    tag: { label: '공지', variant: 'notice' },
    title: '이번주는 중간고사로 쉬어갑니다',
    content:
      '여러분 벌써 중간고사가 다가왔습니다. 다들 열심히 시험공부 잘 하고 계신가요? 릿츠 4기와 함께한지도 벌써 4주가 지났습니다. 앞으로도 응원',
    isNew: true,
  },
  {
    id: 2,
    tag: { label: '공지', variant: 'notice' },
    title: '이번주는 중간고사로 쉬어갑니다',
    content:
      '여러분 벌써 중간고사가 다가왔습니다. 다들 열심히 시험공부 잘 하고 계신가요? 릿츠 4기와 함께한지도 벌써 4주가 지났습니다. 앞으로도 응원',
    isNew: true,
  },
  {
    id: 3,
    tag: { label: '공지', variant: 'notice' },
    title: '이번주는 중간고사로 쉬어갑니다',
    content:
      '여러분 벌써 중간고사가 다가왔습니다. 다들 열심히 시험공부 잘 하고 계신가요? 릿츠 4기와 함께한지도 벌써 4주가 지났습니다. 앞으로도 응원',
    isNew: false,
  },
];

export function NoticeBoardBox() {
  const router = useRouter();

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
        {MOCK_NOTICES.map((notice, index) => (
          <React.Fragment key={notice.id}>
            {index > 0 && <Divider />}
            <div className="flex flex-col items-start gap-300 py-400">
              <Tag variant={notice.tag.variant}>{notice.tag.label}</Tag>
              <div className="flex flex-col gap-200">
                <div className="flex gap-[5px]">
                  <p className="typo-sub2 text-text-strong">{notice.title}</p>
                  {notice.isNew && <Image src={NewIcon} alt="new" width={9} height={12} />}
                </div>
                <p className="typo-body2 text-icon-normal line-clamp-2 max-w-[268px]">
                  {notice.content}
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
