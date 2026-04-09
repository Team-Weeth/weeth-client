export type FileStatus = 'UPLOADED' | 'PENDING' | 'DELETED';

/** API 응답 파일 (서버에서 받은 원본) */
export interface FileItem {
  fileId: number;
  fileName: string;
  fileUrl: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
  status: FileStatus;
}

/** 조회용 파일 (컴포넌트 표시 전용) */
export interface DisplayFile {
  id: string | number;
  fileName: string;
  fileUrl: string;
  uploaded?: boolean;
}

/** 게시글 작성 요청 파일 */
export interface CreatePostFile {
  fileName: string;
  storageKey: string;
  fileSize: number;
  contentType: string;
}
