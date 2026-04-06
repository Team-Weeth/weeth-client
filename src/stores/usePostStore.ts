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
  /** 서버에서 불러온 기존 파일인지 여부 (수정 시 재전송 방지) */
  isExisting?: boolean;
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

      /**
       * 기존 게시글 상세 데이터로 스토어를 초기화 (수정 페이지 진입 시 사용)
       * - 내부적으로 reset을 수행한 뒤 PostDetail의 필드를 스토어 상태로 매핑
       */
      initFromDetail: (post: PostDetail) => {
        const { files } = get();
        for (const f of files) {
          if (f.fileUrl.startsWith('blob:')) URL.revokeObjectURL(f.fileUrl);
        }
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
