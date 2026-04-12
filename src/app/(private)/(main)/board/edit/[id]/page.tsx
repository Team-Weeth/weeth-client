import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { boardServerApi } from '@/lib/apis/board.server';
import { CLUB_ID_KEY } from '@/lib/apis/cookies';
import { EditClientEditor } from './EditClientEditor';

interface PostEditPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostEditPage({ params }: PostEditPageProps) {
  const { id } = await params;
  const postId = Number(id);

  if (Number.isNaN(postId)) {
    notFound();
  }

  const clubId = (await cookies()).get(CLUB_ID_KEY)?.value;
  if (!clubId) redirect('/hub');
  const response = await boardServerApi.getPostById(clubId, postId).catch(() => null);

  if (!response?.data) {
    notFound();
  }

  return (
    <main className="w-full">
      <EditClientEditor post={response.data} />
    </main>
  );
}
