'use client';

import { usePathname } from 'next/navigation';

import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import SendIcon from '@/assets/icons/send.svg';
import { useCreatePost } from '@/hooks/board/useCreatePost';
import { useUpdatePost } from '@/hooks/board/useUpdatePost';

function PostingActions() {
  const pathname = usePathname();

  const editMatch = pathname.match(/^\/[^/]+\/board\/edit\/(\d+)$/);
  const editPostId = editMatch ? Number(editMatch[1]) : null;
  const isEditPage = editPostId !== null;

  const { createPost, isPending: isCreating } = useCreatePost();
  const { updatePost, isPending: isUpdating } = useUpdatePost();
  const isPending = isCreating || isUpdating;

  const handleSubmit = () => {
    if (isEditPage) {
      updatePost(editPostId);
    } else {
      createPost();
    }
  };

  return (
    <div className="flex items-center gap-200">
      <Button
        variant="secondary"
        size="sm"
        className="tablet:typo-button1 tablet:rounded-md tablet:px-4 text-text-strong whitespace-nowrap"
        onClick={() => history.back()}
      >
        {isEditPage ? '수정 취소' : '작성 취소'}
      </Button>
      <Button
        variant="primary"
        size="sm"
        disabled={isPending}
        onClick={handleSubmit}
        className="tablet:typo-button1 tablet:rounded-md gap-100 whitespace-nowrap"
      >
        <Icon
          src={SendIcon}
          size={20}
          alt="send"
          className="tablet:inline-flex text-icon-inverse hidden"
        />
        {isEditPage
          ? isPending
            ? '수정 중...'
            : '수정 완료'
          : isPending
            ? '게시 중...'
            : '게시하기'}
      </Button>
    </div>
  );
}

export { PostingActions };
