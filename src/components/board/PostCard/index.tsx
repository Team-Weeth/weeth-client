import { PostCardRoot } from './PostCardRoot';
import { PostCardHeader } from './PostCardHeader';
import { PostCardImages, type PostCardImagesProps } from './PostCardImages';
import { PostAuthorInfo } from './PostAuthorInfo';
import { PostCardTitle } from './PostCardTitle';
import { PostCardBody } from './PostCardBody';
import { PostCardListContent } from './PostCardListContent';
import { PostCardDetailContent } from './PostCardDetailContent';
import { PostCardActions, type PostCardActionsProps } from './PostCardActions';

const PostCard = {
  Root: PostCardRoot,
  Header: PostCardHeader,
  Author: PostAuthorInfo,
  Title: PostCardTitle,
  Body: PostCardBody,
  ListContent: PostCardListContent,
  DetailContent: PostCardDetailContent,
  Images: PostCardImages,
  Actions: PostCardActions,
};

export { PostCard, type PostCardActionsProps, type PostCardImagesProps };
