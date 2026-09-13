'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import BackIcon from '@/assets/icons/back.svg';
import { PostCard } from '@/components/board/PostCard';
import { Icon } from '@/components/ui/Icon';
import { MOCK_MEMBER_POSTS, MOCK_MEMBER_PROFILES } from '@/constants/mock';
import { buildPostPath } from '@/lib/board';
import { formatShortDateTime } from '@/lib/formatTime';

function MemberPostsContent() {
  const router = useRouter();
  const { clubId, memberId } = useParams<{ clubId: string; memberId: string }>();
  const member = MOCK_MEMBER_PROFILES.find((item) => item.id === Number(memberId));
  const posts = MOCK_MEMBER_POSTS.filter((post) => post.memberId === Number(memberId));

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

      {posts.length === 0 ? (
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

              <PostCard.Images files={post.files} className="relative z-10" />

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
        </main>
      )}
    </div>
  );
}

export { MemberPostsContent };
