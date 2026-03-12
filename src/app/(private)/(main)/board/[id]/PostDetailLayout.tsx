'use client';

import { useState } from 'react';
import { BoardNav, type BoardNavItem } from '@/components/board';

const MOCK_CHANNELS: BoardNavItem[] = [
  { id: 'notice', label: '공지', type: 'notice' },
  { id: 'all', label: '전체', type: 'channel' },
  { id: 'study-fe', label: '[스터디 게시판] FE', type: 'channel' },
  { id: 'study-be', label: '[스터디 게시판] BE', type: 'channel' },
  { id: 'be', label: 'BE', type: 'channel' },
  { id: 'd', label: 'D', type: 'channel' },
  { id: 'pm', label: 'PM', type: 'channel' },
];

interface PostDetailLayoutProps {
  children: React.ReactNode;
}

function PostDetailLayout({ children }: PostDetailLayoutProps) {
  const [activeChannelId, setActiveChannelId] = useState('all');

  return (
    <div className="bg-background flex w-full max-w-[1440px] flex-col items-start pb-[183px]">
      <div className="flex w-full items-start gap-700 px-800 pt-450">
        <aside className="shrink-0">
          <BoardNav
            items={MOCK_CHANNELS}
            activeId={activeChannelId}
            onItemSelect={setActiveChannelId}
          />
        </aside>
        {children}
      </div>
    </div>
  );
}

export { PostDetailLayout };
