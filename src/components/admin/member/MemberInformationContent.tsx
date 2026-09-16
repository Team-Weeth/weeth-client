import { cn } from '@/lib/cn';
import { MemberInformationFields } from './MemberInformationFields';
import { MemberPositionEditor, type MemberPositionEditorProps } from './MemberPositionEditor';

type MemberInformationContentProps = MemberPositionEditorProps;

/** 진입 경로와 API가 확정되면 페이지에서 onSave를 연결한다. */
function MemberInformationContent({ className, ...editorProps }: MemberInformationContentProps) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex min-h-full min-w-0 flex-col gap-800 rounded-t-lg p-700',
        className,
      )}
    >
      <h1 className="typo-h2 text-text-strong">부원 정보</h1>
      <div className="desktop:grid-cols-[300px_minmax(0,1fr)] grid min-w-0 grid-cols-1 items-start gap-700">
        <MemberInformationFields />
        <MemberPositionEditor {...editorProps} />
      </div>
    </div>
  );
}

export { MemberInformationContent, type MemberInformationContentProps };
