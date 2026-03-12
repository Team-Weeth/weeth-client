'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { StaticImageData } from 'next/image';
import { MoreVerticalIcon } from '@/assets/icons';
import { BoardNav, type BoardNavItem } from './BoardNav';
import { PostCard } from './PostCard';

const MOCK_CHANNELS: BoardNavItem[] = [
  { id: 'notice', label: '공지', type: 'notice' },
  { id: 'all', label: '전체', type: 'channel' },
  { id: 'study-fe', label: '[스터디 게시판] FE', type: 'channel' },
  { id: 'study-be', label: '[스터디 게시판] BE', type: 'channel' },
  { id: 'be', label: 'BE', type: 'channel' },
  { id: 'd', label: 'D', type: 'channel' },
  { id: 'pm', label: 'PM', type: 'channel' },
];

const MOCK_IMAGES = [
  {
    id: '1',
    file: new File([], ''),
    fileName: 'kendo-1.jpg',
    fileUrl: 'https://placehold.co/400x280',
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
    fileUrl: 'https://placehold.co/200x300',
    uploaded: true,
  },
];

const MOCK_CONTENT = `8줄 이상일 때는 이렇게 표시돼요.
  오늘 훈련은 개인적으로 좀 많이 아쉬웠습니다.

초반 기본기 훈련에서는 괜찮았는데,
스파링 들어가니까 긴장해서 그런지 자꾸 먼저 물러나게 되더라고요.
머리 타격 타이밍도 몇 번 잡았는데 망설이다가 놓쳤고요.

끝나고 생각해보니까
상대를 이기겠다는 생각보다 "맞지 말아야지"라는 생각이 더 컸던 것 같아요\u2026.`;

// TODO: API 연결 시 Post 타입을 types/board.ts로 분리
const MOCK_POSTS = [
  {
    id: '0',
    author: { name: '김위드', profileImageUrl: '' },
    date: '00/00',
    title: '이번주는 중간고사로 쉬어갑니다',
    content: MOCK_CONTENT,
    isNew: true,
    hasAttachment: true,
    images: MOCK_IMAGES,
    likeCount: 2,
    commentCount: 2,
    isMyPost: true,
  },
  {
    id: '1',
    author: { name: '김위드', profileImageUrl: '' },
    date: '00/00',
    title: '이번주는 중간고사로 쉬어갑니다',
    content: MOCK_CONTENT,
    isNew: true,
    hasAttachment: true,
    images: MOCK_IMAGES,
    likeCount: 2,
    commentCount: 2,
    isMyPost: false,
  },
  {
    id: '2',
    author: { name: '김위드', profileImageUrl: '' },
    date: '00/00',
    title: '이번주는 중간고사로 쉬어갑니다',
    content: MOCK_CONTENT,
    isNew: true,
    hasAttachment: true,
    images: MOCK_IMAGES,
    likeCount: 2,
    commentCount: 2,
    isMyPost: true,
  },
  {
    id: '3',
    author: { name: '김위드', profileImageUrl: '' },
    date: '00/00',
    title: '이번주는 중간고사로 쉬어갑니다',
    content: MOCK_CONTENT,
    isNew: false,
    hasAttachment: false,
    images: [],
    likeCount: 0,
    commentCount: 0,
    isMyPost: false,
  },
  {
    id: '4',
    author: { name: '김위드', profileImageUrl: '' },
    date: '00/00',
    title: '이번주는 중간고사로 쉬어갑니다',
    content: MOCK_CONTENT,
    isNew: true,
    hasAttachment: true,
    images: MOCK_IMAGES,
    likeCount: 2,
    commentCount: 2,
    isMyPost: false,
  },
];

function BoardContent() {
  const [activeChannelId, setActiveChannelId] = useState('all');

  // TODO: API 연동 시 activeChannelId 기반으로 게시글 목록 조회
  const posts = MOCK_POSTS;

  return (
    <div className="flex items-start gap-700 self-stretch px-800 pt-450">
      <aside className="shrink-0">
        <BoardNav
          items={MOCK_CHANNELS}
          activeId={activeChannelId}
          onItemSelect={setActiveChannelId}
        />
      </aside>
      <main className="flex min-w-0 flex-1 flex-col gap-400">
        {posts.map((post) => (
          <Link key={post.id} href={`/board/${post.id}`} className="block">
            <PostCard.Root>
              <PostCard.Header>
                <PostCard.Author
                  author={post.author}
                  date={post.date}
                  hasAttachment={post.hasAttachment}
                />
                {post.isMyPost && (
                  <button
                    type="button"
                    aria-label="더보기"
                    className="focus-visible:outline-ring cursor-pointer rounded-sm p-100 hover:opacity-70 focus-visible:outline-2 focus-visible:outline-offset-2"
                    onClick={(e) => e.preventDefault()}
                  >
                    <span
                      aria-hidden
                      className="bg-icon-normal block h-[16px] w-[4px] mask-contain mask-center mask-no-repeat"
                      style={{
                        maskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
                        WebkitMaskImage: `url(${(MoreVerticalIcon as StaticImageData).src})`,
                      }}
                    />
                  </button>
                )}
              </PostCard.Header>
              <PostCard.Content title={post.title} content={post.content} isNew={post.isNew} />
              <PostCard.Images files={post.images} />
              <PostCard.Actions likeCount={post.likeCount} commentCount={post.commentCount} />
            </PostCard.Root>
          </Link>
        ))}
      </main>
    </div>
  );
}

export { BoardContent };
