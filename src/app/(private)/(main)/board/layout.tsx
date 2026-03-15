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

interface BoardLayoutProps {
  children: React.ReactNode;
  footer: React.ReactNode;
}

export default function BoardLayout({ children, footer }: BoardLayoutProps) {
  const [activeChannelId, setActiveChannelId] = useState('all');

  return (
    <div className="flex items-start gap-700 px-800 pt-450">
      <aside className="flex shrink-0 flex-col gap-400">
        <BoardNav
          items={MOCK_CHANNELS}
          activeId={activeChannelId}
          onItemSelect={setActiveChannelId}
        />
        {footer}
      </aside>
      {children}
    </div>
  );
}
