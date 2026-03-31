'use client';

import { BoardNav } from '@/components/board';
import { useActiveBoardId, useSetActiveBoardId } from '@/stores/useBoardNavStore';
import type { BoardNavItem } from '@/types/board';

interface BoardNavClientProps {
  items: BoardNavItem[];
}

function BoardNavClient({ items }: BoardNavClientProps) {
  const activeBoardId = useActiveBoardId();
  const setActiveBoardId = useSetActiveBoardId();

  return (
    <BoardNav
      items={items}
      activeId={activeBoardId}
      onItemSelect={setActiveBoardId}
    />
  );
}

export { BoardNavClient };
