import type { Board } from '@/types/admin/board';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { BoardCard } from './BoardCard';

interface SortableBoardCardProps {
  board: Board;
  onToggleComments: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function SortableBoardCard({
  board,
  onToggleComments,
  onEdit,
  onDelete,
}: SortableBoardCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: board.boardId,
  });

  return (
    <BoardCard
      ref={setNodeRef}
      board={board}
      onToggleComments={onToggleComments}
      onEdit={onEdit}
      onDelete={onDelete}
      dragHandleProps={{ ...attributes, ...listeners }}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : undefined,
        opacity: isDragging ? 0.8 : undefined,
      }}
    />
  );
}
