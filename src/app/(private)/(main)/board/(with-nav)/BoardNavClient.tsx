'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { BoardNav } from '@/components/board';
import { useActiveBoardId, useSetActiveBoardId } from '@/stores/useBoardNavStore';
import type { BoardNavItem } from '@/types/board';

interface BoardNavClientProps {
  items: BoardNavItem[];
}

function BoardNavClient({ items }: BoardNavClientProps) {
  const activeBoardId = useActiveBoardId();
  const setActiveBoardId = useSetActiveBoardId();
  const pathname = usePathname();
  const router = useRouter();

  const isDetailPage = /^\/board\/\d+$/.test(pathname);

  useEffect(() => {
    if (activeBoardId === null) return;
    const exists = items.some((item) => item.id === activeBoardId);
    if (!exists) {
      setActiveBoardId(null);
    }
  }, [items, activeBoardId, setActiveBoardId]);

  const handleItemSelect = (id: number | null) => {
    setActiveBoardId(id);
    if (isDetailPage) {
      router.push('/board');
    }
  };

  return <BoardNav items={items} activeId={activeBoardId} onItemSelect={handleItemSelect} />;
}

export { BoardNavClient };
