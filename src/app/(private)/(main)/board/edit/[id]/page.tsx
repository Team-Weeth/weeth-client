import { boardServerApi } from '@/lib/apis/board.server';
import { EditClientEditor } from './EditClientEditor';

interface PostEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const { id } = await params;
  // TODO: 추후 하드코딩된 clubId 제거 예정
  const response = await boardServerApi.getPostById('YUNJcjFKMO', Number(id));

  return (
    <main className="w-full">
      <EditClientEditor post={response.data} />
    </main>
  );
}
