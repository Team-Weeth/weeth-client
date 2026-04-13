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
  FileList,
} from '@/components/board';
import { formatShortDateTime } from '@/lib/formatTime';
import { toDisplayFile, isImageFileByType, mapComment } from '@/lib/board';
import { useCreateComment } from '@/hooks/board/useCreateComment';
import { useUpdateComment } from '@/hooks/board/useUpdateComment';
import { useDeleteComment } from '@/hooks/board/useDeleteComment';
import { useSetActiveBoardId } from '@/stores/useBoardNavStore';
import { useUserId } from '@/stores/useUserStore';
import type { PostDetail } from '@/types/board';

interface PostDetailContentProps {
  post: PostDetail;
}

function PostDetailContent({ post }: PostDetailContentProps) {
  const router = useRouter();
  const currentUserId = useUserId();
  const setActiveBoardId = useSetActiveBoardId();
  const { createComment, isPending } = useCreateComment(post.id);
  const { updateComment } = useUpdateComment(post.id);
  const { deleteComment } = useDeleteComment(post.id);

  useEffect(() => {
    setActiveBoardId(post.boardId);
  }, [post.boardId, setActiveBoardId]);

  const isPostAuthor = currentUserId !== null && post.author.id === currentUserId;
  const imageFiles = post.fileUrls
    .filter((f) => isImageFileByType(f.contentType))
    .map(toDisplayFile);
  const nonImageFiles = post.fileUrls
    .filter((f) => !isImageFileByType(f.contentType))
    .map(toDisplayFile);

  return (
    <div className="bg-container-neutral flex flex-1 flex-col items-center overflow-hidden rounded-(--radius-lg)">
      <PostDetailHeader />

      <div className="flex flex-col items-start gap-600 self-stretch p-450">
        <PostCard.Header>
          <PostCard.Author
            author={{
              name: post.author.name,
              profileImageUrl: post.author.profileImageUrl,
            }}
            date={formatShortDateTime(post.time)}
            hasAttachment={post.fileUrls.length > 0}
          />
          {isPostAuthor && (
            <PostActionMenu
              postId={post.id}
              onEdit={() => router.push(`/board/edit/${post.id}`)}
              onDeleted={() => router.push('/board')}
            />
          )}
        </PostCard.Header>

        <PostCard.DetailContent title={post.title} content={post.content} isNew={post.isNew} />

        <PostCard.Images files={imageFiles} />

        <FileList files={nonImageFiles} />

        <PostCard.Actions
          postId={post.id}
          likeCount={post.like.likeCount}
          commentCount={post.commentCount}
          isLiked={post.like.isLiked}
        />
      </div>

      <div className="self-stretch px-450 py-400">
        <CommentInput
          placeholder="댓글을 입력하세요."
          onSubmit={createComment}
          disabled={isPending}
        />
      </div>

      {post.comments.length > 0 && (
        <>
          <div className="self-stretch px-450">
            <Divider />
          </div>

          <div className="flex flex-col gap-200 self-stretch pb-400">
            {post.comments.map((comment) => {
              const mapped = mapComment(comment, currentUserId);
              return (
                <CommentItem
                  key={comment.id}
                  {...mapped}
                  replies={mapped.replies.map((reply) => ({
                    ...reply,
                    onEdit: (content: string) => updateComment(reply.id, content),
                    onDelete: () => deleteComment(reply.id),
                  }))}
                  onReply={(content) => createComment(content, comment.id)}
                  onEdit={(content) => updateComment(comment.id, content)}
                  onDelete={() => deleteComment(comment.id)}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export { PostDetailContent };
