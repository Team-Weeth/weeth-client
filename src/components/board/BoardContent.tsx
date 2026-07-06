'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBoardPosts } from '@/hooks';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useUserId } from '@/stores/useUserStore';
import { formatShortDateTime } from '@/lib/formatTime';
import { parseApiError } from '@/lib/error';
import { BOARD_PAGE_ERRORS } from '@/constants/board/error';
import { toastError } from '@/stores/useToastStore';
import type { FileItem } from '@/types/file';
import { buildPostPath } from '@/lib/board';
import { PostActionMenu } from './PostActionMenu';
import { PostCard } from './PostCard';
import { BoardContentSkeleton } from './BoardContentSkeleton';

function toDisplayImages(files: FileItem[]) {
  return files
    .filter((f) => f.contentType.startsWith('image/'))
    .map((f) => ({ id: f.fileId, fileName: f.fileName, fileUrl: f.fileUrl, uploaded: true }));
}

interface BoardContentProps {
  boardId: number | null;
  onlyCurrentUser?: boolean;
  emptyMessage?: string;
}

function BoardContent({
  boardId,
  onlyCurrentUser = false,
  emptyMessage = '아직 게시글이 없습니다.',
}: BoardContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const currentUserId = useUserId();
  const {
    data: posts,
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBoardPosts(boardId);
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
  });
  const filteredPosts =
    onlyCurrentUser && currentUserId != null
      ? posts?.filter((post) => post.author.id === currentUserId)
      : posts;

  useEffect(() => {
    if (!isError || !error) return;
    const parsed = parseApiError(error);
    const known = parsed ? BOARD_PAGE_ERRORS[parsed.code] : null;
    if (known) {
      toastError(known.message);
      router.replace(`/${clubId}/board`);
    }
  }, [isError, error, router, clubId]);

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isPending) return <BoardContentSkeleton />;

  if (isError)
    return (
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-300 py-800">
        <p className="typo-body1 text-text-alternative">게시글을 불러오지 못했습니다</p>
        <button type="button" className="typo-button2 text-brand-primary" onClick={() => refetch()}>
          다시 시도
        </button>
      </main>
    );

  if (!filteredPosts || filteredPosts.length === 0)
    return (
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center py-800">
        <p className="typo-body1 text-text-alternative">{emptyMessage}</p>
      </main>
    );

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-400">
      {filteredPosts.map((post) => (
        <PostCard.Root key={post.id} className="relative">
          <PostCard.Header>
            <PostCard.Author
              author={post.author}
              date={formatShortDateTime(post.time)}
              hasAttachment={post.fileUrls.length > 0}
            />
            {currentUserId === post.author.id && (
              <div className="relative z-10">
                <PostActionMenu postId={post.id} boardId={post.boardId} />
              </div>
            )}
          </PostCard.Header>
          <Link
            href={buildPostPath(clubId, post.id, post.boardId)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            <PostCard.ListContent title={post.title} content={post.content} isNew={post.isNew} />
          </Link>
          <div className="relative z-10">
            <PostCard.Images files={toDisplayImages(post.fileUrls)} />
          </div>
          <div className="relative z-10">
            <PostCard.Actions
              postId={post.id}
              boardId={post.boardId}
              likeCount={post.like.likeCount}
              commentCount={post.commentCount}
              isLiked={post.like.isLiked}
              canComment={post.boardConfig?.canComment ?? true}
              onComment={() =>
                router.push(`${buildPostPath(clubId, post.id, post.boardId)}#comments`)
              }
            />
          </div>
        </PostCard.Root>
      ))}
      {isFetchingNextPage && <BoardContentSkeleton />}
      <div ref={sentinelRef} />
    </main>
  );
}

export { BoardContent };
