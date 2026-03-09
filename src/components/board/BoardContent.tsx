'use client';

import { useState } from 'react';
import { BoardNav } from '@/components/board';
import type { BoardNavItem } from '@/components/board';
import { PostCard } from '@/components/board/PostCard';

const MOCK_CHANNELS: BoardNavItem[] = [
  { id: 'notice', label: '공지', type: 'notice' },
  { id: 'all', label: '전체', type: 'channel' },
  { id: 'study-fe', label: '[스터디 게시판] FE', type: 'channel' },
  { id: 'study-be', label: '[스터디 게시판] BE', type: 'channel' },
  { id: 'be', label: 'BE', type: 'channel' },
  { id: 'd', label: 'D', type: 'channel' },
  { id: 'pm', label: 'PM', type: 'channel' },
];

const MOCK_POST = {
  author: {
    name: '김위드',
    profileImageUrl: '',
  },
  date: '00/00',
  title: '이번주는 중간고사로 쉬어갑니다',
  content: `8줄 이상일 때는 이렇게 표시돼요.
  오늘 훈련은 개인적으로 좀 많이 아쉬웠습니다.

초반 기본기 훈련에서는 괜찮았는데,
스파링 들어가니까 긴장해서 그런지 자꾸 먼저 물러나게 되더라고요.
머리 타격 타이밍도 몇 번 잡았는데 망설이다가 놓쳤고요.

끝나고 생각해보니까
상대를 이기겠다는 생각보다 "맞지 말아야지"라는 생각이 더 컸던 것 같아요\u2026.`,
  isNew: true,
  hasAttachment: true,
  images: [
    {
      id: '1',
      file: new File([], ''),
      fileName: 'kendo-1.jpg',
      fileUrl: 'https://placehold.co/280x280',
      uploaded: true,
    },
    {
      id: '2',
      file: new File([], ''),
      fileName: 'kendo-2.jpg',
      fileUrl: 'https://placehold.co/280x280',
      uploaded: true,
    },
    {
      id: '3',
      file: new File([], ''),
      fileName: 'kendo-3.jpg',
      fileUrl: 'https://placehold.co/280x280',
      uploaded: true,
    },
  ],
  likeCount: 2,
  commentCount: 2,
};

function BoardContent() {
  const [activeChannelId, setActiveChannelId] = useState('all');

  // TODO: API 연동 시 activeChannelId 기반으로 게시글 목록 조회
  const posts = Array.from({ length: 5 }, (_, i) => ({
    ...MOCK_POST,
    id: String(i),
  }));

  return (
    <div className="flex items-start gap-300 self-stretch px-450 pt-450 pb-300">
      <aside className="shrink-0">
        <BoardNav
          items={MOCK_CHANNELS}
          activeId={activeChannelId}
          onItemSelect={setActiveChannelId}
        />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-400">
        {posts.map((post) => (
          <PostCard key={post.id} {...post} />
        ))}
      </main>
    </div>
  );
}

export { BoardContent };
