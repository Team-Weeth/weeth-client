import { ImageList } from '@/components/board/ImageList/ImageList';
import type { DisplayFile } from '@/types/board';

interface PostCardImagesProps {
  className?: string;
  files: DisplayFile[];
  viewable?: boolean;
  showThumbnails?: boolean;
  priority?: boolean;
}

function PostCardImages({
  className,
  files,
  viewable,
  showThumbnails,
  priority,
}: PostCardImagesProps) {
  if (files.length === 0) return null;
  return (
    <div className={className}>
      <ImageList
        files={files}
        viewable={viewable}
        showThumbnails={showThumbnails}
        priority={priority}
      />
    </div>
  );
}

export { PostCardImages, type PostCardImagesProps };
