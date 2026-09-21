import { renderHook, waitFor } from '@testing-library/react';

import { useAdminBoardsQuery } from '@/hooks/queries/admin/useAdminBoardsQuery';
import { adminBoardApi } from '@/lib/apis/adminBoard';
import { createQueryClient, createWrapper } from '@/test-utils/query';

jest.mock('@/lib/apis/adminBoard', () => ({
  adminBoardApi: { getBoards: jest.fn() },
}));
jest.mock('@/stores', () => ({ useClubId: () => 'club-1' }));

const getBoardsMock = jest.mocked(adminBoardApi.getBoards);

it('게시판 목록과 서버가 계산한 상한 메타데이터를 반환한다', async () => {
  getBoardsMock.mockResolvedValue({
    data: {
      code: 200,
      message: 'OK',
      data: {
        boards: [
          {
            id: 2,
            name: '자유',
            description: '',
            type: 'GENERAL',
            commentEnabled: true,
            writePermission: 'USER',
            isPrivate: false,
            displayOrder: 2,
            postCount: 0,
            isDeleted: false,
          },
          {
            id: 1,
            name: '공지',
            description: '',
            type: 'NOTICE',
            commentEnabled: true,
            writePermission: 'ADMIN',
            isPrivate: false,
            displayOrder: 1,
            postCount: 1,
            isDeleted: false,
          },
        ],
        activeBoardCount: 2,
        maxBoardCount: 12,
        canCreateBoard: true,
      },
    },
  } as never);

  const { result } = renderHook(() => useAdminBoardsQuery(), {
    wrapper: createWrapper(createQueryClient()),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toMatchObject({
    activeBoardCount: 2,
    maxBoardCount: 12,
    canCreateBoard: true,
  });
  expect(result.current.data?.boards.map((board) => board.name)).toEqual(['공지', '자유']);
});

it('백엔드 배포 전 기존 배열 응답도 처리한다', async () => {
  getBoardsMock.mockResolvedValue({
    data: {
      code: 200,
      message: 'OK',
      data: [
        {
          id: 1,
          name: '공지',
          description: '',
          type: 'NOTICE',
          commentEnabled: true,
          writePermission: 'ADMIN',
          isPrivate: false,
          displayOrder: 1,
          postCount: 1,
          isDeleted: false,
        },
      ],
    },
  } as never);

  const { result } = renderHook(() => useAdminBoardsQuery(), {
    wrapper: createWrapper(createQueryClient()),
  });

  await waitFor(() => expect(result.current.isSuccess).toBe(true));
  expect(result.current.data).toMatchObject({
    activeBoardCount: 1,
    maxBoardCount: 4,
    canCreateBoard: true,
  });
});
