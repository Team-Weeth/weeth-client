import { create } from 'zustand';

interface FileItem {
  file: File;
  fileName: string;
  fileUrl: string;
  uploaded: boolean;
}

interface PostState {
  // 게시글 메타 정보
  board: string;
  title: string;
  cohort: number;
  part: string;
  category: string;
  studyName: string;
  week: number;

  // 에디터 본문
  content: string;

  // 파일 첨부
  files: FileItem[];

  // 게시글 상태
  status: 'DRAFT' | 'PUBLISHED';

  // Actions
  setBoard: (board: string) => void;
  setTitle: (title: string) => void;
  setCohort: (cohort: number) => void;
  setPart: (part: string) => void;
  setCategory: (category: string) => void;
  setStudyName: (studyName: string) => void;
  setWeek: (week: number) => void;
  setContent: (content: string) => void;
  addFile: (file: FileItem) => void;
  removeFile: (fileName: string) => void;
  updateFileUrl: (fileName: string, fileUrl: string) => void;
  setStatus: (status: 'DRAFT' | 'PUBLISHED') => void;
  reset: () => void;

  // API payload 변환
  getPayload: () => {
    title: string;
    content: string;
    category: string;
    studyName: string;
    week: number;
    part: string;
    cardinalNumber: number;
    files: { fileName: string; fileUrl: string }[];
  };
}

const initialState = {
  board: '',
  title: '',
  cohort: 0,
  part: '',
  category: '',
  studyName: '',
  week: 0,
  content: '',
  files: [],
  status: 'DRAFT' as const,
};

export const usePostStore = create<PostState>((set, get) => ({
  ...initialState,

  setBoard: (board) => set({ board }),
  setTitle: (title) => set({ title }),
  setCohort: (cohort) => set({ cohort }),
  setPart: (part) => set({ part }),
  setCategory: (category) => set({ category }),
  setStudyName: (studyName) => set({ studyName }),
  setWeek: (week) => set({ week }),
  setContent: (content) => set({ content }),

  addFile: (file) => set((state) => ({ files: [...state.files, file] })),

  removeFile: (fileName) =>
    set((state) => ({
      files: state.files.filter((f) => f.fileName !== fileName),
    })),

  updateFileUrl: (fileName, fileUrl) =>
    set((state) => ({
      files: state.files.map((f) =>
        f.fileName === fileName ? { ...f, fileUrl, uploaded: true } : f,
      ),
    })),

  setStatus: (status) => set({ status }),

  reset: () => set(initialState),

  // 제출 시 API payload 형태로 변환
  getPayload: () => {
    const state = get();
    return {
      title: state.title,
      content: state.content,
      category: state.category,
      studyName: state.studyName,
      week: state.week,
      part: state.part,
      cardinalNumber: state.cohort,
      files: state.files
        .filter((f) => f.uploaded)
        .map(({ fileName, fileUrl }) => ({ fileName, fileUrl })),
    };
  },
}));
