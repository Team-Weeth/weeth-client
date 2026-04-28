import { useBoardList } from '@/hooks';
import { toBoardNavItem } from '@/lib/board';

export function useWritableBoards() {
  const { data: boards } = useBoardList();
  const items = boards?.map(toBoardNavItem) ?? [];
  const writableItems = items.filter((item) => item.type !== 'ALL' && item.canWrite !== false);

  return { boards, items, writableItems };
}
