import { create } from 'zustand';
import { combine, devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  // key: `${userId}:${clubId}:${tourId}` → last version seen. Persisted.
  completed: {} as Record<string, number>,
  // Single "currently running" slot so only one tour plays at a time. Holds a TourDefinition.id
  // (not the TourId union — see .claude/rules/tour.md, registry.ts enforces registry membership). Memory-only.
  activeTourId: null as string | null,
  // e.g. an open modal that should hold off any tour. Memory-only.
  suppressors: [] as string[],
  // false until the client has read persisted `completed` — gates first render. Memory-only.
  hasHydrated: false,
};

export type TourState = typeof initialState;

export const useTourStore = create(
  devtools(
    persist(
      combine(initialState, (set, get) => ({
        markSeen: (key: string, version: number) =>
          set(
            (state) => ({ completed: { ...state.completed, [key]: version } }),
            false,
            'markSeen',
          ),

        /** Acquires the single-tour lock. Returns false if another tour already holds it. */
        requestStart: (tourId: string) => {
          const { activeTourId } = get();
          if (activeTourId !== null && activeTourId !== tourId) return false;
          set({ activeTourId: tourId }, false, 'requestStart');
          return true;
        },
        finish: () => set({ activeTourId: null }, false, 'finish'),

        suppress: (id: string) =>
          set(
            (state) =>
              state.suppressors.includes(id) ? state : { suppressors: [...state.suppressors, id] },
            false,
            'suppress',
          ),
        release: (id: string) =>
          set(
            (state) => ({ suppressors: state.suppressors.filter((s) => s !== id) }),
            false,
            'release',
          ),

        setHasHydrated: (hasHydrated: boolean) => set({ hasHydrated }, false, 'setHasHydrated'),
        reset: () => set(initialState, false, 'reset'),
      })),
      {
        name: 'weeth-tour',
        version: 1,
        partialize: (state) => ({ completed: state.completed }),
        onRehydrateStorage: () => (state) => {
          state?.setHasHydrated(true);
        },
      },
    ),
    { name: 'TourStore' },
  ),
);

export const useTourCompleted = () => useTourStore((store) => store.completed);
export const useTourHasHydrated = () => useTourStore((store) => store.hasHydrated);
export const useIsTourSuppressed = () => useTourStore((store) => store.suppressors.length > 0);
export const useActiveTourId = () => useTourStore((store) => store.activeTourId);

export const useTourActions = () =>
  useTourStore(
    useShallow((store) => ({
      markSeen: store.markSeen,
      requestStart: store.requestStart,
      finish: store.finish,
      suppress: store.suppress,
      release: store.release,
      reset: store.reset,
    })),
  );
