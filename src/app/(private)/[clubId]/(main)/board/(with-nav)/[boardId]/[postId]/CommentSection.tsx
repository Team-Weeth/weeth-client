'use client';

import { useEffect } from 'react';
import { useCommentEditActions, useActiveEditId } from '@/stores/useCommentEditStore';
import { Divider } from '@/components/ui/Divider';
import { CommentInput } from '@/components/board/Comment/CommentInput';
import { CommentItem } from '@/components/board/Comment/CommentItem';
import { CommentDirtyGuardDialog } from '@/components/board/CommentDirtyGuardDialog';
import { mapComment } from '@/lib/board';
import { useCreateComment } from '@/hooks/board/useCreateComment';
import { useUpdateComment } from '@/hooks/board/useUpdateComment';
import { useDeleteComment } from '@/hooks/board/useDeleteComment';
import { useReplyForm } from '@/hooks/board/useReplyForm';
import type { PostComment } from '@/types/board';

interface CommentSectionProps {
  boardId: number;
  postId: number;
  comments: PostComment[];
  canComment: boolean;
  currentUserId: number | null;
}

function CommentSection({
  boardId,
  postId,
  comments,
  canComment,
  currentUserId,
}: CommentSectionProps) {
  const { createComment, isPending } = useCreateComment(boardId, postId);
  const { updateComment } = useUpdateComment(boardId, postId);
  const { deleteComment } = useDeleteComment(boardId, postId);

  const activeEditId = useActiveEditId();
  const { cancelEdit } = useCommentEditActions();

  useEffect(() => {
    return () => cancelEdit();
  }, [cancelEdit]);

  const {
    activeReplyId,
    setIsReplyDirty,
    setIsCommentDirty,
    handleReplyToggle,
    forceCloseReply,
    switchGuardOpen,
    onSwitchConfirm,
    onSwitchCancel,
    navGuardOpen,
    onNavGuardConfirm,
    onNavGuardCancel,
  } = useReplyForm();

  return (
    <>
      <div id="comments" className="self-stretch px-450 pt-200 pb-400">
        <CommentInput
          placeholder={canComment ? '댓글을 입력하세요.' : '댓글을 작성할 수 없는 게시판입니다.'}
          onSubmit={async (v, files) => createComment(v, undefined, files)}
          onValueChange={(v) => setIsCommentDirty(v.trim().length > 0)}
          disabled={!canComment || isPending}
        />
      </div>

      {comments.length > 0 && (
        <>
          <div className="self-stretch px-450">
            <Divider />
          </div>

          <div className="flex flex-col gap-200 self-stretch pb-400">
            {comments.map((comment) => {
              const mapped = mapComment(comment, currentUserId);
              return (
                <CommentItem
                  key={comment.id}
                  {...mapped}
                  replyOpen={activeReplyId === comment.id}
                  onReplyToggle={() => {
                    if (!canComment || activeEditId !== null) return;
                    handleReplyToggle(comment.id);
                  }}
                  canEdit={activeReplyId === null}
                  onReplySuccess={forceCloseReply}
                  onReplyDirtyChange={setIsReplyDirty}
                  replies={mapped.replies.map((reply) => ({
                    ...reply,
                    canEdit: activeReplyId === null,
                    onEdit: async (content, files) => updateComment(reply.id, content, files),
                    onDelete: () => deleteComment(reply.id),
                  }))}
                  onReply={async (content, files) => {
                    if (!canComment) return false;
                    return createComment(content, comment.id, files);
                  }}
                  onEdit={async (content, files) => updateComment(comment.id, content, files)}
                  onDelete={() => deleteComment(comment.id)}
                />
              );
            })}
          </div>
        </>
      )}

      <CommentDirtyGuardDialog
        open={switchGuardOpen}
        onConfirm={onSwitchConfirm}
        onCancel={onSwitchCancel}
      />

      <CommentDirtyGuardDialog
        open={navGuardOpen}
        onConfirm={onNavGuardConfirm}
        onCancel={onNavGuardCancel}
      />
    </>
  );
}

export { CommentSection };
