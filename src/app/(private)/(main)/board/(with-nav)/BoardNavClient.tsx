'use client';

import { useEffect } from 'react';

import { BoardNav } from '@/components/board';
import { useActiveBoardId, useSetActiveBoardId } from '@/stores/useBoardNavStore';
import type { BoardNavItem } from '@/types/board';

interface BoardNavClientProps {
  items: BoardNavItem[];
}

function BoardNavClient({ items }: BoardNavClientProps) {
  const activeBoardId = useActiveBoardId();
  const setActiveBoardId = useSetActiveBoardId();

  useEffect(() => {
    if (activeBoardId === null) return;
    const exists = items.some((item) => item.id === activeBoardId);
    if (!exists) {
      setActiveBoardId(null);
    }
  }, [items, activeBoardId, setActiveBoardId]);

  return <BoardNav items={items} activeId={activeBoardId} onItemSelect={setActiveBoardId} />;
}

export { BoardNavClient };
