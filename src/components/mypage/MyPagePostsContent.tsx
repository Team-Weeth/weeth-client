'use client';

import { useRouter } from 'next/navigation';
import { BackIcon } from '@/assets/icons';
import { Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { BoardContent } from '@/components/board/BoardContent';

type MyPagePostsContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPagePostsContent({ className, ...props }: MyPagePostsContentProps) {
  const router = useRouter();

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-4', className)} {...props}>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="tablet:typo-h3 typo-sub1 text-text-normal">내가 쓴 글</h1>
        </div>
      </div>

      <BoardContent boardId={null} onlyCurrentUser emptyMessage="아직 작성한 글이 없습니다." />
    </div>
  );
}

export { MyPagePostsContent, type MyPagePostsContentProps };
