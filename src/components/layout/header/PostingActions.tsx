'use client';

import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

import { Button, Icon } from '@/components/ui';
import { SendIcon } from '@/assets/icons';
import { useCreatePost, useUpdatePost } from '@/hooks';

function PostingActions() {
  const router = useRouter();
  const pathname = usePathname();

  const editMatch = pathname.match(/^\/board\/edit\/(\d+)$/);
  const editPostId = editMatch ? Number(editMatch[1]) : null;
  const isEditPage = editPostId !== null;

  const { submit: submitCreate, isPending: isCreating } = useCreatePost();
  const { submit: submitUpdate, isPending: isUpdating } = useUpdatePost();
  const isPending = isCreating || isUpdating;

  const handleSubmit = () => {
    if (isEditPage && editPostId !== null) {
      submitUpdate(editPostId);
    } else {
      submitCreate();
    }
  };

  return (
    <div className="flex items-center gap-200">
      <Button
        variant="secondary"
        size="md"
        className="typo-button1 text-text-strong px-4"
        onClick={() => router.back()}
      >
        {isEditPage ? '수정 취소' : '작성 취소'}
      </Button>
      <Button
        variant="primary"
        size="md"
        disabled={isPending}
        onClick={handleSubmit}
        className="typo-button1 gap-100"
      >
        <Icon src={SendIcon} size={20} alt="send" className="text-icon-inverse" />
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
