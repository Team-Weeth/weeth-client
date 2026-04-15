'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useBoardPosts } from '@/hooks';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useUserId } from '@/stores/useUserStore';
import { useActiveBoardId } from '@/stores/useBoardNavStore';
import { formatShortDateTime } from '@/lib/formatTime';
import type { FileItem } from '@/types/file';
import { PostActionMenu } from './PostActionMenu';
import { PostCard } from './PostCard';
import { BoardContentSkeleton } from './BoardContentSkeleton';

function toDisplayImages(files: FileItem[]) {
  return files
    .filter((f) => f.contentType.startsWith('image/'))
    .map((f) => ({ id: f.fileId, fileName: f.fileName, fileUrl: f.fileUrl, uploaded: true }));
}

function BoardContent() {
  const router = useRouter();
  const activeBoardId = useActiveBoardId();
  const currentUserId = useUserId();
  const {
    data: posts,
    isPending,
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

  if (!posts || posts.length === 0)
    return (
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center py-800">
        <p className="typo-body1 text-text-alternative">아직 게시글이 없습니다.</p>
      </main>
    );

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-400">
      {posts.map((post) => (
        <PostCard.Root key={post.id} className="relative">
          <PostCard.Header>
            <PostCard.Author
              author={post.author}
              date={formatShortDateTime(post.time)}
              hasAttachment={post.fileUrls.length > 0}
            />
            {currentUserId === post.author.id && (
              <div className="relative z-10">
                <PostActionMenu postId={post.id} />
              </div>
            )}
          </PostCard.Header>
          <Link
            href={`/board/${post.id}`}
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
              likeCount={post.like.likeCount}
              commentCount={post.commentCount}
              isLiked={post.like.isLiked}
              onComment={() => router.push(`/board/${post.id}#comments`)}
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
