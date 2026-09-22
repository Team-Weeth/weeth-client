'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import { BoardContentSkeleton } from '@/components/board/BoardContentSkeleton';
import { PostCard } from '@/components/board/PostCard';
import { Icon } from '@/components/ui/Icon';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { useMemberDetailQuery } from '@/hooks/member/useMemberDetailQuery';
import { useMemberPostsQuery } from '@/hooks/member/useMemberPostsQuery';
import { buildPostPath } from '@/lib/board';
import { formatShortDateTime } from '@/lib/formatTime';

function MemberPostsContent() {
  const router = useRouter();
  const { clubId, memberId } = useParams<{ clubId: string; memberId: string }>();
  const { data: member } = useMemberDetailQuery(clubId, Number(memberId));
  const {
    data: posts = [],
    isPending,
    isError,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useMemberPostsQuery(clubId, Number(memberId));
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({ rootMargin: '200px' });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage, isIntersecting]);

  return (
    <div className="tablet:px-[64px] flex min-w-0 flex-1 flex-col gap-4 px-450 pt-450 pb-[80px]">
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex cursor-pointer items-center justify-center p-1"
        >
          <Icon src={BackIcon} size={21} className="text-icon-normal p-1" />
        </button>
        <h1 className="typo-sub3 text-text-normal">작성한 글</h1>
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
                    name: member?.name ?? '',
                    profileImageUrl: member?.profileImageUrl ?? undefined,
                  }}
                  date={formatShortDateTime(post.createdAt)}
                  dateTime={post.createdAt}
                />
              </PostCard.Header>

              <Link
                href={buildPostPath(clubId, post.postId, post.boardId)}
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
                    router.push(`${buildPostPath(clubId, post.postId, post.boardId)}#comments`)
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

export { MemberPostsContent };
