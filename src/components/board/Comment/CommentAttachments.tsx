import { FileList } from '@/components/board/FileList';
import { ImageList } from '@/components/board/ImageList/ImageList';
import type { DisplayFile } from '@/types/board';

interface CommentAttachmentsProps {
  imageFileUrls?: DisplayFile[];
  nonImageFileUrls?: DisplayFile[];
}

function CommentAttachments({ imageFileUrls, nonImageFileUrls }: CommentAttachmentsProps) {
  return (
    <>
      {imageFileUrls && imageFileUrls.length > 0 && <ImageList files={imageFileUrls} viewable />}
      {nonImageFileUrls && nonImageFileUrls.length > 0 && <FileList files={nonImageFileUrls} />}
    </>
  );
}

export { CommentAttachments, type CommentAttachmentsProps };
