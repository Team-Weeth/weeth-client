'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { TitleInput } from './TitleInput';
import { cn } from '@/lib/cn';
import { usePostStore } from '@/stores/usePostStore';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

interface PostEditorShellProps {
  /** 상단 영역 (글쓰기: CategorySelector, 수정: Breadcrumb 등) */
  header: ReactNode;
  /** 수정 페이지에서 Editor에 주입할 초기 콘텐츠 */
  initialContent?: string;
  /** 외곽 컨테이너의 cross-axis 정렬 (기본값: start) */
  align?: 'start' | 'center';
}

/**
 * 게시글 작성/수정 페이지 공통 레이아웃 Shell
 *
 * - 외곽 레이아웃 + TitleInput + Editor 렌더링을 담당
 * - 상단 영역(header)과 Editor 초기 콘텐츠는 주입
 * - Store 초기화는 사용하는 쪽에서 책임 (write: reset, edit: 기존 데이터 복원)
 */
function PostEditorShell({ header, initialContent, align = 'start' }: PostEditorShellProps) {
  const title = usePostStore((s) => s.title);
  const setTitle = usePostStore((s) => s.setTitle);

  return (
    <div
      className={cn(
        'mx-auto flex max-w-[1200px] flex-1 flex-col gap-400 p-450',
        align === 'center' ? 'items-center' : 'items-start',
      )}
    >
      {header}
      <div className="flex w-full flex-col items-start">
        <TitleInput value={title} onChange={(e) => setTitle(e.target.value)} />
        <div className="flex w-full items-center gap-200 rounded-lg p-100">
          <Editor initialContent={initialContent} />
        </div>
      </div>
    </div>
  );
}

export { PostEditorShell, type PostEditorShellProps };
