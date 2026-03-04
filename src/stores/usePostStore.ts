import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

export interface FileItem {
  id: string;
  file: File;
  fileName: string;
  fileUrl: string;
  uploaded: boolean;
}

const initialState = {
  board: '',
  title: '',
  cardinalNumber: 0,
  part: '',
  category: '',
  studyName: '',
  week: 0,
  content: '',
  files: [] as FileItem[],
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
};

export type PostState = typeof initialState;

export const usePostStore = create(
  devtools(
    combine(initialState, (set, get) => ({
      setBoard: (board: string) => set({ board }, false, 'setBoard'),
      setTitle: (title: string) => set({ title }, false, 'setTitle'),
      setCardinalNumber: (cardinalNumber: number) =>
        set({ cardinalNumber }, false, 'setCardinalNumber'),
      setPart: (part: string) => set({ part }, false, 'setPart'),
      setCategory: (category: string) => set({ category }, false, 'setCategory'),
      setStudyName: (studyName: string) => set({ studyName }, false, 'setStudyName'),
      setWeek: (week: number) => set({ week }, false, 'setWeek'),
      setContent: (content: string) => set({ content }, false, 'setContent'),

      addFile: (file: FileItem) =>
        set((state) => ({ files: [...state.files, file] }), false, 'addFile'),

      removeFile: (id: string) =>
        set(
          (state) => ({ files: state.files.filter((f) => f.id !== id) }),
          false,
          'removeFile',
        ),

      updateFileUrl: (id: string, fileUrl: string) =>
        set(
          (state) => ({
            files: state.files.map((f) =>
              f.id === id ? { ...f, fileUrl, uploaded: true } : f,
            ),
          }),
          false,
          'updateFileUrl',
        ),

      setStatus: (status: 'DRAFT' | 'PUBLISHED') => set({ status }, false, 'setStatus'),

      reset: () => set(initialState, false, 'reset'),

      getPayload: () => {
        const state = get();
        return {
          title: state.title,
          content: state.content,
          category: state.category,
          studyName: state.studyName,
          week: state.week,
          part: state.part,
          cardinalNumber: state.cardinalNumber,
          files: state.files
            .filter((f) => f.uploaded)
            .map(({ fileName, fileUrl }) => ({ fileName, fileUrl })),
        };
      },
    })),
    { name: 'PostStore' },
  ),
);
