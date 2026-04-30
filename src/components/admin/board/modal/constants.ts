import type { DiscardMessages } from '@/components/admin/modal/DiscardConfirmDialog';
import type { BoardVisibility } from '@/types/admin/board';

const NAME_MAX = 20;
const DESCRIPTION_MAX = 30;

const VISIBILITY_OPTIONS: { value: BoardVisibility; label: string }[] = [
  { value: 'PUBLIC', label: '전체 공개' },
  { value: 'ADMIN_ONLY', label: '운영진 전용' },
  { value: 'PRIVATE', label: '비공개' },
];

interface BoardFormData {
  name: string;
  description: string;
  visibility: BoardVisibility;
  commentEnabled: boolean;
}

const DEFAULT_FORM: BoardFormData = {
  name: '',
  description: '',
  visibility: 'PUBLIC',
  commentEnabled: true,
};

type BoardFormMode = 'create' | 'edit';

const DISCARD_MESSAGES: Record<BoardFormMode, DiscardMessages> = {
  create: {
    title: '작성하던 내용이 있어요.\n내용을 폐기하고 나갈까요?',
    actionLabel: '나가기',
    cancelLabel: '보관하기',
  },
  edit: {
    title: '변경사항이 있어요.\n변경사항을 폐기할까요?',
    actionLabel: '변경사항 폐기',
  },
};

export {
  NAME_MAX,
  DESCRIPTION_MAX,
  VISIBILITY_OPTIONS,
  DEFAULT_FORM,
  DISCARD_MESSAGES,
  type BoardFormData,
  type BoardFormMode,
};
