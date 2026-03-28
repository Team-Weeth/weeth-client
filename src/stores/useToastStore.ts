import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

type ToastVariant = 'success' | 'info' | 'error';

interface ToastItem {
  id: string;
  title: string;
  variant?: ToastVariant;
  duration?: number;
}

type ToastInput = Omit<ToastItem, 'id'>;

const initialState = {
  toasts: [] as ToastItem[],
};

export type ToastState = typeof initialState;

export const useToastStore = create(
  devtools(
    combine(initialState, (set) => ({
      addToast: (toast: ToastItem) =>
        set((state) => ({ toasts: [...state.toasts, toast] }), false, 'addToast'),

      dismissToast: (id: string) =>
        set(
          (state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }),
          false,
          'dismissToast',
        ),

      removeAll: () => set({ toasts: [] }, false, 'removeAll'),
    })),
    { name: 'ToastStore' },
  ),
);

// Selector hooks
export const useToasts = () => useToastStore((store) => store.toasts);

export const useToastActions = () =>
  useToastStore(
    useShallow((store) => ({
      addToast: store.addToast,
      dismissToast: store.dismissToast,
      removeAll: store.removeAll,
    })),
  );

let toastCount = 0;

/** Imperative toast helper */
export function toast(input: ToastInput) {
  const id = `toast-${++toastCount}-${Date.now()}`;
  const item: ToastItem = { id, ...input };
  useToastStore.getState().addToast(item);
  return id;
}

/** Convenience helpers */
export const toastSuccess = (message: string) => toast({ title: message, variant: 'success' });
export const toastInfo = (message: string) => toast({ title: message, variant: 'info' });
export const toastError = (message?: string) =>
  toast({ title: message || '오류가 발생했습니다!', variant: 'error' });

export type { ToastItem, ToastInput, ToastVariant };
