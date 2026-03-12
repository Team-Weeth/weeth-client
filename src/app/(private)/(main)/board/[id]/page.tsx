import { PostDetailContent } from './PostDetailContent';
import { PostDetailLayout } from './PostDetailLayout';

interface PostDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostDetailPage({ params }: PostDetailPageProps) {
  const { id } = await params;

  return (
    <PostDetailLayout>
      <PostDetailContent id={id} />
    </PostDetailLayout>
  );
}
