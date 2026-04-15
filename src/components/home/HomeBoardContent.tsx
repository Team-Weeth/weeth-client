'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRecentPostsQuery, useHomeQuery } from '@/hooks/home';
import { useIntersectionObserver } from '@/hooks/board/useIntersectionObserver';
import { formatMonthDay } from '@/lib/formatTime';
import { fileAttachmentToFileItem } from '@/utils/shared/file';
import { PostActionMenu, PostCard } from '../board';
import { Avatar, AvatarFallback, Button } from '@/components/ui';
import { AvatarIcon } from '@/assets/icons';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useIsAdmin } from '@/hooks/shared';

function HomeBoardContent() {
  const { isAdmin } = useIsAdmin();
  const router = useRouter();
  const { data: posts, fetchNextPage, hasNextPage, isFetchingNextPage } = useRecentPostsQuery();
  const { data: myUserId } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.id,
  });
  const { ref: sentinelRef, isIntersecting } = useIntersectionObserver({
    rootMargin: '200px',
  });

  useEffect(() => {
    if (isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [isIntersecting, hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (!posts || posts.length === 0) {
    return (
      <main className="bg-container-neutral flex min-w-0 flex-col items-start justify-center gap-300 rounded-lg px-450 py-400">
        <div className="flex items-center justify-start gap-100">
          <Avatar size={24} type="round">
            <AvatarFallback>
              <Image src={AvatarIcon} alt="profile" width={24} height={24} />
            </AvatarFallback>
          </Avatar>
          <p className="typo-caption1">Weeth 관리자</p>
        </div>
        <p className="typo-sub2 text-text-strong">
          {isAdmin ? '사이트 개설을 축하합니다!' : '아직 게시된 글이 없어요!'}
          <br />첫 게시글을 작성해서 커뮤니티를 활성화해보세요.
        </p>
        <div className="bg-background flex h-[182px] w-full items-center justify-center rounded-md p-300">
          <Button variant="primary" size="lg" onClick={() => router.push('/board/write')}>
            게시글 작성하기
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-400">
      {posts.map((post) => {
        const isMyPost = myUserId !== undefined && post.author.id === myUserId;
        const images = post.fileUrls.map(fileAttachmentToFileItem);
        const hasAttachment = post.fileUrls.length > 0;

        return (
          <Link key={post.id} href={`/board/${post.id}`}>
            <PostCard.Root>
              <PostCard.Header>
                <PostCard.Author
                  author={{
                    ...post.author,
                    profileImageUrl: post.author.profileImageUrl ?? undefined,
                  }}
                  date={formatMonthDay(post.time)}
                  dateTime={post.time}
                  hasAttachment={hasAttachment}
                />
                {isMyPost && <PostActionMenu postId={post.id} />}
              </PostCard.Header>
              <PostCard.ListContent title={post.title} content={post.content} isNew={post.isNew} />
              <PostCard.Images files={images} />
              <PostCard.Actions
                postId={post.id}
                likeCount={post.likeCount}
                commentCount={post.commentCount}
              />
            </PostCard.Root>
          </Link>
        );
      })}
      <div ref={sentinelRef} />
    </main>
  );
}

export { HomeBoardContent };
