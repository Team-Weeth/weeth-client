'use client';

import { useMediaQuery } from '@/hooks/useMediaQuery';
import { MemberPositionMobile } from './MemberPositionMobile';
import { cn } from '@/lib/cn';
import { MemberPositionFields } from './MemberPositionFields';
import { MemberPositionEditor, type MemberPositionEditorProps } from './MemberPositionEditor';

type MemberPositionContentProps = MemberPositionEditorProps;

/** 진입 경로와 API가 확정되면 페이지에서 onSave를 연결한다. */
function MemberPositionContent({ className, ...editorProps }: MemberPositionContentProps) {
  const isMobile = useMediaQuery('(max-width: 695.98px)');
  if (isMobile) return <MemberPositionMobile className={className} {...editorProps} />;

  return (
    <div
      className={cn(
        'bg-container-neutral flex min-h-full min-w-0 flex-col gap-800 rounded-t-lg p-700',
        className,
      )}
    >
      <h1 className="typo-h2 text-text-strong">부원 정보</h1>
      <div className="desktop:grid-cols-[300px_minmax(0,1fr)] grid min-w-0 grid-cols-1 items-start gap-700">
        <MemberPositionFields />
        <MemberPositionEditor {...editorProps} />
      </div>
    </div>
  );
}

export { MemberPositionContent, type MemberPositionContentProps };
