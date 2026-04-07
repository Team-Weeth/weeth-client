import { create } from 'zustand';
import { combine, devtools } from 'zustand/middleware';

import type { PostDetail } from '@/types/board';

export interface UploadFileItem {
  id: string;
  file?: File;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  uploaded: boolean;
  isExisting?: boolean;
}

interface Snapshot {
  title: string;
  content: string;
  fileIds: string[];
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
  files: [] as UploadFileItem[],
  status: 'DRAFT' as 'DRAFT' | 'PUBLISHED',
  _snapshot: null as Snapshot | null,
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

      addFile: (file: UploadFileItem) =>
        set((state) => ({ files: [...state.files, file] }), false, 'addFile'),

      addFiles: (newFiles: UploadFileItem[]) =>
        set((state) => ({ files: [...state.files, ...newFiles] }), false, 'addFiles'),

      removeFile: (id: string | number) =>
        set(
          (state) => {
            const target = state.files.find((f) => f.id === id);
            if (target?.fileUrl.startsWith('blob:')) URL.revokeObjectURL(target.fileUrl);
            return { files: state.files.filter((f) => f.id !== id) };
          },
          false,
          'removeFile',
        ),

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

      initFromDetail: (post: PostDetail) => {
        const { files } = get();
        for (const f of files) {
          if (f.fileUrl.startsWith('blob:')) URL.revokeObjectURL(f.fileUrl);
        }

        const fileIds = post.fileUrls.map((f) => String(f.fileId));
        set(
          {
            ...initialState,
            board: post.boardId,
            title: post.title,
            content: post.content,
            files: post.fileUrls.map((f) => ({
              id: String(f.fileId),
              fileName: f.fileName,
              fileUrl: f.fileUrl,
              storageKey: f.storageKey,
              fileSize: f.fileSize,
              contentType: f.contentType,
              uploaded: true,
              isExisting: true,
            })),
            _snapshot: { title: post.title, content: post.content, fileIds },
          },
          false,
          'initFromDetail',
        );
      },

      getPayload: (isEdit = false) => {
        const state = get();
        return {
          title: state.title,
          content: state.content,
          files: state.files
            .filter((f) => f.uploaded && !(isEdit && f.isExisting))
            .map((f) => ({
              fileName: f.fileName,
              storageKey: f.storageKey,
              fileSize: f.fileSize,
              contentType: f.contentType,
            })),
        };
      },
    })),
    { name: 'PostStore' },
  ),
);
