'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useBoardPosts } from '@/hooks';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useUserId } from '@/stores/useUserStore';
import { useActiveBoardId } from '@/stores/useBoardNavStore';
import { formatShortDateTime } from '@/lib/formatTime';
import { PostActionMenu } from './PostActionMenu';
import { PostCard } from './PostCard';
import { BoardContentSkeleton } from './BoardContentSkeleton';

function BoardContent() {
  const activeBoardId = useActiveBoardId();
  const currentUserId = useUserId();
  const {
    data: posts,
    isLoading,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useBoardPosts(activeBoardId);
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <BoardContentSkeleton />;

  if (isError)
    return (
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-300 py-800">
        <p className="typo-body1 text-text-alternative">게시글을 불러오지 못했습니다</p>
        <button type="button" className="typo-button2 text-brand-primary" onClick={() => refetch()}>
          다시 시도
        </button>
      </main>
    );

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-400">
      {(posts ?? []).map((post) => {
        const imageFiles = post.fileUrls
          .filter((f) => f.contentType.startsWith('image/'))
          .map((f) => ({ id: f.fileId, fileName: f.fileName, fileUrl: f.fileUrl, uploaded: true }));

        return (
          <Link key={post.id} href={`/board/${post.id}`}>
            <PostCard.Root>
              <PostCard.Header>
                <PostCard.Author
                  author={post.author}
                  date={formatShortDateTime(post.time)}
                  hasAttachment={post.fileUrls.length > 0}
                />
                {currentUserId === post.author.id && <PostActionMenu postId={post.id} />}
              </PostCard.Header>
              <PostCard.ListContent title={post.title} content={post.content} isNew={post.isNew} />
              <div onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                <PostCard.Images files={imageFiles} />
              </div>
              <PostCard.Actions likeCount={post.like.likeCount} commentCount={post.commentCount} />
            </PostCard.Root>
          </Link>
        );
      })}
      {isFetchingNextPage && <BoardContentSkeleton />}
      <div ref={sentinelRef} />
    </main>
  );
}

export { BoardContent };
