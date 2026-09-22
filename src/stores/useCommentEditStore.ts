import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  activeEditId: null as number | string | null,
};

const useCommentEditStore = create(
  devtools(
    combine(initialState, (set) => ({
      startEdit: (id: number | string) => set({ activeEditId: id }, false, 'startEdit'),
      cancelEdit: () => set(initialState, false, 'cancelEdit'),
    })),
    { name: 'CommentEditStore' },
  ),
);

export const useActiveEditId = () => useCommentEditStore((s) => s.activeEditId);
export const useCommentEditActions = () =>
  useCommentEditStore(useShallow((s) => ({ startEdit: s.startEdit, cancelEdit: s.cancelEdit })));

// 테스트 전용 — 컴포넌트에서 직접 사용 금지
export { useCommentEditStore };
