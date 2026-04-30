'use client';

import { useParams, useRouter } from 'next/navigation';
import { BackIcon } from '@/assets/icons';
import { Button, Icon } from '@/components/ui';
import { cn } from '@/lib/cn';
import { buildBoardPath } from '@/lib/board';

interface PostDetailHeaderProps {
  className?: string;
}

function PostDetailHeader({ className }: PostDetailHeaderProps) {
  const router = useRouter();
  const { clubId, boardId } = useParams<{ clubId: string; boardId: string }>();

  return (
    <div className={cn('flex items-start gap-200 self-stretch px-450 pt-450 pb-300', className)}>
      <Button
        type="button"
        variant="tertiary"
        size="icon-md"
        className="h-600 w-600"
        onClick={() => router.push(buildBoardPath(clubId, Number(boardId)))}
        aria-label="뒤로 가기"
      >
        <Icon src={BackIcon} size={13} className="text-icon-alternative" />
      </Button>
    </div>
  );
}

export { PostDetailHeader, type PostDetailHeaderProps };
