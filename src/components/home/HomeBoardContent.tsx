'use client';

import Link from 'next/link';
import { useRecentPostsQuery, useHomeQuery } from '@/hooks/home';
import { formatMonthDay } from '@/lib/formatTime';
import { fileAttachmentToFileItem } from '@/utils/shared/file';
import { PostActionMenu, PostCard } from '../board';

function HomeBoardContent() {
  const { data: postsData } = useRecentPostsQuery();
  // TODO: 이건 나중에 로컬 스토리지에나 뭐에 저장해서 비교하는 걸로 바꿔야 할 듯
  const { data: myUserId } = useHomeQuery({
    select: (data) => data.myInfo.userInfo.id,
  });
  const posts = postsData?.content ?? [];

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
                {isMyPost && (
                  <PostActionMenu postId={post.id} />
                )}
              </PostCard.Header>
              <PostCard.ListContent title={post.title} content={post.content} isNew={post.isNew} />
              <PostCard.Images files={images} />
              <PostCard.Actions likeCount={post.likeCount} commentCount={post.commentCount} />
            </PostCard.Root>
          </Link>
        );
      })}
    </main>
  );
}

export { HomeBoardContent };
