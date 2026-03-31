'use client';

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
import { useUserId } from '@/stores/useUserStore';
import type { PostDetail } from '@/types/board';
import type { UploadFileItem } from '@/stores/usePostStore';

interface PostDetailContentProps {
  post: PostDetail;
}

function PostDetailContent({ post }: PostDetailContentProps) {
  const currentUserId = useUserId();

  const isPostAuthor =
    currentUserId !== null && post.author.id === currentUserId;
  const imageFiles = post.fileUrls
    .filter((f) => isImageFileByType(f.contentType))
    .map(toDisplayFile);
  const nonImageFiles = post.fileUrls
    .filter((f) => !isImageFileByType(f.contentType))
    .map(toDisplayFile);

  const handleCommentSubmit = (_value: string, _file: UploadFileItem | null) => {
    // TODO: 댓글 작성 API 연동
  };

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
          {isPostAuthor && <PostActionMenu />}
        </PostCard.Header>

        <PostCard.Content
          title={post.title}
          content={post.content}
          expandable={false}
          variant="detail"
        />

        <PostCard.Images files={imageFiles} />

        <FileList files={nonImageFiles} />

        <PostCard.Actions
          likeCount={post.like.likeCount}
          commentCount={post.commentCount}
          isLiked={post.like.isLiked}
        />
      </div>

      <div className="self-stretch px-450 py-400">
        <CommentInput placeholder="댓글을 입력하세요." onSubmit={handleCommentSubmit} />
      </div>

      {post.comments.length > 0 && (
        <>
          <div className="self-stretch px-450">
            <Divider />
          </div>

          <div className="flex flex-col gap-200 self-stretch pb-400">
            {post.comments.map((comment) => (
              <CommentItem
                key={comment.id}
                {...mapComment(comment, currentUserId)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export { PostDetailContent };
