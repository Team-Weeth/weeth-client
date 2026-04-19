'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  Button,
  Icon,
  Switch,
  Tag,
} from '@/components/ui';
import { AdminColumnMeatballIcon, AdminForumIcon } from '@/assets/icons/admin';
import { PinIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import type { Board } from '@/types/admin/board';

interface BoardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  board: Board;
  onToggleComments?: (next: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
}

const BOARD_ICON: Record<Board['kind'], typeof PinIcon> = {
  ALL: PinIcon,
  NOTICE: AdminForumIcon,
  CUSTOM: PinIcon,
};

function BoardCard({
  className,
  board,
  onToggleComments,
  onEdit,
  onDelete,
  draggable = true,
  ...props
}: BoardCardProps) {
  const { name, description, visibility, postCount, commentEnabled, editable } = board;

  return (
    <div
      className={cn(
        'bg-container-neutral shadow-sm flex w-full items-center gap-300 rounded-sm px-500 py-400 tablet:gap-400',
        className,
      )}
      {...props}
    >
      {/* Drag handle + icon + title/desc */}
      <div className="flex min-w-0 flex-1 items-center gap-300 tablet:gap-400">
        {draggable && (
          <button
            type="button"
            aria-label="순서 변경 핸들"
            className="hover:bg-container-neutral-interaction hidden shrink-0 cursor-grab items-center justify-center rounded-sm p-200 active:cursor-grabbing tablet:flex"
          >
            <Icon src={AdminColumnMeatballIcon} size={24} className="text-icon-alternative" />
          </button>
        )}
        <div className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
          <Icon src={BOARD_ICON[board.kind]} size={24} className="text-icon-normal" />
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-200">
          <p className="typo-sub3 text-text-strong truncate">{name}</p>
          <p className="typo-caption2 text-text-alternative truncate">{description}</p>
        </div>
      </div>

      {/* Post count */}
      <div className="hidden w-[88px] shrink-0 flex-col justify-center gap-200 tablet:flex">
        <p className="typo-body2 text-text-alternative">게시글</p>
        <p className="typo-sub3 text-text-strong">{postCount}</p>
      </div>

      {/* Comment toggle */}
      <div className="hidden w-[88px] shrink-0 flex-col justify-center gap-100 desktop:flex">
        {commentEnabled !== null ? (
          <>
            <p className="typo-body2 text-text-alternative">댓글 허용</p>
            <Switch
              checked={commentEnabled}
              onCheckedChange={onToggleComments}
              disabled={!onToggleComments}
              aria-label="댓글 허용 토글"
            />
          </>
        ) : null}
      </div>

      {/* Visibility tag */}
      <div className="hidden shrink-0 desktop:flex">
        {visibility === 'PUBLIC' && <Tag variant="primary">전체 공개</Tag>}
        {visibility === 'ADMIN_ONLY' && (
          <Tag className="bg-state-caution/10 text-state-caution">관리자 전용</Tag>
        )}
        {visibility === 'PRIVATE' && (
          <Tag className="bg-text-alternative/10 text-text-alternative">비공개</Tag>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex shrink-0 items-center gap-200">
        {editable ? (
          <>
            <Button variant="secondary" size="md" onClick={onEdit}>
              수정
            </Button>
            <AlertDialog
              status="danger"
              title="이 게시판을 삭제하시겠어요?"
              description={'삭제된 게시판은 휴지통으로 이동합니다.'}
              trigger={
                <Button variant="danger" size="md">
                  삭제
                </Button>
              }
            >
              <AlertDialogAction onClick={onDelete}>삭제</AlertDialogAction>
              <AlertDialogCancel>취소</AlertDialogCancel>
            </AlertDialog>
          </>
        ) : (
          <div className="w-[106px]" aria-hidden />
        )}
      </div>
    </div>
  );
}

export { BoardCard, type BoardCardProps };
