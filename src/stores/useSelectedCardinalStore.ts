import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

// 어드민 회비 페이지에서 선택된 기수를 페이지 이동 간 유지하기 위한 전역 스토어.
// clubId + scope 조합을 키로 사용해 클럽별/기능별 선택을 분리한다.
// (예: 회비('dues')와 출석/일정('default') 선택이 서로 섞이지 않도록)
// 키 값이 number면 해당 기수, null이면 "전체"를 명시적으로 선택한 상태,
// 키 자체가 없으면 아직 아무것도 선택하지 않은 상태다 (autoSelectLatest가 이 둘을 구분해야 한다).
const initialState = {
  selections: {} as Record<string, number | null>,
};

export type SelectedCardinalState = typeof initialState;

const buildKey = (clubId: string, scope: string) => `${clubId}:${scope}`;

export const useSelectedCardinalStore = create(
  devtools(
    persist(
      combine(initialState, (set) => ({
        // cardinalNumber가 null이면 "전체"를 명시적으로 선택한 것으로 저장한다.
        select: (clubId: string, scope: string, cardinalNumber: number | null) =>
          set(
            (state) => {
              const key = buildKey(clubId, scope);
              return { selections: { ...state.selections, [key]: cardinalNumber } };
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

/** number: 특정 기수, null: 전체 명시적 선택, undefined: 아직 선택하지 않음 */
export const useSelectedCardinalNumber = (clubId: string | null, scope: string) =>
  useSelectedCardinalStore((store) =>
    clubId ? store.selections[buildKey(clubId, scope)] : undefined,
  );

export const useSelectedCardinalActions = () =>
  useSelectedCardinalStore(
    useShallow((store) => ({
      select: store.select,
      reset: store.reset,
    })),
  );
