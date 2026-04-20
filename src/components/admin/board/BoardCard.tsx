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
import { AdminBoardMoveicon } from '@/assets/icons/admin';
import { PinIcon } from '@/assets/icons';
import { cn } from '@/lib/cn';
import type { Board } from '@/types/admin/board';
import { MegaphoneIcon } from '@/components/board';

interface BoardCardProps extends React.HTMLAttributes<HTMLDivElement> {
  board: Board;
  onToggleComments?: (next: boolean) => void;
  onEdit?: () => void;
  onDelete?: () => void;
  draggable?: boolean;
  ref?: React.Ref<HTMLDivElement>;
  dragHandleProps?: React.ButtonHTMLAttributes<HTMLButtonElement>;
}

const BOARD_ICON: Record<Exclude<Board['kind'], 'NOTICE'>, typeof PinIcon> = {
  ALL: PinIcon,
  CUSTOM: PinIcon,
};

function BoardCard({
  className,
  board,
  onToggleComments,
  onEdit,
  onDelete,
  draggable = true,
  dragHandleProps,
  ...props
}: BoardCardProps) {
  const { name, description, visibility, postCount, commentEnabled, editable } = board;

  return (
    <div
      className={cn(
        'bg-container-neutral tablet:gap-400 flex w-full items-center gap-300 rounded-sm px-500 py-400 shadow-sm',
        className,
      )}
      {...props}
    >
      {/* Drag handle + icon + title/desc */}
      <div className="tablet:gap-400 flex min-w-0 flex-1 items-center gap-300">
        <button
          type="button"
          aria-label="순서 변경 핸들"
          disabled={!draggable}
          {...(draggable ? dragHandleProps : {})}
          className={cn(
            'tablet:flex hidden shrink-0 touch-none items-center justify-center rounded-sm p-200',
            draggable
              ? 'hover:bg-container-neutral-interaction cursor-grab active:cursor-grabbing'
              : 'cursor-not-allowed',
            draggable && dragHandleProps?.className,
          )}
        >
          <Icon
            src={AdminBoardMoveicon}
            size={40}
            className={draggable ? 'text-icon-normal' : 'text-icon-disabled'}
          />
        </button>
        <div className="bg-container-neutral-alternative flex size-10 shrink-0 items-center justify-center rounded-sm">
          {board.kind === 'NOTICE' ? (
            <MegaphoneIcon width={24} height={24} className="text-icon-normal" />
          ) : (
            <Icon src={BOARD_ICON[board.kind]} size={24} className="text-icon-normal" />
          )}
        </div>
        <div className="flex min-w-0 flex-1 flex-col justify-center gap-200">
          <p className="typo-sub3 text-text-strong truncate">{name}</p>
          <p className="typo-caption2 text-text-alternative truncate">{description}</p>
        </div>
      </div>

      {/* Post count */}
      <div className="tablet:flex hidden w-[88px] shrink-0 flex-col justify-center gap-200">
        <p className="typo-body2 text-text-alternative">게시글</p>
        <p className="typo-sub3 text-text-strong">{postCount}</p>
      </div>

      {/* Comment toggle */}
      <div className="desktop:flex hidden w-[88px] shrink-0 flex-col justify-center gap-100">
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
      <div className="desktop:flex hidden shrink-0">
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
              title={`'${name}'을 삭제하시겠어요?`}
              description={'게시판을 삭제해도 휴지통에 30일간 보관됩니다.'}
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
