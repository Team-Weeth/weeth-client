import { formatShortDateTime } from '@/lib/formatTime';
import type { FileItem, DisplayFile, PostComment } from '@/types/board';

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

function mapComment(comment: PostComment, currentUserId: number | null) {
  return {
    id: comment.id,
    profileImage: comment.author.profileImageUrl,
    name: comment.author.name,
    content: comment.content,
    date: formatShortDateTime(comment.time),
    isAuthor: currentUserId !== null && comment.author.id === currentUserId,
    replies: comment.children
      .map((child) =>
        typeof child === 'string'
          ? undefined
          : {
              id: child.id,
              profileImage: child.author.profileImageUrl,
              name: child.author.name,
              content: child.content,
              date: formatShortDateTime(child.time),
              isAuthor:
                currentUserId !== null && child.author.id === currentUserId,
            },
      )
      .filter(Boolean) as {
      id: number;
      profileImage: string;
      name: string;
      content: string;
      date: string;
      isAuthor: boolean;
    }[],
  };
}

export { toDisplayFile, isImageFileByType, mapComment };
