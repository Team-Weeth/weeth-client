'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { BackIcon } from '@/assets/icons';
import { BoardContentSkeleton } from '@/components/board/BoardContentSkeleton';
import { PostCard } from '@/components/board/PostCard';
import { Icon } from '@/components/ui';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useMyPagePostsQuery } from '@/hooks/queries/mypage/useMyPagePostsQuery';
import { useMyPageQueries } from '@/hooks/queries/mypage/useMyPageQueries';
import { buildPostPath } from '@/lib/board';
import { cn } from '@/lib/cn';
import { parseApiError } from '@/lib/error';
import { formatShortDateTime } from '@/lib/formatTime';
import { toastError } from '@/stores/useToastStore';
import { PostActionMenu } from '../board';

type MyPagePostsContentProps = React.HTMLAttributes<HTMLDivElement>;

function MyPagePostsContent({ className, ...props }: MyPagePostsContentProps) {
  const router = useRouter();
  const { clubId } = useParams<{ clubId: string }>();
  const { me, currentProfile } = useMyPageQueries(clubId);
  const {
    data: posts = [],
    isPending,
    isError,
    error,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMyPagePostsQuery(clubId);
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({ rootMargin: '200px' });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

  useEffect(() => {
    if (!isError || !error) return;
    const parsed = parseApiError(error);
    toastError(parsed?.message ?? '게시글을 불러오지 못했습니다.');
  }, [error, isError]);

  return (
    <div className={cn('flex min-w-0 flex-1 flex-col gap-4', className)} {...props}>
      <div className="tablet:py-0 flex items-center gap-1 py-300">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex cursor-pointer items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <div className="flex flex-col gap-1">
          <h1 className="tablet:typo-h3 typo-sub1 text-text-normal">내가 쓴 글</h1>
        </div>
      </div>

      {isPending ? (
        <BoardContentSkeleton />
      ) : isError ? (
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-300 py-800">
          <p className="typo-body1 text-text-alternative">게시글을 불러오지 못했습니다</p>
          <button
            type="button"
            className="typo-button2 text-brand-primary"
            onClick={() => refetch()}
          >
            다시 시도
          </button>
        </main>
      ) : posts.length === 0 ? (
        <main className="flex min-w-0 flex-1 flex-col items-center justify-center py-800">
          <p className="typo-body1 text-text-alternative">아직 작성한 글이 없습니다.</p>
        </main>
      ) : (
        <main className="flex min-w-0 flex-1 flex-col gap-400">
          {posts.map((post) => (
            <PostCard.Root key={post.postId} className="relative">
              <PostCard.Header>
                <PostCard.Author
                  author={{
                    name: me?.name ?? '나',
                    profileImageUrl: currentProfile?.profileImageUrl ?? undefined,
                  }}
                  date={formatShortDateTime(post.createdAt)}
                  dateTime={post.createdAt}
                />
                <div className="relative z-10">
                  <PostActionMenu postId={post.postId} boardId={post.boardId} />
                </div>
              </PostCard.Header>

              <Link
                href={buildPostPath(post.clubId, post.postId, post.boardId)}
                className="after:absolute after:inset-0 after:content-['']"
              >
                <PostCard.ListContent
                  title={post.title}
                  content={post.content}
                  isNew={post.isNew}
                />
              </Link>

              <div className="relative z-10">
                <PostCard.Actions
                  postId={post.postId}
                  boardId={post.boardId}
                  likeCount={post.likeCount}
                  commentCount={post.commentCount}
                  canComment
                  onComment={() =>
                    router.push(`${buildPostPath(post.clubId, post.postId, post.boardId)}#comments`)
                  }
                />
              </div>
            </PostCard.Root>
          ))}
          {isFetchingNextPage && <BoardContentSkeleton />}
          <div ref={sentinelRef} />
        </main>
      )}
    </div>
  );
}

export { MyPagePostsContent, type MyPagePostsContentProps };
