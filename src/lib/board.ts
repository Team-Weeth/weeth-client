import { formatShortDateTime } from '@/lib/formatTime';
import type { FileItem, DisplayFile, PostComment, MappedComment } from '@/types/board';
import type { BoardNavItem } from '@/components/board';

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

function mapComment(
  comment: PostComment,
  currentUserId: number | null,
): MappedComment {
  return {
    id: comment.id,
    profileImage: comment.author.profileImageUrl,
    name: comment.author.name,
    content: comment.content,
    date: formatShortDateTime(comment.time),
    isAuthor: currentUserId !== null && comment.author.id === currentUserId,
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

export { toDisplayFile, isImageFileByType, mapComment, toBoardNavItem };
