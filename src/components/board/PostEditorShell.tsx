'use client';

import dynamic from 'next/dynamic';
import { useEffect, type ReactNode } from 'react';

import { AlertDialog, AlertDialogAction, AlertDialogCancel } from '@/components/ui';
import { useNavigationGuard } from '@/hooks/useNavigationGuard';
import { cn } from '@/lib/cn';
import { usePostStore } from '@/stores/usePostStore';

import { BoundTitleInput } from './BoundTitleInput';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

interface PostEditorShellProps {
  header: ReactNode;
  initialContent?: string;
  align?: 'start' | 'center';
}

/**
 * 게시글 작성/수정 페이지 공통 레이아웃 Shell
 */
function PostEditorShell({ header, initialContent, align = 'start' }: PostEditorShellProps) {
  const title = usePostStore((s) => s.title);
  const content = usePostStore((s) => s.content);
  const files = usePostStore((s) => s.files);
  const snapshot = usePostStore((s) => s._snapshot);

  // Tiptap은 빈 에디터에서도 '<p></p>' 등의 HTML을 반환하므로 태그를 제거
  const hasText = !!content.replace(/<[^>]*>/g, '').trim();

  const hasChanges = snapshot
    ? title !== snapshot.title ||
      content !== snapshot.content ||
      files.map((f) => f.id).join(',') !== snapshot.fileIds.join(',')
    : title.length > 0 || hasText || files.length > 0;
  const { open, onConfirm, onCancel, allowNavigation } = useNavigationGuard({
    enabled: hasChanges,
  });

  useEffect(() => {
    usePostStore.getState().setAllowNavigation(allowNavigation);
    return () => usePostStore.getState().setAllowNavigation(null);
  }, [allowNavigation]);

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
        <div className="flex w-full max-w-[900px] items-center gap-200 rounded-lg p-100">
          <Editor initialContent={initialContent} />
        </div>
      </div>

      <AlertDialog
        open={open}
        status="danger"
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
