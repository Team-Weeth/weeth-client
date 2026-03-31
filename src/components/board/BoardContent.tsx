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

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-400">
      {(posts ?? []).map((post) => (
        <Link key={post.id} href={`/board/${post.id}`}>
          <PostCard.Root>
            <PostCard.Header>
              <PostCard.Author
                author={post.author}
                date={formatShortDateTime(post.time)}
                hasAttachment={post.hasFile}
              />
              {currentUserId === post.author.id && (
                <PostActionMenu onClick={(e) => e.preventDefault()} />
              )}
            </PostCard.Header>
            <PostCard.Content title={post.title} content={post.content} isNew={post.isNew} />
            <PostCard.Actions likeCount={post.like.likeCount} commentCount={post.commentCount} />
          </PostCard.Root>
        </Link>
      ))}
      {isFetchingNextPage && <BoardContentSkeleton />}
      <div ref={sentinelRef} />
    </main>
  );
}

export { BoardContent };
