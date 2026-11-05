'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useParams, useRouter } from 'next/navigation';
import { Divider } from '@/components/ui/Divider';
import { PostCard } from '@/components/board/PostCard';
import { PostDetailHeader } from '@/components/board/PostDetailHeader';
import { PostActionMenu } from '@/components/board/PostActionMenu';
import { FileList } from '@/components/board/FileList';
import { formatShortDateTime } from '@/lib/formatTime';
import { toDisplayFile, isImageFileByType, buildBoardPath } from '@/lib/board';
import { isFileReferencedInContent } from '@/lib/board/getUnreferencedFiles';
import { usePostDetailQuery } from '@/hooks/board/usePostDetailQuery';
import { useSetActiveBoardId, useBoardTypeMap } from '@/stores/useBoardNavStore';
import { useClubId } from '@/stores/useClubStore';
import { useUserId } from '@/stores/useUserStore';
import { boardApi } from '@/lib/apis/board';
import { parseApiError } from '@/lib/error';
import { BOARD_PAGE_ERRORS } from '@/constants/board/error';
import { toastError } from '@/stores/useToastStore';
import type { PostDetail } from '@/types/board';

const CommentSection = dynamic(
  () => import('./CommentSection').then((m) => ({ default: m.CommentSection })),
  { ssr: false },
);

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/'/g, '&#39;');
}

interface PostDetailContentProps {
  initialData: PostDetail;
}

function PostDetailContent({ initialData }: PostDetailContentProps) {
  const router = useRouter();
  const { clubId: clubIdParam } = useParams<{
    clubId: string;
    boardId: string;
  }>();
  const currentUserId = useUserId();
  const clubId = useClubId();
  const setActiveBoardId = useSetActiveBoardId();
  const boardTypeMap = useBoardTypeMap();

  const { data, isError, error } = usePostDetailQuery(
    initialData.boardId,
    initialData.id,
    initialData,
  );
  const currentPost = data ?? initialData;

  useEffect(() => {
    if (!isError || !error) return;
    const parsed = parseApiError(error);
    const known = parsed ? BOARD_PAGE_ERRORS[parsed.code] : null;
    if (known) {
      toastError(known.message);
      router.replace(`/${clubIdParam}/board`);
    }
  }, [isError, error, router, clubIdParam]);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      const el = document.getElementById(hash.slice(1));
      el?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  useEffect(() => {
    setActiveBoardId(currentPost.boardId);
  }, [currentPost.boardId, setActiveBoardId]);

  useEffect(() => {
    if (clubId && boardTypeMap[currentPost.boardId] === 'NOTICE') {
      boardApi.readAllNotices(clubId, currentPost.boardId).catch(() => {});
    }
  }, [clubId, currentPost.boardId, boardTypeMap]);

  const isPostAuthor = currentUserId !== null && currentPost.author.id === currentUserId;
  const canComment = currentPost.boardConfig?.canComment ?? true;

  const unreferencedImageHtml = currentPost.fileUrls
    .filter(
      (f) => isImageFileByType(f.contentType) && !isFileReferencedInContent(f, currentPost.content),
    )
    .map(
      (f) =>
        `<figure><img src="${escapeHtml(f.fileUrl)}" alt="${escapeHtml(f.fileName)}" /></figure>`,
    )
    .join('\n');

  const contentWithImages = unreferencedImageHtml
    ? `${currentPost.content}\n${unreferencedImageHtml}`
    : currentPost.content;

  const nonImageFiles = currentPost.fileUrls
    .filter(
      (f) =>
        !isImageFileByType(f.contentType) && !isFileReferencedInContent(f, currentPost.content),
    )
    .map(toDisplayFile);

  return (
    <main className="bg-container-neutral flex flex-1 flex-col items-center overflow-hidden rounded-(--radius-lg)">
      <PostDetailHeader />

      <div className="flex flex-col items-start gap-600 self-stretch px-450 pt-450">
        <PostCard.Header>
          <PostCard.Title title={currentPost.title} isNew={currentPost.isNew} size="detail" />
          {isPostAuthor && (
            <PostActionMenu
              postId={currentPost.id}
              boardId={currentPost.boardId}
              onEdit={() =>
                router.push(
                  `/${clubIdParam}/board/edit/${currentPost.id}?boardId=${currentPost.boardId}`,
                )
              }
              onDeleted={() => router.push(buildBoardPath(clubIdParam, currentPost.boardId))}
            />
          )}
        </PostCard.Header>

        <PostCard.Author
          author={{
            name: currentPost.author.name,
            profileImageUrl: currentPost.author.profileImageUrl,
          }}
          date={formatShortDateTime(currentPost.time)}
          hasAttachment={currentPost.fileUrls.length > 0}
        />

        <Divider />

        <PostCard.Body content={contentWithImages} priority />

        <FileList files={nonImageFiles} />

        <PostCard.Actions
          postId={currentPost.id}
          boardId={currentPost.boardId}
          likeCount={currentPost.like.likeCount}
          commentCount={currentPost.commentCount}
          isLiked={currentPost.like.isLiked}
          canComment={canComment}
          onComment={() =>
            document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
          }
        />
      </div>

      <CommentSection
        boardId={currentPost.boardId}
        postId={currentPost.id}
        comments={currentPost.comments}
        canComment={canComment}
        currentUserId={currentUserId}
      />
    </main>
  );
}

export { PostDetailContent };
