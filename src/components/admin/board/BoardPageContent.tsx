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
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

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
import { useBoardPageState } from '@/hooks/admin';
import { useCardinals } from '@/hooks/queries';
import { useAdminBoardsQuery } from '@/hooks/queries/admin/useAdminBoardsQuery';
import { useCreateBoardMutation } from '@/hooks/queries/admin/useCreateBoardMutation';
import { useUpdateBoardMutation } from '@/hooks/queries/admin/useUpdateBoardMutation';
import { useDeleteBoardMutation } from '@/hooks/queries/admin/useDeleteBoardMutation';
import { ADMIN_BOARD_ERROR, getApiErrorCode, getApiErrorMessage } from '@/lib/apis/adminBoard';
import { toastError } from '@/stores/useToastStore';
import type { Board } from '@/types/admin/board';
import type { BoardFormData } from '@/components/admin/board/modal/constants';
import { SortableBoardCard } from './SortableBoardCard';

const MAX_CUSTOM_BOARDS = 3;

interface BoardPageInnerProps {
  initialBoards: Board[];
  initialTrashedBoards: TrashedBoard[];
}

function BoardPageInner({ initialBoards, initialTrashedBoards }: BoardPageInnerProps) {
  const { data: cardinals = [] } = useCardinals();
  const [selectedCardinalId, setSelectedCardinalId] = useState<number | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createNameError, setCreateNameError] = useState<string | null>(null);
  const [editingBoardId, setEditingBoardId] = useState<number | null>(null);
  const [editNameError, setEditNameError] = useState<string | null>(null);
  const [trashModalOpen, setTrashModalOpen] = useState(false);

  const {
    boards,
    trashedBoards,
    updateBoard: updateLocalBoard,
    moveBoardToTrash,
    restoreBoardFromTrash,
    permanentlyDeleteBoard,
    handleDragEnd,
  } = useBoardPageState({
    initialBoards,
    initialTrashedBoards,
  });

  const { mutate: createBoard } = useCreateBoardMutation({
    onSuccess: () => setCreateModalOpen(false),
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === ADMIN_BOARD_ERROR.DUPLICATE_NAME) {
        setCreateNameError('같은 이름의 게시판이 이미 있어요.');
      } else {
        toastError(getApiErrorMessage(err));
      }
    },
  });

  const { mutate: updateBoard } = useUpdateBoardMutation({
    onSuccess: () => setEditingBoardId(null),
    onError: (err) => {
      const code = getApiErrorCode(err);
      if (code === ADMIN_BOARD_ERROR.DUPLICATE_NAME) {
        setEditNameError('같은 이름의 게시판이 이미 있어요.');
      } else {
        toastError(getApiErrorMessage(err));
      }
    },
  });

  const { mutate: deleteBoard } = useDeleteBoardMutation({
    onSuccess: () => setEditingBoardId(null),
    onError: (err) => toastError(getApiErrorMessage(err)),
  });

  const handleCreateBoard = (formData: BoardFormData) => {
    setCreateNameError(null);
    createBoard({
      name: formData.name,
      type: 'GENERAL',
      commentEnabled: formData.commentEnabled,
      writePermission: formData.visibility === 'ADMIN_ONLY' ? 'ADMIN' : 'USER',
      isPrivate: formData.visibility === 'PRIVATE',
    });
  };

  const activeCardinal = selectedCardinalId
    ? cardinals.find((c) => c.id === selectedCardinalId)
    : undefined;

  const query = searchValue.trim().toLowerCase();
  const filteredBoards = query
    ? boards.filter((b) => b.name.toLowerCase().includes(query))
    : boards;

  const fixedBoards = filteredBoards.filter((b) => !b.editable);
  const customBoards = filteredBoards.filter((b) => b.editable);
  const totalCustomCount = boards.filter((b) => b.editable).length;
  const reachedLimit = totalCustomCount >= MAX_CUSTOM_BOARDS;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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
        onCreateClick={
          reachedLimit
            ? () => toastError(`추가 게시판은 최대 ${MAX_CUSTOM_BOARDS}개까지 만들 수 있어요.`)
            : () => setCreateModalOpen(true)
        }
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
                  onToggleComments={(next) => updateLocalBoard(board.boardId, { commentEnabled: next })}
                />
              </Fragment>
            ))}
          </div>
        )}

        {fixedBoards.length > 0 && customBoards.length > 0 && (
          <div className="border-line w-full border-t" />
        )}

        {/* Custom boards */}
        {customBoards.length > 0 &&
          (query ? (
            <div className="flex flex-col gap-200">
              {customBoards.map((board) => (
                <BoardCard
                  key={board.boardId}
                  board={board}
                  draggable={false}
                  onToggleComments={(next) => updateLocalBoard(board.boardId, { commentEnabled: next })}
                  onEdit={() => setEditingBoardId(board.boardId)}
                  onDelete={() => moveBoardToTrash(board)}
                />
              ))}
            </div>
          ) : (
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
                        updateLocalBoard(board.boardId, { commentEnabled: next })
                      }
                      onEdit={() => setEditingBoardId(board.boardId)}
                      onDelete={() => moveBoardToTrash(board)}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          ))}

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
        onOpenChange={(open) => {
          setCreateModalOpen(open);
          if (!open) setCreateNameError(null);
        }}
        onSubmit={handleCreateBoard}
        nameError={createNameError}
        onNameChange={() => setCreateNameError(null)}
      />

      {/* Trash board modal */}
      <TrashBoardModal
        open={trashModalOpen}
        onOpenChange={setTrashModalOpen}
        boards={trashedBoards}
        onRestore={restoreBoardFromTrash}
        onPermanentDelete={permanentlyDeleteBoard}
      />

      {/* Edit board modal */}
      <EditBoardModal
        open={editingBoardId !== null}
        onOpenChange={(next) => {
          if (!next) {
            setEditingBoardId(null);
            setEditNameError(null);
          }
        }}
        board={boards.find((b) => b.boardId === editingBoardId) ?? null}
        onSubmit={(data) => {
          if (editingBoardId === null) return;
          setEditNameError(null);
          updateBoard({
            boardId: editingBoardId,
            body: {
              name: data.name.trim(),
              commentEnabled: data.commentEnabled,
              writePermission: data.visibility === 'ADMIN_ONLY' ? 'ADMIN' : 'USER',
              isPrivate: data.visibility === 'PRIVATE',
            },
          });
        }}
        onDelete={(board) => {
          deleteBoard(board.boardId);
        }}
        nameError={editNameError}
        onNameChange={() => setEditNameError(null)}
      />
    </div>
  );
}

function BoardPageContent() {
  const { data, isLoading, dataUpdatedAt } = useAdminBoardsQuery();

  if (isLoading || !data) {
    return (
      <div className="flex min-w-0 flex-col gap-400 p-700">
        <p className="typo-body2 text-text-alternative">불러오는 중...</p>
      </div>
    );
  }

  return (
    <BoardPageInner
      key={dataUpdatedAt}
      initialBoards={data.boards}
      initialTrashedBoards={data.trashedBoards}
    />
  );
}

export { BoardPageContent };
