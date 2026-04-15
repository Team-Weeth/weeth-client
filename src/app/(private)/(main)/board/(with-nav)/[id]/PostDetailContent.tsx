'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
import { useSetActiveBoardId } from '@/stores/useBoardNavStore';
import { useUserId } from '@/stores/useUserStore';
import type { PostDetail } from '@/types/board';

interface PostDetailContentProps {
  initialData: PostDetail;
}

function PostDetailContent({ initialData }: PostDetailContentProps) {
  const router = useRouter();
  const currentUserId = useUserId();
  const setActiveBoardId = useSetActiveBoardId();

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
    switchGuardOpen,
    onSwitchConfirm,
    onSwitchCancel,
    navGuardOpen,
    onNavGuardConfirm,
    onNavGuardCancel,
  } = useReplyForm();

  useEffect(() => {
    setActiveBoardId(currentPost.boardId);
  }, [currentPost.boardId, setActiveBoardId]);

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

      <div className="flex flex-col items-start gap-600 self-stretch p-450">
        <PostCard.Header>
          <PostCard.Author
            author={{
              name: currentPost.author.name,
              profileImageUrl: currentPost.author.profileImageUrl,
            }}
            date={formatShortDateTime(currentPost.time)}
            hasAttachment={currentPost.fileUrls.length > 0}
          />
          {isPostAuthor && (
            <PostActionMenu
              postId={currentPost.id}
              onEdit={() => router.push(`/board/edit/${currentPost.id}`)}
              onDeleted={() => router.push('/board')}
            />
          )}
        </PostCard.Header>

        <PostCard.DetailContent
          title={currentPost.title}
          content={currentPost.content}
          isNew={currentPost.isNew}
        />

        <PostCard.Images files={imageFiles} />

        <FileList files={nonImageFiles} />

        <PostCard.Actions
          postId={currentPost.id}
          likeCount={currentPost.like.likeCount}
          commentCount={currentPost.commentCount}
          isLiked={currentPost.like.isLiked}
        />
      </div>

      <div id="comments" className="self-stretch px-450 py-400">
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
