'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';

import { TitleInput } from './TitleInput';
import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';
import { useNavigationGuard } from '@/hooks';
import { cn } from '@/lib/cn';
import { usePostStore } from '@/stores/usePostStore';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

interface PostEditorShellProps {
  header: ReactNode;
  initialContent?: string;
  align?: 'start' | 'center';
}

/**
 * title 구독을 shell 밖으로 격리
 */
function BoundTitleInput() {
  const title = usePostStore((s) => s.title);
  const setTitle = usePostStore((s) => s.setTitle);
  return <TitleInput value={title} onChange={(e) => setTitle(e.target.value)} />;
}

/**
 * 게시글 작성/수정 페이지 공통 레이아웃 Shell
 *
 * - 외곽 레이아웃 + TitleInput + Editor 렌더링을 담당
 * - 상단 영역(header)과 Editor 초기 콘텐츠는 주입
 * - Store 초기화는 사용하는 쪽에서 책임 (write: reset, edit: 기존 데이터 복원)
 * - 브라우저 뒤로가기 / 탭 닫기 시 navigation guard 제공
 */
function PostEditorShell({ header, initialContent, align = 'start' }: PostEditorShellProps) {
  const title = usePostStore((s) => s.title);
  const content = usePostStore((s) => s.content);
  const files = usePostStore((s) => s.files);

  const hasChanges = title.length > 0 || content.length > 0 || files.length > 0;
  const { open, onConfirm, onCancel } = useNavigationGuard({ enabled: hasChanges });

  return (
    <div
      className={cn(
        'mx-auto flex max-w-[1200px] flex-1 flex-col gap-400 p-450',
        align === 'center' ? 'items-center' : 'items-start',
      )}
    >
      {header}
      <div className="flex w-full flex-col items-start">
        <BoundTitleInput />
        <div className="flex w-full items-center gap-200 rounded-lg p-100">
          <Editor initialContent={initialContent} />
        </div>
      </div>

      <AlertDialog
        open={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) onCancel();
        }}
        title="변경 사항이 저장되지 않았어요"
        description={'지금 나가면 작성 중인 내용이 사라집니다.\n계속하시겠어요?'}
      >
        <AlertDialogAction onClick={onConfirm}>나가기</AlertDialogAction>
        <AlertDialogCancel onClick={onCancel}>계속 작성</AlertDialogCancel>
      </AlertDialog>
    </div>
  );
}

export { PostEditorShell, type PostEditorShellProps };
