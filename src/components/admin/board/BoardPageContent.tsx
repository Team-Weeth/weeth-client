'use client';

import { Fragment, useState } from 'react';
import Image from 'next/image';
import {
  DndContext,
  PointerSensor,
  KeyboardSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import {
  Card,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  Icon,
} from '@/components/ui';
import { ArrowDownIcon, InfoCircleIcon } from '@/assets/icons';
import { BoardCard } from '@/components/admin/board/BoardCard';
import { BoardToolbar } from '@/components/admin/board/BoardToolbar';
import { CreateBoardModal } from '@/components/admin/board/modal/CreateBoardModal';
import { EditBoardModal } from '@/components/admin/board/modal/EditBoardModal';
import { TrashBoardModal, type TrashedBoard } from '@/components/admin/board/modal/TrashBoardModal';
import { useCardinals } from '@/hooks/queries';
import type { Board } from '@/types/admin/board';

const MAX_CUSTOM_BOARDS = 3;

// TODO: API 연동 전 임시 데이터
const MOCK_BOARDS: Board[] = [
  {
    boardId: 1,
    name: '전체 게시판',
    description: '모든 게시글을 확인할 수 있는 게시판입니다.',
    kind: 'ALL',
    visibility: 'PUBLIC',
    postCount: 32,
    commentEnabled: null,
    editable: false,
  },
  {
    boardId: 2,
    name: '공지',
    description: '운영진이 공지사항을 올리는 게시판입니다.',
    kind: 'NOTICE',
    visibility: 'ADMIN_ONLY',
    postCount: 32,
    commentEnabled: true,
    editable: false,
  },
  {
    boardId: 3,
    name: '자유 게시판',
    description: '모든 게시글을 확인할 수 있는 게시판입니다.',
    kind: 'CUSTOM',
    visibility: 'PUBLIC',
    postCount: 32,
    commentEnabled: true,
    editable: true,
  },
  {
    boardId: 4,
    name: '자유 게시판',
    description: '모든 게시글을 확인할 수 있는 게시판입니다.',
    kind: 'CUSTOM',
    visibility: 'PUBLIC',
    postCount: 32,
    commentEnabled: true,
    editable: true,
  },
];

const MOCK_TRASHED_BOARDS: TrashedBoard[] = [
  {
    boardId: 101,
    name: '자유 게시판',
    description: '모든 게시글을 확인할 수 있는 게시판입니다.',
    daysLeft: 30,
  },
];

interface SortableBoardCardProps {
  board: Board;
  onToggleComments: (next: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

function SortableBoardCard({
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

function BoardPageContent() {
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [boards, setBoards] = useState<Board[]>(MOCK_BOARDS);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [trashModalOpen, setTrashModalOpen] = useState(false);
  const [trashedBoards, setTrashedBoards] = useState<TrashedBoard[]>(MOCK_TRASHED_BOARDS);

  const activeCardinal = selectedCardinalId
    ? cardinals.find((c) => c.id === selectedCardinalId)
    : undefined;

  const query = searchValue.trim().toLowerCase();
  const filteredBoards = query
    ? boards.filter((b) => b.name.toLowerCase().includes(query))
    : boards;

  const fixedBoards = filteredBoards.filter((b) => !b.editable);
  const customBoards = filteredBoards.filter((b) => b.editable);
  const reachedLimit = customBoards.length >= MAX_CUSTOM_BOARDS;

  const updateBoard = (boardId: number, patch: Partial<Board>) => {
    setBoards((prev) => prev.map((b) => (b.boardId === boardId ? { ...b, ...patch } : b)));
  };

  const moveBoardToTrash = (board: Board) => {
    setBoards((prev) => prev.filter((b) => b.boardId !== board.boardId));
    setTrashedBoards((prev) => [
      ...prev,
      {
        boardId: board.boardId,
        name: board.name,
        description: board.description,
        daysLeft: 30,
      },
    ]);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBoards((prev) => {
      const customIds = prev.filter((b) => b.editable).map((b) => b.boardId);
      const oldIndex = customIds.indexOf(Number(active.id));
      const newIndex = customIds.indexOf(Number(over.id));
      if (oldIndex === -1 || newIndex === -1) return prev;

      const reorderedCustomIds = arrayMove(customIds, oldIndex, newIndex);
      const customById = new Map(
        prev.filter((b) => b.editable).map((b) => [b.boardId, b] as const),
      );

      const result: Board[] = [];
      let cursor = 0;
      for (const board of prev) {
        if (board.editable) {
          const nextId = reorderedCustomIds[cursor++];
          result.push(customById.get(nextId)!);
        } else {
          result.push(board);
        }
      }
      return result;
    });
  };

  return (
    <div className="flex min-w-0 flex-col gap-400 p-700">
      {/* Cardinal filter */}
      <Card className="w-fit">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="border-line flex cursor-pointer items-center gap-700 rounded-sm border py-300 pr-300 pl-400"
            >
              <span className="typo-sub2 text-text-normal w-12 text-left">
                {activeCardinal ? `${activeCardinal.cardinalNumber}기` : '기수'}
              </span>
              <Image src={ArrowDownIcon} alt="기수 선택" width={24} height={24} />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            {cardinals.map((c) => (
              <DropdownMenuItem key={c.id} onSelect={() => setSelectedCardinalId(c.id)}>
                {c.cardinalNumber}기
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </Card>

      {/* Toolbar: search + trash + create */}
      <BoardToolbar
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        trashCount={trashedBoards.length}
        onTrashClick={() => setTrashModalOpen(true)}
        onCreateClick={reachedLimit ? undefined : () => setCreateModalOpen(true)}
      />

      {/* Board list */}
      <div className="flex flex-col gap-400">
        {/* Fixed (system) boards */}
        {fixedBoards.length > 0 && (
          <div className="flex flex-col gap-400">
            {fixedBoards.map((board, index) => (
              <Fragment key={board.boardId}>
                {index > 0 && <div className="border-line w-full border-t" />}
                <BoardCard
                  board={board}
                  draggable={false}
                  onToggleComments={(next) => updateBoard(board.boardId, { commentEnabled: next })}
                />
              </Fragment>
            ))}
          </div>
        )}

        {fixedBoards.length > 0 && customBoards.length > 0 && (
          <div className="border-line w-full border-t" />
        )}

        {/* Custom boards */}
        {customBoards.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={customBoards.map((b) => b.boardId)}
              strategy={verticalListSortingStrategy}
            >
              <div className="flex flex-col gap-200">
                {customBoards.map((board) => (
                  <SortableBoardCard
                    key={board.boardId}
                    board={board}
                    onToggleComments={(next) =>
                      updateBoard(board.boardId, { commentEnabled: next })
                    }
                    onEdit={() => setEditingBoardId(board.boardId)}
                    onDelete={() => moveBoardToTrash(board)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}

        {/* Limit banner */}
        <div className="bg-container-neutral-alternative flex h-12 items-center gap-200 rounded-md p-300">
          <Icon src={InfoCircleIcon} size={20} className="text-icon-alternative" />
          <p className="typo-body2 text-text-alternative min-w-0 flex-1">
            추가 게시판은 최대 {MAX_CUSTOM_BOARDS}개입니다.
          </p>
        </div>
      </div>

      {/* Create board modal */}
      <CreateBoardModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={(data) => {
          setBoards((prev) => [
            ...prev,
            {
              boardId: Math.max(0, ...prev.map((b) => b.boardId)) + 1,
              name: data.name.trim(),
              description: data.description.trim(),
              kind: 'CUSTOM',
              visibility: data.visibility,
              postCount: 0,
              commentEnabled: data.commentEnabled,
              editable: true,
            },
          ]);
        }}
      />

      {/* Trash board modal */}
      <TrashBoardModal
        open={trashModalOpen}
        onOpenChange={setTrashModalOpen}
        boards={trashedBoards}
        onRestore={(boardId) => {
          setTrashedBoards((prev) => prev.filter((b) => b.boardId !== boardId));
        }}
        onPermanentDelete={(boardId) => {
          setTrashedBoards((prev) => prev.filter((b) => b.boardId !== boardId));
        }}
      />

      {/* Edit board modal */}
      <EditBoardModal
        open={editingBoardId !== null}
        onOpenChange={(next) => {
          if (!next) setEditingBoardId(null);
        }}
        board={boards.find((b) => b.boardId === editingBoardId) ?? null}
        onSubmit={(data) => {
          if (editingBoardId === null) return;
          updateBoard(editingBoardId, {
            name: data.name.trim(),
            description: data.description.trim(),
            visibility: data.visibility,
            commentEnabled: data.commentEnabled,
          });
        }}
        onDelete={(board) => {
          moveBoardToTrash(board);
          setEditingBoardId(null);
        }}
      />
    </div>
  );
}

export { BoardPageContent };
