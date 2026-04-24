'use client';

import { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Divider } from '@/components/ui';
import {
  PostCard,
  PostDetailHeader,
  PostActionMenu,
  CommentInput,
  CommentItem,
  CommentDirtyGuardDialog,
  FileList,
} from '@/components/board';
import { formatShortDateTime } from '@/lib/formatTime';
import { toDisplayFile, isImageFileByType, mapComment } from '@/lib/board';
import { usePostDetailQuery } from '@/hooks/board/usePostDetailQuery';
import { useCreateComment } from '@/hooks/board/useCreateComment';
import { useUpdateComment } from '@/hooks/board/useUpdateComment';
import { useDeleteComment } from '@/hooks/board/useDeleteComment';
import { useReplyForm } from '@/hooks/board/useReplyForm';
import { useSetActiveBoardId, useBoardTypeMap } from '@/stores/useBoardNavStore';
import { useClubId } from '@/stores/useClubStore';
import { useUserId } from '@/stores/useUserStore';
import { boardApi } from '@/lib/apis/board';
import { buildBoardPath } from '@/lib/board';
import type { PostDetail } from '@/types/board';

interface PostDetailContentProps {
  initialData: PostDetail;
}

function PostDetailContent({ initialData }: PostDetailContentProps) {
  const router = useRouter();
  const { clubId: clubIdParam, boardId: boardIdParam } = useParams<{
    clubId: string;
    boardId?: string;
  }>();
  const currentUserId = useUserId();
  const clubId = useClubId();
  const setActiveBoardId = useSetActiveBoardId();
  const boardTypeMap = useBoardTypeMap();

  const { data } = usePostDetailQuery(initialData.id, initialData);
  const currentPost = data ?? initialData;

  const { createComment, isPending } = useCreateComment(currentPost.id);
  const { updateComment } = useUpdateComment(currentPost.id);
  const { deleteComment } = useDeleteComment(currentPost.id);

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

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    setActiveBoardId(currentPost.boardId);
  }, [currentPost.boardId, setActiveBoardId]);

  useEffect(() => {
    if (clubId && boardTypeMap[currentPost.boardId] === 'NOTICE') {
      boardApi.readAllNotices(clubId, currentPost.boardId).catch(() => {});
    }
  }, [clubId, currentPost.boardId, boardTypeMap]);

  const isPostAuthor = currentUserId !== null && currentPost.author.id === currentUserId;
  const imageFiles = currentPost.fileUrls
    .filter((f) => isImageFileByType(f.contentType))
    .map(toDisplayFile);
  const nonImageFiles = currentPost.fileUrls
    .filter((f) => !isImageFileByType(f.contentType))
    .map(toDisplayFile);

  return (
    <div className="bg-container-neutral flex flex-1 flex-col items-center overflow-hidden rounded-(--radius-lg)">
      <PostDetailHeader />

      <div className="flex flex-col items-start gap-600 self-stretch px-450 pt-450">
        <PostCard.Header>
          <PostCard.Title title={currentPost.title} isNew={currentPost.isNew} size="detail" />
          {isPostAuthor && (
            <PostActionMenu
              postId={currentPost.id}
              onEdit={() => router.push(`/${clubIdParam}/board/edit/${currentPost.id}`)}
              onDeleted={() =>
                router.push(
                  buildBoardPath(clubIdParam, boardIdParam ? Number(boardIdParam) : undefined),
                )
              }
            />
          )}
        </PostCard.Header>

        <PostCard.Author
          author={{
            name: currentPost.author.name,
            profileImageUrl: currentPost.author.profileImageUrl,
          }}
          date={formatShortDateTime(currentPost.time)}
          hasAttachment={currentPost.fileUrls.length > 0}
        />

        <Divider />

        <PostCard.Body content={currentPost.content} />

        <PostCard.Images files={imageFiles} />

        <FileList files={nonImageFiles} />

        <PostCard.Actions
          className="mt-400"
          postId={currentPost.id}
          likeCount={currentPost.like.likeCount}
          commentCount={currentPost.commentCount}
          isLiked={currentPost.like.isLiked}
          onComment={() =>
            document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
          }
        />
      </div>

      <div id="comments" className="self-stretch px-450 pt-200 pb-400">
        <CommentInput
          placeholder="댓글을 입력하세요."
          onSubmit={async (v) => {
            await createComment(v);
            return true;
          }}
          onValueChange={(v) => setIsCommentDirty(v.trim().length > 0)}
          disabled={isPending}
        />
      </div>

      {currentPost.comments.length > 0 && (
        <>
          <div className="self-stretch px-450">
            <Divider />
          </div>

          <div className="flex flex-col gap-200 self-stretch pb-400">
            {currentPost.comments.map((comment) => {
              const mapped = mapComment(comment, currentUserId);
              return (
                <CommentItem
                  key={comment.id}
                  {...mapped}
                  replyOpen={activeReplyId === comment.id}
                  onReplyToggle={() => handleReplyToggle(comment.id)}
                  onReplySuccess={forceCloseReply}
                  onReplyDirtyChange={setIsReplyDirty}
                  replies={mapped.replies.map((reply) => ({
                    ...reply,
                    onEdit: async (content: string) => {
                      await updateComment(reply.id, content);
                      return true;
                    },
                    onDelete: () => deleteComment(reply.id),
                  }))}
                  onReply={async (content) => {
                    await createComment(content, comment.id);
                    return true;
                  }}
                  onEdit={async (content) => {
                    await updateComment(comment.id, content);
                    return true;
                  }}
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
    </div>
  );
}

export { PostDetailContent };
