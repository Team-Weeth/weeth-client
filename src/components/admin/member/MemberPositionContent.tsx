import { cn } from '@/lib/cn';
import { MemberPositionEditor, type MemberPositionEditorProps } from './MemberPositionEditor';
import { MemberPositionFields } from './MemberPositionFields';
import { MemberPositionMobileHeader } from './MemberPositionMobileHeader';

type MemberPositionContentProps = MemberPositionEditorProps;

/**
 * 진입 경로와 API가 확정되면 페이지에서 onSave를 연결한다.
 * 모바일/데스크톱 레이아웃은 CSS로만 분기한다. JS로 뷰포트를 판별하면
 * 서버 렌더 결과가 항상 데스크톱이라 모바일에서 화면이 한 번 깜빡인다.
 */
function MemberPositionContent({ className, ...editorProps }: MemberPositionContentProps) {
  return (
    <div
      className={cn(
        'bg-container-neutral flex min-h-full min-w-0 flex-col gap-800 rounded-t-lg p-700',
        'max-tablet:gap-700 max-tablet:rounded-none max-tablet:px-400 max-tablet:pt-400 max-tablet:pb-700',
        className,
      )}
    >
      <MemberPositionMobileHeader className="tablet:hidden" />

      <h1 className="typo-h2 max-tablet:hidden text-text-strong">부원 정보</h1>

      {/* 모바일에서는 래퍼를 없애 편집기가 바깥 flex 컬럼을 그대로 채우게 한다. */}
      <div className="desktop:grid-cols-[300px_minmax(0,1fr)] max-tablet:contents grid min-w-0 grid-cols-1 items-start gap-700">
        <MemberPositionFields className="max-tablet:hidden" />
        <MemberPositionEditor {...editorProps} className="max-tablet:min-h-[540px]" />
      </div>
    </div>
  );
}

export { MemberPositionContent, type MemberPositionContentProps };
