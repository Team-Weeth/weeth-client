'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useBoardPosts } from '@/hooks/board/useBoardQuery';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useScrollRestoration } from '@/hooks/useScrollRestoration';
import { useUserId } from '@/stores/useUserStore';
import { formatShortDateTime } from '@/lib/formatTime';
import { parseApiError } from '@/lib/error';
import { BOARD_PAGE_ERRORS } from '@/constants/board/error';
import { toastError } from '@/stores/useToastStore';
import { buildPostPath } from '@/lib/board';
import { toDisplayImages } from '@/lib/board/toDisplayImages';
import { PostActionMenu } from './PostActionMenu';
import { PostCardRoot } from './PostCard/PostCardRoot';
import { PostCardHeader } from './PostCard/PostCardHeader';
import { PostAuthorInfo } from './PostCard/PostAuthorInfo';
import { PostCardListContent } from './PostCard/PostCardListContent';
import { PostCardImages } from './PostCard/PostCardImages';
import { PostCardActions } from './PostCard/PostCardActions';
import { BoardContentSkeleton } from './BoardContentSkeleton';

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

  const { pendingTarget, clearPendingTarget } = useScrollRestoration(
    boardId !== null ? `board:${boardId}` : null,
    !isPending && !isError,
  );

  useEffect(() => {
    if (pendingTarget === null || isFetchingNextPage) return;

    const reachable = document.body.scrollHeight >= pendingTarget + window.innerHeight;

    if (reachable || !hasNextPage) {
      requestAnimationFrame(() => {
        window.scrollTo({ top: pendingTarget, behavior: 'instant' });
      });
      clearPendingTarget();
    } else {
      fetchNextPage();
    }
  }, [pendingTarget, isFetchingNextPage, hasNextPage, fetchNextPage, clearPendingTarget]);

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
      {filteredPosts.map((post, index) => (
        <PostCardRoot key={post.id} className="relative">
          <PostCardHeader>
            <PostAuthorInfo
              author={post.author}
              date={formatShortDateTime(post.time)}
              hasAttachment={post.fileUrls.length > 0}
            />
            {currentUserId === post.author.id && (
              <div className="relative z-10">
                <PostActionMenu postId={post.id} boardId={post.boardId} />
              </div>
            )}
          </PostCardHeader>
          <Link
            href={buildPostPath(clubId, post.id, post.boardId)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            <PostCardListContent title={post.title} content={post.content} isNew={post.isNew} />
          </Link>
          <div className="relative z-10">
            <PostCardImages
              files={toDisplayImages(post.fileUrls, post.content)}
              priority={index === 0}
            />
          </div>
          <div className="relative z-10">
            <PostCardActions
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
        </PostCardRoot>
      ))}
      {isFetchingNextPage && <BoardContentSkeleton />}
      <div ref={sentinelRef} />
    </main>
  );
}

export { BoardContent };
