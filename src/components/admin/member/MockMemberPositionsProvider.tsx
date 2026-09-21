'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';
import { getMockMemberPosition } from '@/mocks/memberPositions';

const MockMemberPositionsContext = createContext<{
  getPositionId: (memberId: string) => string | null;
  setPosition: (memberId: string, positionId: string | null) => void;
} | null>(null);

// API 연동 전 테이블, 검색 결과, 상세 화면이 공유하는 페이지 내 목 상태입니다.
export function MockMemberPositionsProvider({ children }: { children: ReactNode }) {
  const state = usePositionState();
  return <MockMemberPositionsContext value={state}>{children}</MockMemberPositionsContext>;
}

function usePositionState() {
  const [overrides, setOverrides] = useState<Record<string, string | null>>({});
  return {
    getPositionId: (memberId: string) =>
      memberId in overrides ? overrides[memberId] : getMockMemberPosition(memberId),
    setPosition: (memberId: string, positionId: string | null) =>
      setOverrides((previous) => ({ ...previous, [memberId]: positionId })),
  };
}

export function useMockMemberPositions() {
  const shared = useContext(MockMemberPositionsContext);
  const local = usePositionState();
  return shared ?? local;
}
