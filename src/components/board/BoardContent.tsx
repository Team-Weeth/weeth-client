'use client';

import Link from 'next/link';
import { useBoardPosts } from '@/hooks';
import { useUserId } from '@/stores/useUserStore';
import { useActiveBoardId } from '@/stores/useBoardNavStore';
import { formatShortDateTime } from '@/lib/formatTime';
import { PostActionMenu } from './PostActionMenu';
import { PostCard } from './PostCard';
import { BoardContentSkeleton } from './BoardContentSkeleton';

function BoardContent() {
  const activeBoardId = useActiveBoardId();
  const currentUserId = useUserId();
  const { data, isLoading } = useBoardPosts(activeBoardId);

  if (isLoading) return <BoardContentSkeleton />;

  const posts = data?.content ?? [];

  return (
    <main className="flex min-w-0 flex-1 flex-col gap-400">
      {posts.map((post) => (
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
            <PostCard.Content
              title={post.title}
              content={post.content}
              isNew={post.isNew}
            />
            <PostCard.Actions
              likeCount={post.like.likeCount}
              commentCount={post.commentCount}
            />
          </PostCard.Root>
        </Link>
      ))}
    </main>
  );
}

export { BoardContent };
