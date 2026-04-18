import { formatShortDateTime } from '@/lib/formatTime';
import type {
  FileItem,
  DisplayFile,
  PostComment,
  MappedComment,
  BoardNavItem,
} from '@/types/board';

function toDisplayFile(file: FileItem): DisplayFile {
  return {
    id: file.fileId,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
  };
}

function isImageFileByType(contentType: string): boolean {
  return contentType.startsWith('image/');
}

/** UUID_원본파일명 형식에서 UUID 접두사 제거 */
function stripUuidPrefix(fileName: string): string {
  const idx = fileName.indexOf('_');
  return idx !== -1 ? fileName.slice(idx + 1) : fileName;
}

const DELETED_COMMENT_CONTENT = '삭제된 댓글입니다.';

function mapComment(comment: PostComment, currentUserId: number | null): MappedComment {
  const isDeleted = comment.isDeleted ?? comment.content === DELETED_COMMENT_CONTENT;
  return {
    id: comment.id,
    profileImage: comment.author.profileImageUrl,
    name: comment.author.name,
    content: comment.content,
    date: formatShortDateTime(comment.time),
    isAuthor: !isDeleted && currentUserId !== null && comment.author.id === currentUserId,
    isDeleted,
    replies: comment.children.map((child) => mapComment(child, currentUserId)),
  };
}

function toBoardNavItem(board: {
  id: number | null;
  name: string;
  type: 'ALL' | 'NOTICE' | 'GENERAL';
}): BoardNavItem {
  return { id: board.id, label: board.name, type: board.type };
}

export { toDisplayFile, isImageFileByType, stripUuidPrefix, mapComment, toBoardNavItem };
