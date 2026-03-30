import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

export interface FileItem {
  id: string;
  file: File;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  uploaded: boolean;
}

const initialState = {
  board: null as number | null,
  title: '',
  generationNumber: 0,
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
      setBoard: (board: number | null) => set({ board }, false, 'setBoard'),
      setTitle: (title: string) => set({ title }, false, 'setTitle'),
      setGenerationNumber: (generationNumber: number) =>
        set({ generationNumber }, false, 'setgenerationNumber'),
      setPart: (part: string) => set({ part }, false, 'setPart'),
      setCategory: (category: string) => set({ category }, false, 'setCategory'),
      setStudyName: (studyName: string) => set({ studyName }, false, 'setStudyName'),
      setWeek: (week: number) => set({ week }, false, 'setWeek'),
      setContent: (content: string) => set({ content }, false, 'setContent'),

      addFile: (file: FileItem) =>
        set((state) => ({ files: [...state.files, file] }), false, 'addFile'),

      addFiles: (newFiles: FileItem[]) =>
        set((state) => ({ files: [...state.files, ...newFiles] }), false, 'addFiles'),

      removeFile: (id: string) =>
        set((state) => ({ files: state.files.filter((f) => f.id !== id) }), false, 'removeFile'),

      markUploaded: (id: string, storageKey: string, fileUrl: string) =>
        set(
          (state) => ({
            files: state.files.map((f) => {
              if (f.id !== id) return f;
              if (f.fileUrl.startsWith('blob:')) URL.revokeObjectURL(f.fileUrl);
              return { ...f, storageKey, fileUrl, uploaded: true };
            }),
          }),
          false,
          'markUploaded',
        ),

      setStatus: (status: 'DRAFT' | 'PUBLISHED') => set({ status }, false, 'setStatus'),

      reset: () => {
        const { files } = get();
        for (const f of files) {
          if (f.fileUrl.startsWith('blob:')) URL.revokeObjectURL(f.fileUrl);
        }
        set(initialState, false, 'reset');
      },

      getPayload: () => {
        const state = get();
        return {
          title: state.title,
          content: state.content,
          category: state.category,
          studyName: state.studyName,
          week: state.week,
          part: state.part,
          generationNumber: state.generationNumber,
          files: state.files
            .filter((f) => f.uploaded)
            .map(({ storageKey }) => storageKey),
        };
      },
    })),
    { name: 'PostStore' },
  ),
);
