export const adminBoardQueryKeys = {
  list: (clubId: string | null) => ['admin', 'boards', clubId] as const,
};
