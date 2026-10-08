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
import type { FileItem, DisplayFile } from '@/types/file';
import { buildPostPath } from '@/lib/board';
import { PostActionMenu } from './PostActionMenu';
import { PostCard } from './PostCard';
import { BoardContentSkeleton } from './BoardContentSkeleton';

/**
 * 게시글 목록용 이미지 목록 생성.
 * fileUrls에 이미지가 있으면 그대로 반환하고,
 * 없으면 content HTML에서 인라인 이미지 src를 추출한다.
 * (인라인 이미지 전용 게시글에서 목록 미리보기를 표시하기 위함)
 */
function toDisplayImages(files: FileItem[], content: string): DisplayFile[] {
  const fileImages = files
    .filter((f) => f.contentType.startsWith('image/'))
    .map((f) => ({ id: f.fileId, fileName: f.fileName, fileUrl: f.fileUrl, uploaded: true }));

  if (fileImages.length > 0) return fileImages;

  // fileUrls에 이미지가 없을 때: content HTML의 img[src] 속성에서 추출
  const doc = new DOMParser().parseFromString(content, 'text/html');
  return Array.from(doc.querySelectorAll('img'))
    .map((img, i) => ({
      id: `inline-${i}`,
      fileName: '',
      fileUrl: img.getAttribute('src') ?? '',
    }))
    .filter((item) => item.fileUrl !== '');
}

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
      {filteredPosts.map((post) => (
        <PostCard.Root key={post.id} className="relative">
          <PostCard.Header>
            <PostCard.Author
              author={post.author}
              date={formatShortDateTime(post.time)}
              hasAttachment={post.fileUrls.length > 0}
            />
            {currentUserId === post.author.id && (
              <div className="relative z-10">
                <PostActionMenu postId={post.id} boardId={post.boardId} />
              </div>
            )}
          </PostCard.Header>
          <Link
            href={buildPostPath(clubId, post.id, post.boardId)}
            className="after:absolute after:inset-0 after:content-['']"
          >
            <PostCard.ListContent title={post.title} content={post.content} isNew={post.isNew} />
          </Link>
          <div className="relative z-10">
            <PostCard.Images files={toDisplayImages(post.fileUrls, post.content)} />
          </div>
          <div className="relative z-10">
            <PostCard.Actions
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
        </PostCard.Root>
      ))}
      {isFetchingNextPage && <BoardContentSkeleton />}
      <div ref={sentinelRef} />
    </main>
  );
}

export { BoardContent };
