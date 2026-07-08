import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// 선택된 기수를 페이지 이동 간에도 유지하기 위한 전역 스토어.
// clubId + scope 조합을 키로 사용해 클럽별/기능별 선택을 분리한다.
// (예: 회비('dues')와 출석/일정('default') 선택이 서로 섞이지 않도록)
const initialState = {
  selections: {} as Record<string, number>,
};

export type SelectedCardinalState = typeof initialState;

const buildKey = (clubId: string, scope: string) => `${clubId}:${scope}`;

export const useSelectedCardinalStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        // cardinalNumber가 null이면 해당 키의 선택을 해제한다(전체 보기 등).
        select: (clubId: string, scope: string, cardinalNumber: number | null) =>
          set(
            (state) => {
              const key = buildKey(clubId, scope);
              const next = { ...state.selections };
              if (cardinalNumber === null) {
                delete next[key];
              } else {
                next[key] = cardinalNumber;
              }
              return { selections: next };
            },
            false,
            'select',
          ),
        reset: () => set(initialState, false, 'reset'),
      })),
      {
        name: 'selectedCardinal',
        // 액션은 제외하고 선택 상태(selections)만 저장한다.
        partialize: (state) => ({ selections: state.selections }),
      },
    ),
    { name: 'SelectedCardinalStore' },
  ),
);

export const useSelectedCardinalNumber = (clubId: string | null, scope: string) =>
  useSelectedCardinalStore((store) =>
    clubId ? (store.selections[buildKey(clubId, scope)] ?? null) : null,
  );

export const useSelectedCardinalActions = () =>
  useSelectedCardinalStore(
    useShallow((store) => ({
      select: store.select,
      reset: store.reset,
    })),
  );
